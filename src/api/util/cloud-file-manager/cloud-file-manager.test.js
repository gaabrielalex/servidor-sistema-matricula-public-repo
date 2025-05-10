

// //Impportações necessárias
// const CloudFileManager = require('./cloud-file-manager.js');

// //Chamando cada método void da classe CloudFileManager

// shouldReturnAnErrorWhenThePathIsNull();
// shouldReturnAnErrorWhenThePathContainsSpacesSlashesOrBackslashes()
// shouldReturnAnErrorWhenTheUploadFails()
// shouldUploadAFileToTheCloud()
// shouldReturnTrueWhenTheFileExistsInTheCloud()
// shouldDeleteFileInTheCloud()

// //Métodos de teste

// function shouldReturnAnErrorWhenThePathIsNull() {
//     let houveErro = false;

//     //Arrange
//     const fileManager = new CloudFileManager();
//     const file = {
//         originalname: "file.txt",
//         mimetype: "text/plain",
//         buffer: Buffer.from("Hello World")
//     };
//     const destinationPath =   null;

//     //Act
//     fileManager.uploadFile({destinationPath, file})
//     .catch((error) => {  
//         houveErro = true;
        
//         //Assert
//         console.log('Teste - shouldReturnAnErrorWhenThePathIsNull passou com sucesso.');
//     })
//     //Then embaixo do catch caso eu queria lançar uma exceção como resultado do teste, se for em cima nesses caosos o cactch vai capturar a exceção e o teste vai passar
//     .then(() => {
//         //Se não houve erro, lança uma exceção, pq era esperado que houvesse um erro
//         if(!houveErro){
//             throw new Error('Era esperado que o método lançasse uma exceção. Impedindo que o destino do arquivo seja nulo.');
//         }
//     });
// }

// function shouldReturnAnErrorWhenThePathContainsSpacesSlashesOrBackslashes() {
//     let houveErro = false;

//     //Arrange
//     const fileManager = new CloudFileManager();
//     const file = {
//         originalname: "file.txt",
//         mimetype: "text/plain",
//         buffer: Buffer.from("Hello World")
//     };
//     const destinationPath = "folder with spaces";

//     //Act
//     fileManager.uploadFile({destinationPath, file})
//     .catch((error) => {
//         houveErro = true;
//         //Assert
//         console.log('Teste - shouldReturnAnErrorWhenThePathContainsSpacesSlashesOrBackslashes passou com sucesso.');
//     })
//     .then(() => {
//         //Se não houve erro, lança uma exceção, pq era esperado que houvesse um erro
//         if(!houveErro){
//             throw new Error('Era esperado que o método lançasse uma exceção. Impedindo que o destino do arquivo contenha espaços, barras ou contra barras.');
//         }
//     });
// }

// async function shouldReturnAnErrorWhenTheUploadFails()  {
//     let houveErro = false;

//     //Arrange
//     const fileManager = new CloudFileManager();
//     const file = {
//         originalname: "file.txt",
//         mimetype: "text/plain",
//         buffer: Buffer.from("Hello World")
//     };
//     const destinationPath = "folder";

//     //Act
//     try {

//         await fileManager.uploadFile({destinationPath, file})
//         .catch((error) => {
//             houveErro = true;
//             //Assert
//             console.log('Teste - shouldReturnAnErrorWhenTheUploadFails passou com sucesso.');
//         })
//         .then(() => {
            
//         });
//     } catch (error) {
//         //Se não houve erro, lança uma exceção, pq era esperado que houvesse um erro
//         if(!houveErro){
//             throw new Error('Era esperado que o método lançasse uma exceção. Impedindo que o upload do arquivo fosse realizado com sucesso.');
//         }
//     }
// }

// async function shouldUploadAFileToTheCloud() {
//     //Arrange
//     const fileManager = new CloudFileManager();
//     const file = {
//         originalname: "file.txt",
//         mimetype: "text/plain",
//         buffer: Buffer.from("Hello World")
//     };
//     const destinationPath = "folder";

//     //Act
//     const resultado = await fileManager.uploadFile({destinationPath, file}).catch((error) => {
//         //Assert
//         throw new Error('Erro ao realizar upload de arquivo: ', error.message);
//     }).then((resultado) => {
//         //Assert
//         if(resultado.message !== 'Arquivo enviado com sucesso para o Firebase Storage.'){
//             throw new Error('Erro ao realizar upload de arquivo: ', error.message);
//         } else {
//             console.log('Teste - shouldUploadAFileToTheCloud passou com sucesso.');
//         }
//     });

// }


// async function shouldReturnTrueWhenTheFileExistsInTheCloud() {
//     //Arrange
//     const fileManager = new CloudFileManager();
//     const fileName = "file.txt";
//     const file = {
//         originalname: "file.txt",
//         mimetype: "text/plain",
//         buffer: Buffer.from("Hello World")
//     };
//     const destinationPath = "folder";

//     await fileManager.uploadFile({destinationPath, file})
//         .catch((error) => {
//             throw new Error('Erro ao realizar upload de arquivo:'+ error.message);
//         })
//         .then((resultado) => {  
//             const pathFileCloud = resultado.full_path;
//             //Act
//             fileManager.fileIsExistsInCloud({pathFileCloud}).catch((error) => {
//                 //Assert
//                 throw new Error('Erro ao verificar se o arquivo existe no cloud: '+ error.message);
//             }).then((resultado) => {
//                 //Assert
//                 if(resultado !== true){
//                     throw new Error('Erro ao verificar se o arquivo existe no cloud, deveria retornar true, mas retornou false.');
//                 } else {
//                     console.log('Teste - shouldReturnTrueWhenTheFileExistsInTheCloud passou com sucesso.');
//                 }
//             });
//         });
// }

// function shouldDeleteFileInTheCloud() {
//     //Arrange
//     const fileManager = new CloudFileManager();
//     const fileName = "filaaaaaaaaaaa.txt";
//     const file = {
//         originalname: "file.txt",
//         mimetype: "text/plain",
//         buffer: Buffer.from("Hello World")
//     };
//     const destinationPath = "folder";

//     fileManager.uploadFile({destinationPath, file})
//         .catch((error) => {
//             throw new Error('Erro ao realizar upload de arquivo: ', error.message);
//         })
//         .then((resultado) => {  
//             const pathFileCloud = resultado.full_path;
//             //Act
//             fileManager.deleteFile({pathFileCloud}).catch((error) => {
//                 //Assert
//                 throw new Error('Erro ao deletar arquivo no cloud: '+ error.cod + error.message);
//             }).then(() => {
//                 console.log('Teste - shouldDeleteFileInTheCloud passou com sucesso.');
//             });
//         });
// }
