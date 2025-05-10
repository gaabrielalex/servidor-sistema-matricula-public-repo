
// jest.mock('./cloud-file-manager.js');
// const CloudFileManager = require('./cloud-file-manager.js');

// describe("Cloud File Manager", () => { 
//     beforeEach(() => {
//         jest.clearAllMocks();
//     });
   
//     it("should return an error when the path is null", () => {
//         const fileManager = new CloudFileManager();
//         const file = {
//             originalname: "file.txt",
//             mimetype: "text/plain",
//             buffer: Buffer.from("Hello World")
//         };
//         const destinationPath = null;

        
//         fileManager.uploadFile({destinationPath, file}).then(() => {
//             console.log('File uploaded successfully.');
//         }).catch((error) => {
//             expect(error.message).toBe('O path do arquivo não pode ser nulo.');
//         });

//     });

//     it("should return an error when the path contains spaces, slashes or backslashes", async () => {
//         //Arrange
//         const fileManager = new CloudFileManager();
//         const file = {
//             originalname: "file.txt",
//             mimetype: "text/plain",
//             buffer: Buffer.from("Hello World")
//         };
//         const destinationPath = "folder with spaces";

//         try {
//             //Act
//             await fileManager.uploadFile({destinationPath, file});
//         } catch (error) {
//             //Assert
//             expect(error.message).toBe('O path do arquivo não pode conter espaços, barras ou contra barras.');
//         }
//     });

//     it("should return an error when the upload fails", async () => {
//         //Arrange
//         const fileManager = new CloudFileManager();
//         const file = {
//             originalname: "file.txt",
//             mimetype: "text/plain",
//             buffer: Buffer.from("Hello World")
//         };
//         const destinationPath = "folder";

//         CloudFileManager.prototype.uploadFile.mockImplementation(() => {
//             throw new Error('Erro ao realizar upload de arquivo');
//         });

//         try {
//             //Act
//             await fileManager.uploadFile({destinationPath, file});
//         } catch (error) {
//             //Assert
//             expect(error.message).toBe('Erro ao realizar upload de arquivo');
//         }
//     });

//     it("should upload a file to the cloud", async () => {
//         //Arrange
//         const fileManager = new CloudFileManager();
//         const file = {
//             originalname: "file.txt",
//             mimetype: "text/plain",
//             buffer: Buffer.from("Hello World")
//         };
//         const destinationPath = "folder";

//         CloudFileManager.prototype.uploadFile.mockImplementation(() => {
//             return {
//                 message: 'Arquivo enviado com sucesso para o Firebase Storage.',
//                 name: 'file.txt',
//                 type: 'text/plain',
//                 downloadURL: 'https://storage.googleapis.com/bucket/folder/file.txt'
//             };
//         });

//         //Act
//         const result = await fileManager.uploadFile({destinationPath, file});

//         //Assert
//         expect(result.message).toBe('Arquivo enviado com sucesso para o Firebase Storage.');
//         expect(result.name).toBe('file.txt');
//         expect(result.type).toBe('text/plain');
//         expect(result.downloadURL).toBe('https://storage.googleapis.com/bucket/folder/file.txt');
//     });

//     it("should upload file in cloud - Real Teste(with integration)", async () => {
//         //Arrange
//         const fileManager = new CloudFileManager();
//         const file = {
//             originalname: "file.txt",
//             mimetype: "text/plain",
//             buffer: Buffer.from("Hello World")
//         };
//         const destinationPath = "folder";

//         //Act
//         expect(async () => {
//             await fileManager.uploadFile({destinationPath, file});
//         }).not.toThrow();

//         //Assert
//         expect(async () => {
//             try{
//                 await fileManager.deleteFile({destinationPath, fileName: file.originalname});
//             } catch (error) {
//                 throw new Error('Erro ao deletar arquivo, delete manualmente.');
//             }
//         });
//         expect(true).toBe(true);
//     });

//     it("should return true when the file exists in the cloud", async () => {
//         //Arrange
//         const fileManager = new CloudFileManager();
//         const destinationPath = "folder";
//         const fileName = "file.txt";
//         const file = {
//             originalname: "file.txt",
//             mimetype: "text/plain",
//             buffer: Buffer.from("Hello World")
//         };

//         expect(async () => {
//             await fileManager.uploadFile({destinationPath, file});
//         }).not.toThrow();
        
//         //Act
//         result = await fileManager.fileIsExistsInCloud({destinationPath, fileName});

//         //Assert
//         if(result) {
//             expect(async () => {
//                 try{
//                     await fileManager.deleteFile({destinationPath, fileName});
//                 } catch (error) {
//                     throw new Error('Erro ao deletar arquivo, delete manualmente.');
//                 }
//             }).not.toThrow();
//         } 

//         expect(result).toBe(true);

//     });

//     it("should delete file in cloud - Real Teste(with integration)", async () => {
//         //Arrange
//         const fileManager = new CloudFileManager();
//         const file = {
//             originalname: "file.txt",
//             mimetype: "text/plain",
//             buffer: Buffer.from("Hello World")
//         };
//         const destinationPath = "folder";

//         //Act
//         try {
//             await fileManager.uploadFile({destinationPath, file});
//         } catch (error) {
//             throw new Error('Erro ao realizar upload de arquivo.');
//         }

//         //Assert
//         expect(() => {
//             fileManager.deleteFile({destinationPath, fileName: file.originalname}).then(() => {
//                 console.log('File deleted successfully.');
//             }).catch((error) => {
//                 throw new Error('Erro ao deletar arquivo: ', error.message, error.code);
//             });
//         }).not.toThrow();
   
//     });
// });