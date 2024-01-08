// const { Schema } = require('moongose')

const db = require('../helpers/db')

const adminSchema = new db.Schema({
  nombre: { type: String },
  numero: { type: String },
  email: { type: String, required: true, unique: true },
  apellido: { type: String },
  ref: { type: String },
  auth: { type: Boolean }
})

adminSchema.methods = {
  toJson: () => {
    const { __v, _id, ...info } = adminSchema.toObject()
    info.id = _id
    return info
  }
}

const Admin = db.model('admins', adminSchema)

module.exports = Admin
