// const { Schema } = require('moongose')
const db = require('../helpers/db')

const commentSchema = new db.Schema({
  nombre: { type: String, required: true },
  comentario: { type: String, required: true },
  ref: { type: String, required: true },
  fecha_publicado: { type: Date, required: true },
  replies: { type: Array, required: true },
  isOwner: { type: Boolean, required: true },
  place_id: { type: String, required: true },
  posted_place_id: { type: db.Types.ObjectId },
  isGoogleAuth: { type: Boolean }
})

commentSchema.methods = {
  toJson: () => {
    const { __v, _id, ...info } = commentSchema.toObject()
    info.id = _id
    return info
  }
}

const Comment = db.model('comentarios', commentSchema)

module.exports = Comment
