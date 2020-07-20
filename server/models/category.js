const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;


let categorySchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es necesario']
    },
    user: { type: Schema.Types.ObjectId, ref: 'User' }
});
categorySchema.methods.toJSON = function() {
    let categoria = this;
    let categoriaObject = categoria.toObject();
    return categoriaObject;
   }

categorySchema.plugin(uniqueValidator, {message: '{PATH} debe de ser único'});
module.exports = mongoose.model('Category', categorySchema);