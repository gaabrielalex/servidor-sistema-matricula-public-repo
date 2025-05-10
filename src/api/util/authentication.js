const jwt = require('jsonwebtoken');
const connection = require('../../database/connection-mysql');

//Lista local de token ativos
const tokenList = [];

function verifyJWTToken(req, res, next) {
    const token = req.headers['x-access-token'];

    //Modo de debug para não verificar o token
    //Desta forma, o token não é verificado e a aplicação pode ser testada sem a necessidade de um token válido
    //COloque true para ativar o modo de debug
    //Caso contrário, coloque false
    const modeDebug = true;
    if(modeDebug) {
        return next();
    }

    //Forma antiga de verificar se o token está ativo por meio do banco de dados
    //Verifica se o token está nos token ativos do banco de dados
    // const query = "SELECT * FROM token_ativo WHERE token = ?";
    // connection.query(query, [token], (err, results) => {
    //     if(err) {
    //         // return res.status(500).json({
    //         //     error: 'Internal Server Error: ' + err
    //         // });
    //         console.log(err);
    //     } else {
    //         if(results.length == 0) {
    //             // return res.status(401).json({
    //             //     error: 'Unauthorized access, token is invalid'
    //             // });
    //             console.log('Token não encontrado');
    //         }
    //     }
    // });

    //Verifica se o token está na lista de tokens ativos
    if(!tokenList.includes(token)) {
        return res.status(401).json({
            error: 'Unauthorized access, token is invalid'
        });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if(err) {
            return res.status(401).json({
                error: 'Unauthorized access, token is invalid'
            });
        }
        req.userId = decoded.id;
        next();
    });
}

//FUnção antiga para registrar token no banco de dados
// function registerToken(token) {
//     return new Promise((resolve, reject) => {
//         const query = "INSERT INTO token_ativo (token)" + 
//                     "VALUES (?)";

//         connection.query(query, [token], (err, results) => {
//             if(err) {
//                 reject(err);
//             } else {
//                 resolve();
//             }
//         });
//     }); 
// }

//Nova função para registrar token no banco de dados
function registerToken(token) {
    tokenList.push(token);

    //TEste
    console.log(tokenList);
}

//função para remover token da lista de tokens ativos
function removeToken(token) {
    const index = tokenList.indexOf(token);
    
    //Verifica se o token está na lista de tokens ativos
    //Caso não esteja, retorna false
    if(index == -1) {
        return false;
    }
    tokenList.splice(index, 1);

    console.log("Lista de token ao tentar realizar logout", tokenList);

    //Retorna true caso o token tenha sido removido com sucesso
    return true;

    //TEste
    console.log(tokenList);
}
    
module.exports = {
    verifyJWTToken,
    registerToken,
    removeToken
};