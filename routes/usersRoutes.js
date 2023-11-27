const express = require('express')
const router = express.Router()

const isCreated = require('../middlewares/isEmailCreated')
const isAuth = require('../middlewares/isAuth')

// const ubicacionesController = require('../controllers/ubicacionesController')
const usuarioControllers = require('../controllers/usersController')

router.post('/', [isCreated], usuarioControllers.saveUserController)

// REQ AUTH
router.get('/mis-datos', [isAuth], usuarioControllers.userDataController)

module.exports = router
