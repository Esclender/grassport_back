// const { Schema } = require('moongose')
const db = require('../helpers/db')

const canchaSchema = new db.Schema({
  ownerName: { type: String, required: true },
  ownerEmail: { type: String, required: true },
  name: { type: String, required: true },
  address: { type: String, required: true },
  rating: { type: Number, required: true },
  ratingCount: { type: Number, required: true },
  isOpen: { type: Boolean, required: true },
  description: { type: String },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  ref: { type: String, required: true },
  comments_count: { type: Number }
})

canchaSchema.methods = {
  toJson: () => {
    const { __v, _id, ...info } = canchaSchema.toObject()
    info.id = _id
    return info
  }
}

const Cancha = db.model('canchas', canchaSchema)

module.exports = Cancha
