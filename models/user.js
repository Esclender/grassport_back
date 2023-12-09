// const { Schema } = require('moongose')
const db = require('../helpers/db')

const userSchema = new db.Schema({
  nombre: { type: String },
  nombre_minuscula: { type: String },
  numero: { type: String },
  email: { type: String, required: true, unique: true },
  apellido: { type: String },
  clave: { type: String },
  isGoogleAuth: { type: Boolean },
  conteo_ingresos: { type: Number },
  fecha_creacion: { type: Date, required: true },
  ref: { type: String }

})

userSchema.methods = {
  toJson: () => {
    const { __v, _id, ...info } = userSchema.toObject()
    info.id = _id
    return info
  }
}

const User = db.model('usuarios', userSchema)

module.exports = User
