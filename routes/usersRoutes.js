const express = require('express')
const router = express.Router()

const isCreated = require('../middlewares/isEmailCreated')
const isAuth = require('../middlewares/isAuth')

// const ubicacionesController = require('../controllers/ubicacionesController')
const mustBeAuthenticated = require('../middlewares/mustBeAuth')
const usuarioControllers = require('../controllers/usersController')

router.post('/', [isCreated], usuarioControllers.saveUserController)

// REQ AUTH
router.get('/mis-datos', [isAuth, mustBeAuthenticated], usuarioControllers.userDataController)
router.get('/mis-datos/historial', [isAuth], usuarioControllers.userHistoryController)

router.post('/favoritos', [isAuth, mustBeAuthenticated], usuarioControllers.userSaveFavorite)
router.get('/mis-datos/favoritos', [isAuth, mustBeAuthenticated], usuarioControllers.userFavorites)

module.exports = router
