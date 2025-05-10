class RowRegisteredStudentsSpreadsheet {

    constructor({number_row, nome, cpf, email, telefone, curso, classificacao, status}) {
        this.number_row = number_row;
        this.nome = nome;
        this.cpf = cpf;
        this.email = email;
        this.telefone = telefone;
        this.curso = curso;
        this.classificacao = classificacao;
        this.status = status;
    }
    
    toJSON() {
        return {
            number_row: this.number_row,
            nome: this.nome,
            cpf: this.cpf,
            email: this.email,
            telefone: this.telefone,
            curso: this.curso,
            classificacao: this.classificacao,
            status: this.status
        };
    }

    isValid() {
        const propertyNames = Object.getOwnPropertyNames(this)

        // Verifica se todos os campos estão preenchidos
        const amountInvalid = propertyNames
            .map(property => (!!this[property]) ? null : `${property} não foi informado!`)
            .filter(item => !!item)

        //Antes de prosseguir, verifica se todos os campos estão preenchidos
        if(amountInvalid.length > 0) {
            return {
                valid: false,
                error: amountInvalid
            }
        }
        
        //Verifica se o campo de número da linha é um número
        if(isNaN(this.number_row)) {
            amountInvalid.push('number_row não é um número!');
        }
    
        //Verifca se o cpf não é maior que 11 caracteres
        if(this.cpf.length > 11) {
            amountInvalid.push('cpf não pode ter mais de 11 caracteres!');
        }

        //Verifica se o campo de email é um email válido
        if(!this.email.includes('@') || !this.email.includes('.')) {
            amountInvalid.push('email não é válido!');
        }

        //Verifica se o email não é maior que 100 caracteres
        if(this.email.length > 100) {
            amountInvalid.push('email não pode ter mais de 100 caracteres!');
        }

        //Verifica se o telefone não é maior que 11 caracteres
        if(this.telefone.length > 14) {
            amountInvalid.push('telefone não pode ter mais de 14 caracteres!');
        }
        
        //Verifica se a classificação é um número
        if(isNaN(this.classificacao)) {
            amountInvalid.push('classificação não é um número!');
        }

        //Verifica se o status é uma string
        if(typeof this.status !== 'string') {
            amountInvalid.push('status não é um texto!');
        } 
        //Se for uma string verifica se o status é um dos valores válidos
        //A - Aprovado
        //C - Classificado
        else {
            this.status = this.status.toUpperCase();
            if(this.status !== 'A' && this.status !== 'C') {
    
                amountInvalid.push('status não é um valor válido! Valores válidos: A - Aprovado, C - Classificado');
            }
        }

        return {
            valid: amountInvalid.length === 0,
            error: amountInvalid
        }
    }
}

module.exports = RowRegisteredStudentsSpreadsheet;