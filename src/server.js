// Importa o pacote dotenv e carrega as variáveis de ambiente do arquivo .env
require('dotenv').config();

// Importa o módulo express para criação de aplicações web
const express = require('express');

// Cria uma instância da aplicação Express
const app = express();

// Importa o middleware cors para habilitar compartilhamento de recursos de origens diferentes (Cross-Origin Resource Sharing)
var cors = require('cors');

// Aplica o middleware cors à aplicação para permitir requisições de diferentes origens
app.use(cors());

// Aplica o middleware para analisar dados de formulários enviados no formato URLencoded
app.use(express.urlencoded({ extended: true }));

// Aplica o middleware para analisar requisições que enviam dados no formato JSON
app.use(express.json());

// Middleware de tratamento de erros global
app.use((err, req, res, next) => {
    console.error(err.stack); // Registra o erro no console
    res.status(500).send('Ocorreu um erro!'); // Envia uma resposta de erro ao cliente
  });

/* ------- Essas devem ser as últimas linhas de código, não colocar nada a baixo) ------- */
/* ------- NÂO ALTERAR A ORDEM DOS CÓDIGOS ABIXO ------- */
// Exporta a instância da aplicação Express para que possa ser utilizada em outros arquivos
module.exports = app;

// Importa o arquivo de rotas para que as rotas sejam carragadas pela aplicação
const route1 = require('./api/routes/user-routes');
const route2 = require('./api/util/util-routes');
const route3 = require('./api/routes/edital-route');
const route4 = require('./api/util/teste-routes');
const route5 = require('./api/routes/upload.file-route');
const route6 = require('./api/routes/matricula-route');
const route7 = require('./api/routes/matriculas-avaliacao-route');
const route8 = require('./api/routes/aluno-route');
const route9 = require('./api/routes/avaliacao-route');

//Realiza conexão com o mongodb
require('./database/connection-mongodb');

//Realiza conexão com o mysql
require('./database/connection-mysql');

//Realiza configurações do firebase
require('./config/firebase-config')

//Iniciando o servidor
app.listen(process.env.PORT);