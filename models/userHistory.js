// const { Schema } = require('moongose')
const db = require('../helpers/db')

const historySchema = new db.Schema({
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  locality: {
    type: String,
    required: true
  },
  street: {
    type: String,
    required: true
  },
  leading: {
    type: String,
    required: true
  },
  emailUsuario: {
    type: String,
    required: true
  },
  fecha_busqueda: {
    type: Date,
    required: true
  }
})

historySchema.methods = {
  toJson: () => {
    const { __v, _id, ...info } = this.toObject()
    info.id = _id
    return info
  }
}

const History = db.model('historiales', historySchema)

module.exports = History
