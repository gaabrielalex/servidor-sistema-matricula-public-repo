const app = require('../../server');
const {verifyJWTToken} = require('../util/authentication');
const defaultInternalError = require('../util/util-routes');
const connection = require('../../database/connection-mysql');
const Avaliacao = require('../entities/avaliacao');
const MatriculaServices = require('../services/matricula-services');
const EmailAlunoMatriculaReprovada = require('../util/envio-email/email-aluno-matricula-reprovada');
const EmailAlunoMatriculaAprovada = require('../util/envio-email/email-aluno-matricula-aprovada');

//Configs
const path_route = '/avaliacoes';

app.post(path_route, verifyJWTToken, (req, res) => {
    try {
        if(req.body.id === undefined || req.body.id === null) {
            //Se o id não for informado, ele é setado como 0, isso é feito para que o método isValid() funcione corretamente
            //pois ele verifica se todas as propriedades do objeto são válidas, e se o id não for informado, ele será undefined
            //e o método isValid() retornará que o id está faltando, mesmo que ele não seja obrigatório para esse caso de criação
            //de usuário onde o id é gerado automaticamente pelo banco de dados.
            req.body.id = 1;
        };
        
        const avaliacao = new Avaliacao(req.body);
        const {error, valid} = avaliacao.isValid();
    
        if(!valid) {
            return res.status(400).json({
                error: error.join(',')
            });
        }

        const query = `INSERT INTO avaliacao (id_matricula, dt_avaliacao, status, comentarios)
                        VALUES (?, ?, ?, ?)`;
        const lastInsertIdQuery = "SELECT LAST_INSERT_ID() as id_avaliacao";        
        const values = [
            avaliacao.id_matricula,
            avaliacao.dt_avaliacao,
            avaliacao.status,
            avaliacao.comentarios
        ];

        connection.query(query, values, (err, results) => {
            if(!err) {
                if(results.affectedRows > 0) {
                    try {
                        connection.query(lastInsertIdQuery, (err, resultsInsercao) => {
                            if(!err) {
                                const novoStatus = avaliacao.status;
                                const id_matricula = avaliacao.id_matricula;
                                matriculaServices = new MatriculaServices();

                                matriculaServices.alterarStatausDaMatricula({novoStatus, id_matricula})
                                    .then((result) => {
                                        if(result !== null && result !== undefined) {

                                            const queryObterEmailAlunoPelaMatricula = 
                                                "SELECT email FROM aluno WHERE id_aluno = (SELECT id_aluno FROM matricula WHERE id_matricula = ?)";

                                            try {
                                                connection.query(queryObterEmailAlunoPelaMatricula, [avaliacao.id_matricula], (err, results) => {
                                                    if(!err) {
                                                        if(results.length > 0) {
                                                            const emailAluno = results[0].email;
                                                            
                                                            if(avaliacao.status === 'R') {
                                                                const linkReenvioMatricula = `${process.env.FRONTEND_URL}/matricula-aluno`;
                                                                const emailAlunoMatriculaReprovada = new EmailAlunoMatriculaReprovada({email: emailAluno, linkReenvioMatricula});
                                                                emailAlunoMatriculaReprovada.enviarEmail((err, data) => {
                                                                    if(err) {
                                                                        return res.status(500).json({
                                                                            error: "Houve um erro ao tentar enviar o email para o aluno" + err
                                                                        });
                                                                    } else {
                                                                        return res.status(200).json({
                                                                            success: "Resultado das operações: Avaliação salva com sucesso e email enviado com sucesso",
                                                                            id: resultsInsercao[0].id_avaliacao
                                                                        });
                                                                    }
                                                                });
                                                            } 
                                                            else if(avaliacao.status === 'A') {
                                                                const emailAlunoMatriculaAprovada = new EmailAlunoMatriculaAprovada({email: emailAluno});
                                                                emailAlunoMatriculaAprovada.enviarEmail((err, data) => {
                                                                    if(err) {
                                                                        return res.status(500).json({
                                                                            error: "Houve um erro ao tentar enviar o email para o aluno" + err
                                                                        });
                                                                    } else {
                                                                        return res.status(200).json({
                                                                            success: "Resultado das operações: Avaliação salva com sucesso e email enviado com sucesso",
                                                                            id: resultsInsercao[0].id_avaliacao
                                                                        });
                                                                    }
                                                                });
                                                            }
                                                        } else {
                                                            return res.status(500).json({
                                                                error: "Houve um erro ao tentar inserir a avaliação no banco de dados" + err
                                                            });
                                                        }
                                                    } else {
                                                        return res.status(500).json({
                                                            error: "Houve um erro ao tentar inserir a avaliação no banco de dados" + err
                                                        });
                                                    }
                                                });
                                            } catch (error) {
                                                return res.status(500).json({
                                                    error: "Houve um erro ao tentar inserir a avaliação no banco de dados" + err
                                                });
                                            }
                                        } 
                                    })
                                    .catch((err) => {
                                        return res.status(500).json({
                                            error: "Houve um erro ao tentar inserir a avaliação no banco de dados" + err
                                        });
                                    });
                                
                            } else {
                                return res.status(500).json({
                                    error: "Houve um erro ao tentar inserir a avaliação no banco de dados" + err
                                });
                            }
                        });
                    } catch (error) {
                        return res.status(500).json({
                            error: "Houve um erro ao tentar inserir a avaliação no banco de dados" + err
                        });
                    }
                } else {
                    return res.status(500).json({
                        error: "Houve um erro ao tentar inserir a avaliação no banco de dados" + err
                    });
                }
            } else {
                return res.status(500).json({
                    error: "Houve um erro ao tentar inserir a avaliação no banco de dados" + err
                });
            }
        });
        
    } catch (error) {
        defaultInternalError(res, error);
    }
});