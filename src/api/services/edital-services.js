const connection = require('../../database/connection-mysql');
const EmailUsuarioNovoNoSistema = require('../util/envio-email/email-usuario-novo-no-sistema');
const EmailUsuarioNovoMatriculaNovaNoSistema = require('../util/envio-email/email-usuario-novo-matricula-nova-no-sistema');
const EmailUsuarioaCadastradoNoSistemaMatriculaNova = require('../util/envio-email/email-usuario-ja-cadastrado-no-sistema-matricula-nova');

class EditalServices {
 
    async enviarTodosOsEmails({usuariosNovosNoSistema, usuariosNovosNoSistemaComMatriculaNova, usuariosJaCadastradosNoSistemaComMatriculaNova}) {
        const errosObtidos = new Array();
        usuariosNovosNoSistema.forEach(usuario => {
            const queryObterNomeSenhaUsuario = `SELECT email, senha FROM usuario WHERE id_usuario = ?`;
            connection.query(queryObterNomeSenhaUsuario, [usuario.id_usuario_gerado], (err, results) => {
                if(err) {
                    errosObtidos.push('Erro ao obter email e senha do usuario do registro da linha ' + usuario.num_execucao);
                } else {
                    const emailUsuarioNovoNoSistema = new EmailUsuarioNovoNoSistema({email: results[0].email, senha: results[0].senha});
                    emailUsuarioNovoNoSistema.enviarEmail((err, data) => {
                        if(err) {
                            errosObtidos.push('Erro ao enviar email para ' + results[0].email);
                            console.log(err);
                        } else {
                            console.log('Email enviado com sucesso para ' + results[0].email);
                        }
                    });
                }
            });
        });
        usuariosNovosNoSistemaComMatriculaNova.forEach(usuario => {
            const queryObterNomeSenhaUsuario = `SELECT email, senha FROM usuario WHERE id_usuario = ?`;
            connection.query(queryObterNomeSenhaUsuario, [usuario.id_usuario_gerado], (err, results) => {
                if(err) {
                    errosObtidos.push('Erro ao obter email e senha do usuario do registro da linha ' + usuario.num_execucao);
                } else {
                    const emailUsuarioNovoMatriculaNovaNoSistema = new EmailUsuarioNovoMatriculaNovaNoSistema({email: results[0].email, senha: results[0].senha});
                    emailUsuarioNovoMatriculaNovaNoSistema.enviarEmail((err, data) => {
                        if(err) {
                            errosObtidos.push('Erro ao enviar email para ' + results[0].email);
                            console.log(err);
                        } else {
                            console.log('Email enviado com sucesso para ' + results[0].email);
                        }
                    });
                }
            });
        });
        usuariosJaCadastradosNoSistemaComMatriculaNova.forEach(usuario => {
            const queryObterEmailUsuario = `SELECT email FROM usuario WHERE id_usuario = 
                                                (SELECT id_usuario FROM aluno WHERE id_aluno = 
                                                    (SELECT id_aluno FROM matricula WHERE id_matricula = ?))`;	
            connection.query(queryObterEmailUsuario, [usuario.id_matricula_gerado], (err, results) => {
                if(err) {
                    errosObtidos.push('Erro ao obter email do usuario do registro da linha ' + usuario.num_execucao);
                } else {
                    if(results.length == 0) {
                        errosObtidos.push('Email não encontrado para o usuario do registro da linha ' + usuario.num_execucao);
                    } else {
                        const emailUsuarioJaCadastradoNoSistemaMatriculaNova = new EmailUsuarioaCadastradoNoSistemaMatriculaNova({email: results[0].email});
                        emailUsuarioJaCadastradoNoSistemaMatriculaNova.enviarEmail((err, data) => {
                            if(err) {
                                errosObtidos.push('Erro ao enviar email para ' + results[0].email);
                                console.log(err);
                            } else {
                                console.log('Email enviado com sucesso para ' + results[0].email);
                            }
                        });
                    }
                }
            });
        });

        return errosObtidos;
    }
}

module.exports = EditalServices;