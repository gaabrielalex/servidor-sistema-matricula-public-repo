const app = require('../../server');
const {verifyJWTToken} = require('../util/authentication');
const defaultInternalError = require('../util/util-routes');
const connection = require('../../database/connection-mysql');
const multer = require("multer");
const CloudFileManager = require('../util/cloud-file-manager/cloud-file-manager');
const expressAsyncHandler = require('express-async-handler');
const MatriculaServices = require('../services/matricula-services');

//Configs
const path_route = '/matricula';
// Setting up multer as a middleware to archive uploads in memory
const upload = multer({ storage: multer.memoryStorage() });

//Services
const matriculaServices = new MatriculaServices();

//Path de aramzenamento no Firebase Storage das documentações das matrículas
const docsRegistrationsPathStorage = 'docs-matriculas';

//Routes
app.get(path_route +'/:email_aluno', verifyJWTToken, (req, res) => {
    const query = "SELECT * FROM matricula WHERE id_aluno = (SELECT id_aluno FROM aluno WHERE email = ?)";

    connection.query(query, [req.params['email_aluno']], (err, results) => {
        if(!err) {
            res.json(results);
        } else {
            res.status(500).json({
                error: 'Erro ao buscar matrícula pelo email do aluno: ' + err
            });
        }
    });
});

app.patch('/efetivar-matricula/:email_aluno', verifyJWTToken, upload.single("pdf_docs_matricula"), expressAsyncHandler(async (req, res) => {
    try {
        const email_aluno = req.params['email_aluno'];
        let resultadoOperacoes = new Array();
        let src_cloud_docs_matricula;

        //Fazemos o upload no arquivo e obtemos o caminho do arquivo no cloud
        const fileManager = new CloudFileManager();
    
        const fileToUpload = req.file;
        
        //Renomeamos o arquivo para o email do aluno que assim será a forma de identificar unicamente o arquivo no cloud
        fileToUpload.originalname = email_aluno + ".pdf";

        await fileManager.uploadFile({destinationPath: docsRegistrationsPathStorage, file: fileToUpload, possuiPadroIndentificacaoProprio: true})
            .catch((error) => {
                res.status(500).json({
                    error: 'Erro ao efetivar matrícula: ' + error
                });
            })
            .then((resultado_upload) => {
                src_cloud_docs_matricula = resultado_upload.downloadURL;
                resultadoOperacoes.push("Upload de arquivo realizado com sucesso");

                //Efetivamos a matrícula, alterando as informações necessárias na matricula do aluno registrada no banco de dados
                //que seria o status, que vai de "I"(Imcompleta) para "C"(Completa)
                //e o caminho do arquivo na nuvem

                const query = "UPDATE matricula SET status = 'C', src_documentacoes = ? WHERE id_aluno = (SELECT id_aluno FROM aluno WHERE email = ?)";
                connection.query(query, [src_cloud_docs_matricula, email_aluno], (err, results) => {
                    if(!err) {
                        resultadoOperacoes.push("Matrícula efetivada com sucesso.");

                        //Tratamos as ações necessárias referentes ao avaliador responsável pela matrícula completa
                        matriculaServices.tratarAcoesNecessarisReferentesAoAvaliadorResponsavelPelaMatriculaCompleta({emailAluno: email_aluno})
                            .then((result) => {
                                resultadoOperacoes.push(result);

                                res.status(200).json({
                                    success: "Resultado das operações: " + resultadoOperacoes.join(", "),
                                    resultado_upload: resultado_upload
                                });
                            })
                            .catch((err) => {
                                res.status(500).json({
                                    error: 'Erro ao efetivar matrícula: ' + err
                                });
                            });
                    } else {
                        res.status(500).json({
                            error: 'Erro ao efetivar matrícula: ' + err
                        });
                    }
                });
            });
    } catch (error) {
        res.status(500).json({
            error: 'Erro ao efetivar matrícula: ' + error
        });
    }

}));

app.patch('/editar-matricula/:email_aluno', verifyJWTToken, upload.single("pdf_docs_matricula"), expressAsyncHandler(async (req, res) => {
    try {
        const email_aluno = req.params['email_aluno'];
        let resultadoOperacoes = new Array();
        let src_cloud_docs_matricula;

        //Fazemos o upload no arquivo e obtemos o caminho do arquivo no cloud
        const fileManager = new CloudFileManager();
    
        const fileToUpload = req.file;
        
        //Renomeamos o arquivo para o email do aluno que assim será a forma de identificar unicamente o arquivo no cloud
        fileToUpload.originalname = email_aluno + ".pdf";

        await fileManager.uploadFile({destinationPath: docsRegistrationsPathStorage, file: fileToUpload, possuiPadroIndentificacaoProprio: true})
            .catch((error) => {
                res.status(500).json({
                    error: 'Erro ao editar matrícula: ' + error
                });
            })
            .then((resultado_upload) => {
                src_cloud_docs_matricula = resultado_upload.downloadURL;
                resultadoOperacoes.push("Upload de arquivo realizado com sucesso");

                //O statys da matricula é o mesmo já que apenas as documentações estão sendo alteradas
                //Logo, apenas o caminho do arquivo na nuvem é alterado

                const query = "UPDATE matricula SET src_documentacoes = ? WHERE id_aluno = (SELECT id_aluno FROM aluno WHERE email = ?)";
                connection.query(query, [src_cloud_docs_matricula, email_aluno], (err, results) => {
                    if(!err) {
                        resultadoOperacoes.push("Matrícula editada com sucesso.");
                        res.status(200).json({
                            success: "Resultado das operações: " + resultadoOperacoes.join(", "),
                            resultado_upload: resultado_upload
                        });
                    } else {
                        res.status(500).json({
                            error: 'Erro ao editar matrícula: ' + err
                        });
                    }
                });
            });
    } catch (error) {
        res.status(500).json({
            error: 'Erro ao editar matrícula: ' + error
        });
    }

}));

