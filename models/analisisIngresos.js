// const { Schema } = require('moongose')

const db = require('../helpers/db')

const ingresosSchema = new db.Schema({
  mes: { type: Number, required: true },
  total_ingresos: { type: Number, required: true }
})

const Ingreso = db.model('analisisIngresos', ingresosSchema)

module.exports = Ingreso
