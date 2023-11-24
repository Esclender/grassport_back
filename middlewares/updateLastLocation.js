const userSchema = require('../models/user')

async function updateLastLocation (req, res, next) {
  let token = req.jwt

  if (token) {
    const ubicacion = req.query.latLng.split(',')

    await userSchema.findOneAndUpdate({ email: token.email }, { ultima_ubicacion: { latitude: ubicacion[0], longitude: ubicacion[1] } })
  }

  next()
}

module.exports = updateLastLocation
