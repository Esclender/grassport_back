const express = require('express')
const router = express.Router()

const ubicacionesController = require('../controllers/ubicacionesController')
const canchasController = require('../controllers/canchasController')
const { isDetailedGoogleCancha } = require('../middlewares/isObjectId')
const isAuthenticatedMiddleware = require('../middlewares/isAuth')
const mustBeAuthenticated = require('../middlewares/mustBeAuth')

// DON'T REQUIRE AUTH
router.get('/geocoding', ubicacionesController.getGeolocationController)
router.get('/geocoding/address', ubicacionesController.geocodingByAddress)
router.get('/geocoding/canchas', ubicacionesController.searchCanchas)
router.get('/geocoding/nearbyLocations', ubicacionesController.getNearbyLocationController)

router.get('/geocoding/nearbyLocations/:id_cancha', [isDetailedGoogleCancha], canchasController.getCanchaInfo)

router.post('/user-history', [isAuthenticatedMiddleware, mustBeAuthenticated], ubicacionesController.saveHistory)

module.exports = router
