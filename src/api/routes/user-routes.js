const connection = require('../../database/connection-mysql');
const User = require('../entities/user');
const app = require('../../server');
const jwt = require('jsonwebtoken');
const {verifyJWTToken} = require('../util/authentication');
const {registerToken} = require('../util/authentication');
const {removeToken} = require('../util/authentication');
const defaultInternalError = require('../util/util-routes');

//Verifica se o usuário está logado
app.post('/validate-token', verifyJWTToken, (req, res) => {
    res.status(200).json({
        sucess: 'Token válido'
    });
});

app.post('/logout', (req, res) => {
    try {
        //Recupera o token do cabeçalho da requisição
        const token = req.headers['x-access-token'];
        
        if(token === undefined || token === null || token === '') {
            return res.status(400).json({
                error: 'Token não informado'
            });
        }

        //Remove o token da lista de tokens ativos
        const response = removeToken(token);

        if(!response) {
            return res.status(500).json({
                error: 'Token não encontrado, impossível deslogar um usuário que não está logado'
            });
        } else {
            res.status(200).json({
                sucess: 'Usuário deslogado com sucesso'
            });
        }
        
        //FOrm antiga de deletar token do banco de dados
        //Deleta o token do banco de dados
        // const query = "DELETE FROM token_ativo WHERE token = ?";
        // connection.query(query, [token], (err, results) => {
        //     if(!err) {
        //         res.status(200).json({
        //             sucess: 'User logged out with success'
        //         });
        //     } else {
        //         res.status(500).json({
        //             error: 'Internal Server Error: ' + err
        //         });
        //     }
        // });
    } catch(err) {
        return res.status(500).json({
            error: 'Internal Server Error: ' + err
        });
    }
});

app.post('/login', (req, res) => {
    try {
        const {email, senha} = req.body;
        const query = "SELECT * FROM usuario WHERE email = ? AND senha = ?";

        connection.query(query, [email, senha], (err, results) => {
            if(!err) {
                if(results.length > 0) {
                    const acessToken = jwt.sign({email: email}, process.env.ACCESS_TOKEN_SECRET);

                    // //Forma antiga de registrar token no banco de dados
                    // //Registra o token no banco de dados
                    // registerToken(acessToken).then(() => {
                    //     console.log('Token registrado com sucesso');
                    // }).catch((err) => {
                    //     if(!response) {
                    //         return res.status(500).json({
                    //             error: 'Internal Server Error: Error registering token - ' + err
                    //         });
                    //     } 
                    // });

                    //Registra o token na lista de tokens ativos
                    registerToken(acessToken);

                    res.status(200).json({
                        sucess: 'Usuário logado com sucesso',
                        acessToken: acessToken,
                        user: results[0],
                    });
                } else {
                    res.status(404).json({
                        error: 'Usuário ou senha incorretos'
                    });
                }
            } else {
                res.status(500).json({
                    error: 'Internal Server Error: ' + err
                });
            }
        });
    } catch(err) {
        return res.status(500).json({
            error: 'Internal Server Error: ' + err
        });
    }

});

app.post('/reset-password', verifyJWTToken, (req, res) => {
    try {
        const {email, senha_atual, nova_senha} = req.body;
        const queryParaVerrificarSenhaAtual = "SELECT * FROM usuario WHERE email = ? AND senha = ?";
        const queryParaAtualizarSenha = "UPDATE usuario SET senha = ? WHERE email = ?";

        console.log(email, senha_atual, nova_senha)

        connection.query(queryParaVerrificarSenhaAtual, [email, senha_atual], (err, results) => {
            if(!err) {
                if(results.length > 0) {
                   
                        connection.query(queryParaAtualizarSenha, [nova_senha, email], (err, results) => {
                            if(!err) {
                                res.status(200).json({
                                    sucess: 'Senha atualizada com sucesso'
                                });
                            } else {
                                res.status(500).json({
                                    error: 'Houve um erro ao atualizar a senha: ' + err
                                });
                            }
                        });
                } else {
                    console.log(results);
                    res.status(404).json({
                        error: 'A senha atual informada está incorreta'
                    });
                }
            } else {
                res.status(500).json({
                    error: 'Internal Server Error: ' + err
                });
            }
        });


    } catch(err) {
       defaultInternalError(res, err);
    }
});


