const { mongo } = require('../helpers/db')
const canchaSchema = require('../models/cancha')

async function updateCanchaCommentsCount (req, res, next) {
  const { place_id } = req.body
  const { isGoogleCancha } = req.jwt

  if (!isGoogleCancha) {
    await canchaSchema.updateOne({ _id: mongo.ObjectId(place_id) }, {
      $inc: { comments_count: 1 }
    })
  }

  next()
}

module.exports = updateCanchaCommentsCount
