const express = require('express')
const router = express.Router()

const adminController = require('../controllers/admins/adminsServicesControllers')
const isAuthenticatedMiddleware = require('../middlewares/isAuth')
const mustBeAuthenticated = require('../middlewares/mustBeAuth')
const isAdmin = require('../middlewares/isAdmin')

// DON'T REQUIRE AUTH

router.post('/acceso', adminController.accesoController)

router.get('/reports', [isAuthenticatedMiddleware, mustBeAuthenticated, isAdmin], adminController.getReportsController)

module.exports = router
