// const { Schema } = require('moongose')

const db = require('../helpers/db')

const interaccionSchema = new db.Schema({
  email: { type: String, required: true },
  place_id: { type: String, required: true },
  rating: { type: Boolean }
})

const Interaccion = db.model('interacciones', interaccionSchema)

module.exports = Interaccion
