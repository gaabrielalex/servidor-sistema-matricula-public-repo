class Edital {
    constructor({id, nome, dt_abertura}) {
        this.id = id;
        this.nome = nome;
        this.dt_abertura = dt_abertura;
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

module.exports = Edital;