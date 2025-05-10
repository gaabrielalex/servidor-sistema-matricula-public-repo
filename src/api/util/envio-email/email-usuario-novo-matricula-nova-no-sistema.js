require('dotenv').config();
const { sendEmail } = require('../send-email');

class EmailUsuarioNovoMatriculaNovaNoSistema {
    constructor({email, senha}) {
        this.email = email;
        this.senha = senha;
        this.subject = 'Realize sua matrícula no IFMT-CBA';
        this.text = `
            \n\nParabéns! Você foi aprovado em um dos nossos editais. A partir de agora, você faz parte da comunidade acadêmica do IFMT-CBA.
            \n\nFoi gerado para você um usuário no sistema para que você possa acessa-lo e consiga realizar a sua matrícula. As suas credenciais de acesso são:
            \n\t - Usuário: ${this.email}
            \n\t - Senha: ${this.senha}
            \n\nSiga instruções abaixo:
            \n\t- Realize o login no sistema e altere a sua senha para uma de sua preferência. Você pode fazer isso acessando o menu a esquerda na aplicação com o nome "Redefinir Senha".
            \n\t- Após a alteração da senha, acesse o menu "Matrícula" e forneça as documentações necessárias para a sua matrícula.
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

module.exports = EmailUsuarioNovoMatriculaNovaNoSistema;