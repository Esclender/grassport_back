// const userSchema = require('../models/user')
// const adminSchema = require('../models/admins')
const moongose = require('mongoose')

async function isGoogleCancha (req, res, next) {
  const { jwt, body } = req
  const { place_id } = body

  if (moongose.Types.ObjectId.isValid(place_id)) {
    jwt.isGoogleCancha = false
  } else {
    jwt.isGoogleCancha = true
  }
  next()
}

async function isDetailedGoogleCancha (req, res, next) {
  const { params } = req
  const { id_cancha } = params
  req.jwt = {}

  if (moongose.Types.ObjectId.isValid(id_cancha)) {
    req.jwt.isGoogleCancha = false
  } else {
    req.jwt.isGoogleCancha = true
  }
  next()
}

module.exports = {
  isGoogleCancha,
  isDetailedGoogleCancha
}
