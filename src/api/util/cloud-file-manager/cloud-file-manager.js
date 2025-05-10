const { initializeApp } = require("firebase/app");
const { getStorage, ref, getDownloadURL, uploadBytesResumable, deleteObject } = require("firebase/storage");
const firebaseConfig = require('../../../config/firebase-config');


class CloudFileManager {
       
       constructor() {
              //Initialize a firebase application
              initializeApp(firebaseConfig);

              // Initialize Cloud Storage and get a reference to the service
              this.storage = getStorage();
       }

       async uploadFile({destinationPath, file, possuiPadroIndentificacaoProprio = false}) {
              if(destinationPath == null) {    
                     throw new Error('O path do arquivo não pode ser nulo.');
              } else if (destinationPath.includes(' ') || destinationPath.includes('/') || destinationPath.includes('\\')){
                     throw new Error('O path do arquivo não pode conter espaços, barras ou contra barras.');
              }
              
              try {
                     const dateTime = new Date().toISOString();

                     let stringRef = `${destinationPath}/${file.originalname + "[" + dateTime}]`

                     if(possuiPadroIndentificacaoProprio) {
                            stringRef = `${destinationPath}/${file.originalname}`;
                     }
             
                     const storageRef = ref(this.storage, stringRef);
             
                     // Create file metadata including the content type
                     const metadata = {
                         contentType: file.mimetype,
                     };
             
                     // Upload the file in the bucket storage
                     const snapshot = await uploadBytesResumable(storageRef, file.buffer, metadata);
                     //by using uploadBytesResumable we can control the progress of uploading like pause, resume, cancel
             
                     // Grab the public url
                     const downloadURL = await getDownloadURL(snapshot.ref);
             
                     console.log('File successfully uploaded.');
                     return {
                            message: 'Arquivo enviado com sucesso para o Firebase Storage.',
                            name: file.originalname,
                            full_path: stringRef,
                            type: file.mimetype,
                            downloadURL: downloadURL
                     }
              } catch (error) {
                     console.log('Erro ao realizar upload de arquivo: ', error);
                     throw new Error('Erro ao realizar upload de arquivo: '+ error.message);
              }
       }
}

module.exports = CloudFileManager;