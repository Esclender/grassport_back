const express = require('express')
const router = express.Router()
const multer = require('multer')

// Multer configuration for handling file uploads
const storage = multer.memoryStorage()
const upload = multer({ storage })

const isCreated = require('../middlewares/isEmailCreated')
const isUserRegistered = require('../middlewares/isUserRegistered')
const updateLastIngreso = require('../middlewares/updateLastIngreso')
const isAuth = require('../middlewares/isAuth')

// const ubicacionesController = require('../controllers/ubicacionesController')
const mustBeAuthenticated = require('../middlewares/mustBeAuth')
const usuarioControllers = require('../controllers/usersController')

router.post('/', [isCreated], usuarioControllers.loginUserWithGoogleController)
router.post('/login', [isUserRegistered, updateLastIngreso], usuarioControllers.loginUserSinGoogleController)
router.post('/registro', [upload.single('image')], usuarioControllers.registerUserController)
router.post('/registro/completado', usuarioControllers.completedRegisterController)

// REQ AUTH
router.post('/mis-datos', [isAuth, mustBeAuthenticated, upload.single('image')], usuarioControllers.userDataController)
router.get('/mis-datos', [isAuth, mustBeAuthenticated], usuarioControllers.getUserDataController)
router.get('/mis-datos/historial', [isAuth], usuarioControllers.userHistoryController)

router.post('/favoritos', [isAuth, mustBeAuthenticated], usuarioControllers.userSaveFavorite)
router.delete('/favoritos/:id_favorite', [isAuth, mustBeAuthenticated], usuarioControllers.deleteFavoriteController)

router.get('/mis-datos/favoritos', [isAuth, mustBeAuthenticated], usuarioControllers.userFavorites)

router.post('/report', [isAuth, mustBeAuthenticated, upload.single('image')], usuarioControllers.reportProblemController)

module.exports = router
