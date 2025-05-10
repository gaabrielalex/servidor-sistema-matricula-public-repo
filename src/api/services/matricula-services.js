const connection = require('../../database/connection-mysql');
const { obterProximoAvaliador } = require('../util/obter-proximo-avaliador');
const EmailMatriculaCompletadaAvaliador = require('../util/envio-email/email-matricula-completada-avaliador');
require('dotenv').config();

class MatriculaServices {

    tratarAcoesNecessarisReferentesAoAvaliadorResponsavelPelaMatriculaCompleta({emailAluno}) {
        return new Promise((resolve, reject) => {
            obterProximoAvaliador().then((result) => {
                const avaliador = result;
                const idAvaliador = avaliador.id_usuario;
                this.alterarIdAvaliadorResponsavelPelaMatriculaCompletaNaTableMatricula(
                    {idAvaliador, emailAluno})
                    .then((result) => {
                        this.notficarAvaliadorResponsavelPelaMatriculaCompleta({avaliador, emailAluno})
                        .then((result) => {
                            resolve(result);
                        }).catch((err) => {
                            reject(err);
                        });
                    }).catch((err) => {
                        reject(err);
                    });
                
            }).catch((err) => {
                reject(err);
            });
        });
    }
    
    notficarAvaliadorResponsavelPelaMatriculaCompleta({avaliador, emailAluno}) {
        const email = avaliador.email;
        const linkAvaliacaoMatricula = `${process.env.FRONTEND_URL}/matriculas-avaliacao/avaliacao/${emailAluno}`;
        const emailMatriculaCompletadaAvaliador = new EmailMatriculaCompletadaAvaliador({email, emailAluno, linkAvaliacaoMatricula});
        return new Promise((resolve, reject) => {
            emailMatriculaCompletadaAvaliador.enviarEmail((err, data) => {
                if(err) {
                    reject(err);
                } else {
                    resolve('Availador notificado com sucesso');
                }
            });
        });
    }
    
    alterarIdAvaliadorResponsavelPelaMatriculaCompletaNaTableMatricula({idAvaliador, emailAluno}) {
        const query = "UPDATE matricula SET id_usuario_avaliador_responsavel = ? WHERE id_aluno = (SELECT id_aluno FROM aluno WHERE email = ?)";
        const values = [
            idAvaliador,
            emailAluno
        ];
        return new Promise((resolve, reject) => {
            connection.query(query, values, (err, results) => {
                if(err) {
                    reject(err);
                } else {
                    if(results.affectedRows > 0) {
                        resolve('Id do avaliador responsável pela matrícula completa alterado com sucesso');
                    } else {
                        reject('Erro ao alterar id do avaliador responsável pela matrícula completa');
                    }
                }
            });
        });
    }

    alterarStatausDaMatricula({novoStatus, id_matricula}) {
        const query = "UPDATE matricula SET status = ? WHERE id_matricula = ?";
        const values = [
            novoStatus,
            id_matricula
        ];
        return new Promise((resolve, reject) => {
            connection.query(query, values, (err, results) => {
                if(err) {
                    reject(err);
                } else {
                    if(results.affectedRows > 0) {
                        resolve('Status da matrícula alterado com sucesso');
                    } else {
                        reject('Erro ao alterar status da matrícula');
                    }
                }
            });
        });
    }
}

module.exports = MatriculaServices;