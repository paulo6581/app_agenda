const mongoose = require('mongoose');
const validator = require('validator');

const ContatoSchema = new mongoose.Schema({
    nome: {type: String, required: true},
    sobrenome: {type: String, required: false, default: ''},
    email: {type: String, required: false, default: ''},
    telefone: {type: String, required: false, default: ''},
    idUser: { type: String, required: false },
    createDate: {type: Date, default: Date.now}
}, 
    {collection: 'contatos'}
);

const ContatoModel = mongoose.model('Contato', ContatoSchema);

class Contato {
    constructor(body, idUser) {
        this.body = body;
        this.user = idUser;
        this.errors = [];
        this.contato = null;
    }

    async register() {
        this.validates();
        if (this.errors.length > 0) return;
        this.contato = await ContatoModel.create(this.body);

    }

    validates() {
        this.cleanUp();
        // validation - the email must be valid
        if (this.body.email && !validator.isEmail(this.body.email)) this.errors.push('E-mail inválido');
        if (!this.body.nome) this.errors.push('Nome é um campo obrigatório.');
        if (!this.body.email && !this.body.telefone) {
            this.errors.push('Pelo menos um contato precisa ser enviado: e-mail ou telefone.');
        }
    }

    cleanUp() {
        for (let key in this.body) {
            if (typeof this.body[key] !== 'string') this.body[key] = '';
        }

        this.body = {
            nome: this.body.nome, 
            sobrenome: this.body.sobrenome,
            email: this.body.email,
            telefone: this.body.telefone,
            idUser: this.user
        };
    }

    async edit(id) {
        if (typeof id !== 'string') return;
        this.validates();
        if (this.errors.length > 0) return;
        this.contato = await ContatoModel.findByIdAndUpdate(id, this.body, {new: true});
    }

    static async findById(id) {
        if (typeof id !== 'string') return;
        const contato = await ContatoModel.findById(id);
        return contato ;
    }       

    static async findContatos(userEmail) {
        const contatos = await ContatoModel.find({idUser: userEmail})
            .sort({createdIn: -1}); // order by descending
        return contatos;
    }

    static async delete(id) {
        if (typeof id !== 'string') return;
        const contato = await ContatoModel.findByIdAndDelete({_id: id});
        return contato;
    }
};

module.exports = Contato;