const app = require('../../server');
const {verifyJWTToken} = require('../util/authentication');
const defaultInternalError = require('../util/util-routes');
const connection = require('../../database/connection-mysql');;
const expressAsyncHandler = require('express-async-handler');
const { query } = require('express');
const e = require('express');

//Configs
const path_route = '/matriculas-avaliacao';

//GET
app.get(`${path_route}/:id_avaliador`, verifyJWTToken, (req, res) => {
    try {
        const id_avaliador = req.params.id_avaliador;
        const query = `SELECT m.*, a.*
                        FROM matricula m, aluno a
                        WHERE id_usuario_avaliador_responsavel = ?
                            AND m.id_aluno = a.id_aluno`;
        const values = [id_avaliador];

        connection.query(query, values, (err, results) => {
            if(!err && results.length > 0) {
                res.status(200).json({
                    success: "Matriculas do avaliador encontradas com sucesso",
                    matriculas: results
                });

            } else {
                res.status(500).json({
                    error: 'Erro ao buscar matriculas do avaliador:' + err
                });
            }
        });
    } catch (error) {
        return defaultInternalError(res, error);
    }
});