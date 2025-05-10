const connection = require('../../database/connection-mysql');
const fs = require('fs');
const path = 'controle-offset-avaliador.txt';

//Testar função de obter próximo avaliador
// obterProximoAvaliador().then((result) => {
//     console.log(result);
// }).catch((err) => {
//     console.log(err);
// });

function obterProximoAvaliador() {
    //Todos vez que essa função for chamada ele deve editar no arquivo texto "controle-offset-avaliador.txt" a ordem
    //do ultimo avaliador selecionado, para isso basta escrever no arquivo incrementando o valor do offset em 1

    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM obter_avaliadores LIMIT 1 OFFSET ?";
        const offset = atualizarOffsetAvaliador();

        connection.query(query, offset, (err, results) => {
            if(err) {
                reject(err);
            } else {
                if(results.length == 0) {
                    zerzarOffsetAvaliador();
                    //Se não houver mais avaliadores, zera o offset e tenta novamente
                    obterProximoAvaliador().then((result) => {
                        resolve(result);
                    }).catch((err) => {
                        reject(err);
                    });
                } else {
                    resolve(results[0]);
                }
            }
        });
    });
}

function atualizarOffsetAvaliador() {
    let offset = -1;

    // Tenta ler o arquivo e pegar o valor atual do offset
    try {
        const data = fs.readFileSync(path, 'utf8').trim();
        if (!isNaN(data)) {
            offset = parseInt(data, 10);
        }
    } catch (err) {
        if (err.code !== 'ENOENT') {
            console.error('Erro ao ler o arquivo:', err);
            return;
        }
        // Se o arquivo não existir (ENOENT), inicializa o offset com 0
    }

    // Incrementa o valor do offset
    const novoOffset = offset + 1;

    // Escreve o novo valor no arquivo
    fs.writeFileSync(path, novoOffset.toString(), 'utf8');

    return novoOffset;
}

function zerzarOffsetAvaliador() {
    fs.writeFileSync(path, '-1', 'utf8');
}

module.exports = { obterProximoAvaliador };