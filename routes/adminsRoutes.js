const express = require('express')
const router = express.Router()

const adminController = require('../controllers/admins/adminsServicesControllers')
const isAuthenticatedMiddleware = require('../middlewares/isAuth')
const mustBeAuthenticated = require('../middlewares/mustBeAuth')
const isAdmin = require('../middlewares/isAdmin')

// DON'T REQUIRE AUTH
router.post('/acceso', adminController.accesoController)

router.get('/report', [isAuthenticatedMiddleware, mustBeAuthenticated, isAdmin], adminController.getReportsController)
router.put('/report/:id_reporte', [isAuthenticatedMiddleware, mustBeAuthenticated, isAdmin], adminController.updateReportStatusController)

router.get('/usuarios', [isAuthenticatedMiddleware, mustBeAuthenticated, isAdmin], adminController.getUsersList)

router.get('/panel', [isAuthenticatedMiddleware, mustBeAuthenticated, isAdmin], adminController.getPanelController)

module.exports = router
