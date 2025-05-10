
//Carregando os arquivos de teste
const test1 = require('./src/api/util/cloud-file-manager/cloud-file-manager.test.js');

//Método que chama todos os métodos void de um objeto
function callVoidMethods(obj) {
    for (const property in obj) {
      if (typeof obj[property] === 'function') {
        const method = obj[property];
        if (method.name !== 'constructor' && !method.hasOwnProperty('prototype')) { // Exclude constructor and inherited methods
          if (method.toString().indexOf('(') !== -1) { // Check if it's a void method (no return statement)
            method.call(obj); // Call the void method
          }
        }
      }
    }
}

module.exports = {
    callVoidMethods
}
