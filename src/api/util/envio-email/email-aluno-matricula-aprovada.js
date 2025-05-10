require('dotenv').config();
const { sendEmail } = require('../send-email');

class EmailAlunoMatriculaAprovada {
    constructor({email}) {
        this.email = email;
        this.subject = 'Matrícula aprovada';
        this.text = `
            \nOlá, tudo bem?
            \nA sua matrícula foi aprovada.
            \nSeja bem-vindo(a) a nossa instituição.
            `;
    }

    enviarEmail(callback) {
        const {email, subject, text} = this;
        const destinationEmail = email;
        return sendEmail({destinationEmail, subject, text, callback});
    }
    
}

module.exports = EmailAlunoMatriculaAprovada;