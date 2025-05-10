const app = require('../../server');
const {verifyJWTToken} = require('../util/authentication');
const defaultInternalError = require('../util/util-routes');
const connection = require('../../database/connection-mysql');

app.get('/aluno/:email', verifyJWTToken, (req, res) => {
    const email = req.params.email;
    const query = "SELECT * FROM aluno WHERE email = ?";
    const values = [
        email
    ];
    
    try {
        connection.query(query, values, (err, results) => {
            if(err) {
                res.status(500).json({
                    error: "Houve um erro ao buscar o aluno no banco de dados: " + err
                });
            } else {
                if(results.length > 0) {
                    res.status(200).json({
                        success: 'Aluno encontrado com sucesso',
                        aluno: results[0]
                    });
                } else {
                    res.status(404).json({
                        error: 'Aluno não encontrado'
                    });
                }
            }
        });
    } catch(err) {
        defaultInternalError(res, err);
    }
});

app.get('/aluno/:email/matricula', verifyJWTToken, (req, res) => {
    const email = req.params.email;
    const query = "SELECT * FROM matricula WHERE id_aluno = (SELECT id_aluno FROM aluno WHERE email = ?)";

    try {
        connection.query(query, [email], (err, results) => {
            if(!err) {
                if(results.length > 0) {
                    res.status(200).json({
                        success: 'Matrícula encontrada com sucesso',
                        matricula: results[0]
                    });
                } else {
                    res.status(404).json({
                        error: 'Matrícula não encontrada'
                    });
                }
            } else {
                res.status(500).json({
                    error: 'Houve um erro ao buscar a matrícula no banco de dados: ' + err
                });
            }
        });
    } catch(err) {
        defaultInternalError(res, err);
    }
});