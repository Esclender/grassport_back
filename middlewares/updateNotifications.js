const NotificationSchema = require('../models/notificacions')
const Canchas = require('../models/cancha')
const Report = require('../models/reportOfProblem')
const { mongo } = require('../helpers/db')

async function updateNotificationAlertReport (req, res, next) {
  const { id_reporte } = req.params
  const report = await Report.findById(id_reporte).exec()

  const newNotification = NotificationSchema({
    author: 'Grassport Team',
    razon: 'Reviso un reporte',
    seccion: 'Reportes',
    fecha_publicado: Date.now(),
    isNuevo: true,
    route: 0,
    email: report.email,
    id_reporte
  })

  await newNotification.save()

  next()
}

async function updateNotificationAlertComments (req, res, next) {
  const { body, jwt } = req

  if (!jwt.isGoogleCancha) {
    console.log('update')
    const { place_id } = body

    const cancha = await Canchas.findOne({
      _id: new mongo.ObjectId(place_id)
    }).exec()

    console.log(cancha)

    if (cancha && cancha.ownerEmail != jwt.email) {
      const newNotification = NotificationSchema({
        author: jwt.nombre,
        razon: 'Realizo un comentario',
        seccion: 'Tus Canchas',
        fecha_publicado: Date.now(),
        isNuevo: true,
        route: 1,
        email: cancha.ownerEmail,
        id_cancha: place_id
      })

      await newNotification.save()
    }
  }

  next()
}

module.exports = {
  updateNotificationAlertReport,
  updateNotificationAlertComments
}
