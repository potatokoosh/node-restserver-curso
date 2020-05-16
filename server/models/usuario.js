const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let rolesValidos = {
  values: ['ADMIN_ROLE', 'USER_ROLE'],
  message: '{VALUE} no es un rol válido'
};

let Schema = mongoose.Schema;

let usuarioSchema = new Schema({
  nombre:{
    type: String,
    required: [true, 'El nombre es necesario']
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'El correo es necesario']
  },
  password: {
    type: String,
    required: [true,'La contraseña es obligatoria']
  },
  img:{
    type: String,
    required: false
  },
  role:{
    type: String,
    default: 'USER_ROLE',
    enum: rolesValidos//enum es una palabra reservada de mongoose
  },
  estado:{
    type: Boolean,
    default: true
  },
  google:{
    type: Boolean,
    default: false
  }
});

//aqui vamos a quitar del usuarioSchema el password para que no se retorne, una sola via para mayor seguridad
usuarioSchema.methods.toJSON = function() {
  let user = this;//traemos todo el Schema a user
  let userObject = user.toObject();//Convertimos el user en un Object
  delete userObject.password;//espesificamos el campo que no queremos retorno

  return userObject;

}

usuarioSchema.plugin(uniqueValidator,{message: '{PATH} Debe de ser único'});

//El primer parametro es el nombre con el que realmente quiero darle a usuarioShema que es lo que que quiero exportar.
module.exports = mongoose.model('Usuario', usuarioSchema);