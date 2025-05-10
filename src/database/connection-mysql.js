// Importa o módulo mysql para interagir com o banco de dados MySQL
const mysql = require('mysql2');

// Importa o pacote dotenv e carrega as variáveis de ambiente do arquivo.env
require('dotenv').config();

let connection;

if(process.env.EH_PRODUCAO === 'true') {
    // Cria uma conexão a partir da string de conexão
    connection = mysql.createConnection(process.env.PROD_CONNECTION_STRING);

} else {
    // Cria uma conexão com o banco de dados MySQL
    connection = mysql.createConnection({
        // Define as configurações da conexão usando variáveis de ambiente
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        // Especificando o método de autenticação 
        authPlugins: { mysql_clear_password: () => () => Buffer.from(process.env.DB_PASSWORD) 
        }
    }); 
}

// Tenta estabelecer a conexão com o banco de dados
connection.connect((err) => { 
    // Se a conexão for bem-sucedida, um registro é impresso no console
    if (!err) { 
        console.log("Conexão com o banco de dados MySQL estabelecida com sucesso!");
    } 
    else {
    // Se houver um erro de conexão, o erro é impresso no console
        console.log(err); 
    } 
});

// Exporta a conexão para que possa ser utilizada em outros arquivos
module.exports = connection;