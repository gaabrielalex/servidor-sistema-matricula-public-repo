require('dotenv').config();
const { sendEmail } = require('../send-email');

class EmailMatriculaCompletadaAvaliador {
    constructor({email, emailAluno, linkAvaliacaoMatricula}) {
        this.email = email;
        this.emailAluno = emailAluno;
        this.subject = 'Um nova matrícula foi atribuída para sua avaliação';
        this.text = `
            \nOlá, tudo bem?
            \n\nUma nova matrícula foi atribuída para a sua avaliação. Acesse o sistema para realizar a avaliação da matrícula.
            \nBasta procurar pelo menu " Matrículas(Avaliações)" e procurar pela matricula indentificada pelo email do aluno: ${emailAluno}. 
            \n\nCaso queira um acesso mais direto à avaliação, clique no link abaixo:
            \n${linkAvaliacaoMatricula}
            `;
    }

    enviarEmail(callback) {
        const {email, subject, text} = this;
        const destinationEmail = email;
        return sendEmail({destinationEmail, subject, text, callback});
    }
    
}

module.exports = EmailMatriculaCompletadaAvaliador;