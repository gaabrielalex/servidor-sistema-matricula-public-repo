const app = require('../../server');
const defaultInternalError = require('./util-routes');
const {verifyJWTToken} = require('./authentication');
const connection = require('../../database/connection-mysql');
const {obterProximoAvaliador} = require('./obter-proximo-avaliador');