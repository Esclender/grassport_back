const express = require('express')
const router = express.Router()

const ubicacionesController = require('../controllers/ubicacionesController')

router.get('/geocoding', ubicacionesController.getGeolocationController)
router.get('/geocoding/nearbyLocations', ubicacionesController.getNearbyLocationController)

module.exports = router