///CRUD de usuários
app.get('/users', verifyJWTToken, (req, res) => {
    try {
        const query = "SELECT * FROM usuario";
        connection.query(query, (err, results) => {
            if(!err) {
                res.status(200).json(results);
            } else {
                res.status(500).json({
                    error: 'Internal Server Error: ' + err
                });
            }
        });
    } catch(err) {
        return res.status(500).json({
            error: 'Internal Server Error: ' + err
        });
    }
});

//Sem verificaça~de token pois no processo de registro(signup) o usuário ainda não está logado
app.post('/users', (req, res) => {
    try {
        if(req.body.id === undefined || req.body.id === null) {
            //Se o id não for informado, ele é setado como 0, isso é feito para que o método isValid() funcione corretamente
            //pois ele verifica se todas as propriedades do objeto são válidas, e se o id não for informado, ele será undefined
            //e o método isValid() retornará que o id está faltando, mesmo que ele não seja obrigatório para esse caso de criação
            //de usuário onde o id é gerado automaticamente pelo banco de dados.
            req.body.id = 1;
        };
        
        const user = new User(req.body);
        const {error, valid} = user.isValid();
    
        if(!valid) {
            return res.status(400).json({
                error: error.join(',')
            });
        }

        //Verifica se o usuário já foi registrado no banco de dados
        const queryVerificacao = "SELECT * FROM usuario WHERE email = ?";
        connection.query(queryVerificacao, [user.email], (err, results) => {
            if(!err) {
                if(results.length > 0) {
                    res.status(409).json({
                        error: 'Usuário já registrado'
                    });
                } else {
                    //Caso o usuário ainda não tenha sido regsitro no banco de dados, só assim ele será registrado
                    const queryRegistro =   "INSERT INTO usuario(nome, email, senha, tipo)" +
                                        "VALUES (?, ?, ?, ?);";
                    const lastInsertIdQuery = "SELECT LAST_INSERT_ID() as id";
                                    
                    const values = [user.nome, user.email, user.senha, user.tipo]
            
                    connection.query(queryRegistro, values, (err, results) => {
                        if(!err) {
                            connection.query(lastInsertIdQuery, (error, results) => {
                                if (error) {
                                    res.status(500).json({
                                        error: 'Internal Server Error: ' + err
                                    });
                                } else {
                                    res.status(201).json({
                                        sucess: 'Usuário registrado com sucesso',
                                        id: results[0].id
                                    });
                                }
                            });
                        } else {
                            res.status(500).json({
                                error: 'Internal Server Error: ' + err
                            });
                        }
                    });
                }
            } else {
                res.status(500).json({
                    error: 'Internal Server Error: ' + err
                });
            }
        });

    } catch(err) {
        return res.status(500).json({
            error: 'Internal Server Error: ' + err
        });
    }
})

app.patch('/users/:id', verifyJWTToken, (req, res) => {
    try {
        const user = new User(req.body);
        const {error, valid} = user.isValid();
    
        if(!valid) {
            return res.status(400).json({
                error: error.join(',')
            });
        }

        const query = "UPDATE usuario SET nome = ?, email = ?, senha = ?, tipo = ? WHERE id_usuario = ?";
        const values = [user.nome, user.email, user.senha, user.tipo, req.params.id];

        connection.query(query, values, (err, results) => {
            if(!err) {
                res.status(200).json({
                    sucess: 'Usuário atualizado com sucesso'
                });
            } else {
                res.status(500).json({
                    error: 'Internal Server Error: ' + err
                });
            }
        });
    } catch(err) {
        return res.status(500).json({
            error: 'Internal Server Error: ' + err
        });
    }
});

app.delete('/users/:id', verifyJWTToken, (req, res) => {
    try {
        const query = "DELETE FROM usuario WHERE id_usuario = ?";
        connection.query(query, [req.params.id], (err, results) => {
            if(!err) {
                res.status(200).json({
                    sucess: 'Usuário deletado com sucesso'
                });
            } else {
                res.status(500).json({
                    error: 'Internal Server Error: ' + err
                });
            }
        });
    } catch(err) {
        return res.status(500).json({
            error: 'Internal Server Error: ' + err
        });
    }
});

//Improvisei aqui no meu banco deveria ter uma tabela de tipos de usuário, mas o que eu 
//fiz foi restringer o campo tipo do usuário aos 3 valores possíveis, que são 'A" para admin,
//'V' para avaliador e 'L' para aluno
app.get('/users/types', verifyJWTToken, (req, res) => {
    try {
        res.status(200).json({
            types: ['A', 'V', 'L']
        });
    } catch(err) {
        return res.status(500).json({
            error: 'Internal Server Error: ' + err
        });
    }
});