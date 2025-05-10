require('dotenv').config();
const { sendEmail } = require('../send-email');

class EmailUsuarioaCadastradoNoSistemaMatriculaNova {
    constructor({email}) {
        this.email = email;
        this.subject = 'Realize sua matrícula no IFMT-CBA';
        this.text = `
            \nParabéns! Você foi aprovado em um dos nossos editais. A partir de agora, você faz parte da comunidade acadêmica do IFMT-CBA.
            \n\nAcesse o sistema para realizar a sua matrícula. Basta procurar pelo menu "Matrícula" e fornecer as documentações necessárias para que a sua matrícula seja realizada.
            \n\nPara acessar o sistema, clique no link abaixo: 
            \n${process.env.FRONTEND_URL}
            `;
    }

    enviarEmail(callback) {
        const {email, subject, text} = this;
        const destinationEmail = email;
        return sendEmail({destinationEmail, subject, text, callback});
    }
    
}

module.exports = EmailUsuarioaCadastradoNoSistemaMatriculaNova;