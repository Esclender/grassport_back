// const userSchema = require('../models/user')
// const adminSchema = require('../models/admins')
const moongose = require('mongoose')

async function isGoogleCancha (req, res, next) {
  const { jwt, body } = req
  const { place_id } = body

  console.log(moongose.Types.ObjectId.isValid(place_id))

  if (moongose.Types.ObjectId.isValid(place_id)) {
    jwt.isGoogleCancha = false
  } else {
    jwt.isGoogleCancha = true
  }
  next()
}

module.exports = isGoogleCancha
