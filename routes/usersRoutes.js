const express = require('express')
const router = express.Router()
const multer = require('multer')

// Multer configuration for handling file uploads
const storage = multer.memoryStorage()
const upload = multer({ storage })

const isCreated = require('../middlewares/isEmailCreated')
const isUserRegistered = require('../middlewares/isUserRegistered')
const isAlreadyRegistered = require('../middlewares/isAlreadyRegistered')
const updateLastIngreso = require('../middlewares/updateLastIngreso')
const isAuth = require('../middlewares/isAuth')

// const ubicacionesController = require('../controllers/ubicacionesController')
const mustBeAuthenticated = require('../middlewares/mustBeAuth')
const usuarioControllers = require('../controllers/usersController')
const canchaControllers = require('../controllers/canchasController')
const updateCanchaCommentsCount = require('../middlewares/updateCommentCount')
const { mustBeValidObjectIdByBody, mustBeValidObjectIdByParam } = require('../middlewares/mustBeValidObjectId')
const { isGoogleCancha } = require('../middlewares/isObjectId')
const { updateNotificationAlertComments } = require('../middlewares/updateNotifications')

router.post('/', [isUserRegistered, isCreated], usuarioControllers.loginUserWithGoogleController)
router.post('/login', [isUserRegistered, updateLastIngreso], usuarioControllers.loginUserSinGoogleController)
router.post('/registro', [upload.single('image'), isAlreadyRegistered], usuarioControllers.registerUserController)
router.post('/registro/completado', usuarioControllers.completedRegisterController)

// REQ AUTH
router.post('/mis-datos', [isAuth, mustBeAuthenticated, upload.single('image')], usuarioControllers.userDataController)
router.get('/mis-datos', [isAuth, mustBeAuthenticated], usuarioControllers.getUserDataController)
router.get('/mis-datos/historial', [isAuth], usuarioControllers.userHistoryController)

router.post('/favoritos', [isAuth, mustBeAuthenticated], usuarioControllers.userSaveFavorite)
router.delete('/favoritos/:id_favorite', [isAuth, mustBeAuthenticated], usuarioControllers.deleteFavoriteController)

router.get('/mis-datos/favoritos', [isAuth, mustBeAuthenticated], usuarioControllers.userFavorites)

router.post('/report', [isAuth, mustBeAuthenticated, upload.single('image')], usuarioControllers.reportProblemController)

router.get('/report/:id_reporte', [isAuth, mustBeAuthenticated], usuarioControllers.reportDetailsController)

router.post('/comment', [isAuth, mustBeAuthenticated, isGoogleCancha, mustBeValidObjectIdByBody, updateNotificationAlertComments, updateCanchaCommentsCount], usuarioControllers.postNewComment)

router.get('/notifications', [isAuth, mustBeAuthenticated], usuarioControllers.getUserNotifications)

/** *USER PLACE CANCHAS POSTING */
router.post('/my-place/postCancha', [isAuth, mustBeAuthenticated, upload.single('image')], canchaControllers.postCanchaController)

router.get('/my-place/dashboard', [isAuth, mustBeAuthenticated], usuarioControllers.getUserMyPlaceDashboard)

router.get('/my-place/canchas', [isAuth, mustBeAuthenticated], canchaControllers.getUserPostedCanchas)

router.put('/my-place/canchas/:id_cancha', [isAuth, mustBeAuthenticated, mustBeValidObjectIdByParam, upload.single('image')], canchaControllers.updateCanchaData)

module.exports = router
