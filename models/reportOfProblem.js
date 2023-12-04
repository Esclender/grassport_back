// const { Schema } = require('moongose')
const db = require('../helpers/db')

const reportSchema = new db.Schema({
  nombre: { type: String },
  apellido: { type: String },
  phone: { type: String },
  email: { type: String, required: true, unique: true },
  img: { type: String, required: true },
  descripcion: { type: String, required: true }
})

reportSchema.methods = {
  toJson: () => {
    const { __v, _id, ...info } = this.toObject()
    info.id = _id
    return info
  }
}

const Report = db.model('reportes-problemas', reportSchema)

module.exports = Report
