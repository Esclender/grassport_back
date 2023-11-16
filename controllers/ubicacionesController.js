const ubicacionesServices = require('../services/ubicacionesServices')

async function getGeolocationController (req, res) {
  try {
    const { latLng } = req.query
    const [latitude, longitude] = latLng.split(',')

    const response = await ubicacionesServices.getGeolocation({ latitude, longitude })

    return res.json({
      exitoso: true,
      response
    })
  } catch (error) {
    const { message, cause } = error
    console.log(message)
    return res
      .status(cause?.status ?? 401)
      .json({
        exitoso: false,
        error: message
      })
  }
}

async function getNearbyLocationController (req, res) {
  try {
    const { latLng } = req.query
    const [latitude, longitude] = latLng.split(',')

    const response = await ubicacionesServices.getNearbyLocations({ latitude, longitude })

    return res.json({
      exitoso: true,
      response
    })
  } catch (error) {
    const { message, cause } = error
    console.log(message)
    return res
      .status(cause?.status ?? 401)
      .json({
        exitoso: false,
        error: message
      })
  }
}

module.exports = {
  getGeolocationController,
  getNearbyLocationController
}
