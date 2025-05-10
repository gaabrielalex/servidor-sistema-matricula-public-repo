const nodemailer = require('nodemailer');
require('dotenv').config();

const transport = nodemailer.createTransport({
    host: process.env.EMAIL_SENDER_HOST,
    port: process.env.EMAIL_SENDER_PORT,
    secure: process.env.EMAIL_SENDER_SECURE,
    auth: {
        user: process.env.EMAIL_SENDER_USER,
        pass: process.env.EMAIL_SENDER_PASSWORD
    }
});

//Ele tenta carregar o html, caso não consiga, ele carrega o texto
//Subject é o assunto do email
function sendEmail({destinationEmail, subject, html, text, callback}) {
    const message = {
        from: 'Sistema Matrícula <' + process.env.EMAIL_SENDER_USER + '>',
        to: destinationEmail,
        subject: subject,
        html: html,
        text: text
    };

    transport.sendMail(message, callback);
}

module.exports = { sendEmail };