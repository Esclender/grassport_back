// const { Schema } = require('moongose')
const db = require('../helpers/db')

/**
 *
 * {

razon: **‘Realizo un comentario o Reviso un reporte’**

author: **‘El nombre del usuario o un admin que de ser admin seria Grassport Team’**

seccion: **‘Tus Canchas o Reportes’,**

tiempo_publicado ,

isNuevo: true or false,

route: 0 = Reportes, 1 = Canchas

}
 */

const notificationSchema = new db.Schema({
  author: {
    type: String,
    required: true
  },
  razon: {
    type: String,
    enum: ['Realizo un comentario', 'Reviso un reporte'],
    required: true
  },
  seccion: {
    type: String,
    enum: ['Tus Canchas', 'Reportes'],
    required: true
  },
  fecha_publicado: { type: Date, required: true },
  isNuevo: {
    type: Boolean,
    required: true
  },
  route: {
    type: Number,
    enum: [0, 1],
    required: true
  },
  email: { type: String, required: true },
  id_reporte: { type: db.Schema.Types.ObjectId },
  id_cancha: { type: db.Schema.Types.ObjectId }
})

notificationSchema.methods = {
  toJson: () => {
    const { __v, _id, ...info } = notificationSchema.toObject()
    info.id = _id
    return info
  }
}

const Notification = db.model('notificaciones', notificationSchema)

module.exports = Notification
