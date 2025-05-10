require('dotenv').config();
const { sendEmail } = require('../send-email');

class EmailAlunoMatriculaReprovada {
    constructor({email, linkReenvioMatricula}) {
        this.email = email;
        this.subject = 'Matrícula reprovada';
        this.text = `
            \nOlá, tudo bem?
            \nA sua matrícula foi reprovada. 
            \nAcesse o sistema para que você consiga entender o motivo da reprovação, bem como, reenviar a matrícula para que possamos a avaliar novamente.
            \n${linkReenvioMatricula}
            `;
    }

    enviarEmail(callback) {
        const {email, subject, text} = this;
        const destinationEmail = email;
        return sendEmail({destinationEmail, subject, text, callback});
    }
    
}

module.exports = EmailAlunoMatriculaReprovada;