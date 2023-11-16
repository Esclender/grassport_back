const express = require('express')
const router = express.Router()

const usuarioControllers = require('../controllers/usersController')

router.post('/', usuarioControllers.saveUserController)

module.exports = router
