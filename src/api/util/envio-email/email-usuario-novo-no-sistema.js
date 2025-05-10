require('dotenv').config();
const { sendEmail } = require('../send-email');

class EmailUsuarioNovoNoSistema {
    constructor({email, senha}) {
        this.email = email;
        this.senha = senha;
        this.subject = 'Bem-vindo ao sistema de matrícula do IFMT-CBA';
        this.text = `Seja bem-vindo ao sistema de matrícula de cunho acadêmico do IFMT-CBA
            \n\nA partir da sua inscrição em um dos nossos editais, foi gerado um usuário em seu nome para que você possa acessar o sistema
            \n\nAs suas credenciais de acesso são:
            \n\t - Usuário: ${this.email}
            \n\t - Senha: ${this.senha}
            \n\nRealize o login no sistema e altere a sua senha para uma de sua preferência. Você pode fazer isso acessando o menu a esquerda na aplicação com o nome "Redefinir Senha".
            \nPara acessar o sistema, clique no link abaixo: 
            \n${process.env.FRONTEND_URL}
            `;
    }

    enviarEmail(callback) {
        const {email, subject, text} = this;
        const destinationEmail = email;
        return sendEmail({destinationEmail, subject, text, callback});
    }
}

module.exports = EmailUsuarioNovoNoSistema;