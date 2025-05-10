class Avaliacao {
    constructor({id, id_matricula, dt_avaliacao, status, comentarios}) {
        this.id = id;
        this.id_matricula = id_matricula;
        this.dt_avaliacao = dt_avaliacao;
        this.status = status;
        this.comentarios = comentarios;
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

module.exports = Avaliacao;