app.patch('/reenviar-matricula/:email_aluno', verifyJWTToken, upload.single("pdf_docs_matricula"), expressAsyncHandler(async (req, res) => {
    try {
        const email_aluno = req.params['email_aluno'];
        let resultadoOperacoes = new Array();
        let src_cloud_docs_matricula;

        //Fazemos o upload no arquivo e obtemos o caminho do arquivo no cloud
        const fileManager = new CloudFileManager();
    
        const fileToUpload = req.file;
        
        //Renomeamos o arquivo para o email do aluno que assim será a forma de identificar unicamente o arquivo no cloud
        fileToUpload.originalname = email_aluno + ".pdf";

        await fileManager.uploadFile({destinationPath: docsRegistrationsPathStorage, file: fileToUpload, possuiPadroIndentificacaoProprio: true})
            .catch((error) => {
                res.status(500).json({
                    error: 'Erro ao reenviar matrícula: ' + error
                });
            })
            .then((resultado_upload) => {
                src_cloud_docs_matricula = resultado_upload.downloadURL;
                resultadoOperacoes.push("Upload de arquivo realizado com sucesso");

                //Ao reenviar a matricula o status retornra do "R"(Rejeitada) para "C"(Completa) e o caminho do arquivo na nuvem é alterado

                const query = "UPDATE matricula SET status = 'C', src_documentacoes = ? WHERE id_aluno = (SELECT id_aluno FROM aluno WHERE email = ?)";
                connection.query(query, [src_cloud_docs_matricula, email_aluno], (err, results) => {
                    if(!err) {
                        resultadoOperacoes.push("Matricula reenviada com sucesso.");

                        //Tratamos as ações necessárias referentes ao avaliador responsável pela matrícula completa
                        matriculaServices.tratarAcoesNecessarisReferentesAoAvaliadorResponsavelPelaMatriculaCompleta({emailAluno: email_aluno})
                            .then((result) => {
                                resultadoOperacoes.push(result);

                                res.status(200).json({
                                    success: "Resultado das operações: " + resultadoOperacoes.join(", "),
                                    resultado_upload: resultado_upload
                                });
                            })
                            .catch((err) => {
                                res.status(500).json({
                                    error: 'Erro ao reenviar matrícula: ' + err
                                });
                            });
                    } else {
                        res.status(500).json({
                            error: 'Erro ao reenviar matrícula: ' + err
                        });
                    }
                });
            });
    } catch (error) {
        res.status(500).json({
            error: 'Erro ao reenviar matrícula: ' + error
        });
    }

}));


app.get(path_route + "/:email_aluno/documentacoes", verifyJWTToken, (req, res) => {
    try {
        const emailAluno = req.params['email_aluno'];

        const query = "SELECT src_documentacoes FROM matricula WHERE id_aluno = (SELECT id_aluno FROM aluno WHERE email = ?)";
        const values = [
            emailAluno
        ]

        connection.query(query, values, async (err, results) => {
            if(!err) {
                if(results.length == 0) {
                    res.status(404).json({
                        error: 'Documentações do aluno não encontradas.'
                    });
                } else {
                    const downloadURL = results[0].src_documentacoes;
                    
                    res.status(200).json({
                        message: 'Documentações do aluno obtidas com sucesso.',
                        downloadURL: downloadURL
                    });
                }
            } else {
                res.status(500).json({
                    error: 'Houve um erro ao obter as documentações do aluno ' + err 
                });
            }
        });      

    } catch (error) {
        res.status(500).json({
            error: 'Houve um erro ao obter as documentações do aluno ' + error 
        });
    }
});

app.get(path_route + "/:id_matricula/aluno", verifyJWTToken, (req, res) => {
    try {
        const id_matricula = req.params['id_matricula'];

        const query = "SELECT a.* FROM matricula m, aluno a WHERE m.id_aluno = a.id_aluno AND m.id_matricula = ?";
        const values = [
            id_matricula
        ]

        connection.query(query, values, (err, results) => {
            if(!err) {
                res.status(200).json({
                    success: 'Aluno obtido com sucesso.',
                    aluno: results[0]
                });
            } else {
                res.status(500).json({
                    error: 'Houve um erro ao obter o aluno ' + err 
                });
            }
        });      

    } catch (error) {
        res.status(500).json({
            error: 'Houve um erro ao obter o aluno ' + error 
        });
    }
});

app.get(path_route + "/:id_matricula/ultima-avaliacao", verifyJWTToken, (req, res) => {
    try {
        const id_matricula = req.params['id_matricula'];

        const query = "SELECT * FROM avaliacao WHERE id_matricula = ? ORDER BY dt_avaliacao DESC, id_avaliacao DESC LIMIT 1";
        const values = [
            id_matricula
        ]

        connection.query(query, values, (err, results) => {
            if(!err) {
                if (results.length == 0) {
                    res.status(404).json({
                        error: 'Última avaliação não encontrada.'
                    });
                    
                } else {
                    res.status(200).json({
                        success: 'Última avaliação obtida com sucesso.',
                        avaliacao: results[0]
                    });
                }
            } else {
                res.status(500).json({
                    error: 'Houve um erro ao obter a última avaliação ' + err 
                });
            }
        });      

    } catch (error) {
        res.status(500).json({
            error: 'Houve um erro ao obter a última avaliação ' + error 
        });
    }
});