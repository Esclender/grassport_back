const express = require('express')
const router = express.Router()

const ubicacionesController = require('../controllers/ubicacionesController')
const updateLocationMiddleware = require('../middlewares/updateLastLocation')
const isAuthenticatedMiddleware = require('../middlewares/isLoggedUser')

// DON'T REQUIRE AUTH
router.get('/geocoding', ubicacionesController.getGeolocationController)
router.get('/geocoding/nearbyLocations', ubicacionesController.getNearbyLocationController)
router.get('/geocoding/address', ubicacionesController.geocodingByAddress)

module.exports = router
