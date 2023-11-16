// const { Schema } = require('moongose')
const db = require('../helpers/db')

const userSchema = new db.Schema({
  primer_nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  ultima_ubicacion: {
    latitude: { type: Number },
    longitude: { type: Number }
  }
})

userSchema.methods = {
  toJson: () => {
    const { __v, _id, ...info } = this.toObject()
    info.id = _id
    return info
  }
}

const User = db.model('usuarios', userSchema)

module.exports = User
