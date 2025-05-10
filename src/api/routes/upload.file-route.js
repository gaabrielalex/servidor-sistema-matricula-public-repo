const app = require('../../server');
const defaultInternalError = require('../util/util-routes');
const {verifyJWTToken} = require('../util/authentication');
const { initializeApp } = require("firebase/app");
const { getStorage, ref, getDownloadURL, uploadBytesResumable } = require("firebase/storage");
const firebaseConfig = require('../../config/firebase-config');
const multer = require("multer");

//Initialize a firebase application
initializeApp(firebaseConfig);

// Initialize Cloud Storage and get a reference to the service
const storage = getStorage();

// Setting up multer as a middleware to grab photo uploads
const upload = multer({ storage: multer.memoryStorage() });

//Path é a pasta onde o arquivo será salvo no Firebase Storage
app.post("/upload-files/:path", verifyJWTToken, upload.single("file"), async (req, res) => {
    try {
        if(req.params['path'] == null) {    
            return res.status(400).json({
                error: 'O path do arquivo não pode ser nulo.'
            });
        } else if (req.params['path'].includes(' ') || req.params['path'].includes('/') || req.params['path'].includes('\\')){
            return res.status(400).json({
                error: 'O path do arquivo não pode conter espaços, barras ou contra barras.'
            });
        }

        const dateTime = giveCurrentDateTime();

        const storageRef = ref(storage, `${req.params['path']}/${req.file.originalname + "       " + dateTime}`);

        // Create file metadata including the content type
        const metadata = {
            contentType: req.file.mimetype,
        };

        // Upload the file in the bucket storage
        const snapshot = await uploadBytesResumable(storageRef, req.file.buffer, metadata);
        //by using uploadBytesResumable we can control the progress of uploading like pause, resume, cancel

        // Grab the public url
        const downloadURL = await getDownloadURL(snapshot.ref);

        console.log('File successfully uploaded.');
        return res.send({
            message: 'Arquivo enviado com sucesso para o Firebase Storage.',
            name: req.file.originalname,
            type: req.file.mimetype,
            downloadURL: downloadURL
        })
    } catch (error) {
        return res.status(400).send('Erro ao realizar upload de arquivo: ', error.message);
    }
});

const giveCurrentDateTime = () => {
    const today = new Date();
    const date = today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear();
    const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const dateTime = date + ' ' + time;
    return dateTime;
}
