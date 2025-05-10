
class Matricula {
    constructor({id, id_aluno, src_documentacoes, status}) {
        this.id = id;
        this.id_aluno = id_aluno;
        this.src_documentacoes = src_documentacoes;
        this.status = status;
    }

    isValid() {
        const propertyNames = Object.getOwnPropertyNames(this)
        const amountInvalid = propertyNames
            .map(property => (!!this[property]) ? null : `${property} is missing!`)
            .filter(item => !!item)
            
        return {
            valid: amountInvalid.length === 0,
            error: amountInvalid
        }
    }
}

module.exports = Matricula;