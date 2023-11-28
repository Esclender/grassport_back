// const { Schema } = require('moongose')
const db = require('../helpers/db')

const userSchema = new db.Schema({
  nombre: { type: String, },
  email: { type: String, required: true, unique: true }
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
