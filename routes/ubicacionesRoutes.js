const express = require('express')
const router = express.Router()

const ubicacionesController = require('../controllers/ubicacionesController')
const isAuthenticatedMiddleware = require('../middlewares/isAuth')
const mustBeAuthenticated = require('../middlewares/mustBeAuth')

// DON'T REQUIRE AUTH
router.get('/geocoding', ubicacionesController.getGeolocationController)
router.get('/geocoding/address', ubicacionesController.geocodingByAddress)
router.get('/geocoding/nearbyLocations', ubicacionesController.getNearbyLocationController)

router.post('/user-history', [isAuthenticatedMiddleware, mustBeAuthenticated], ubicacionesController.saveHistory)

module.exports = router
