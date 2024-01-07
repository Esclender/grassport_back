// const { Schema } = require('moongose')
const db = require('../helpers/db')

const favoriteSchema = new db.Schema({
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
  place_id: {
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
  fecha_guardado: {
    type: Date,
    required: true
  }
})

favoriteSchema.methods = {
  toJson: () => {
    const { __v, _id, ...info } = this.toObject()
    info.id = _id
    return info
  }
}

const Favorite = db.model('favoritos', favoriteSchema)

module.exports = Favorite
