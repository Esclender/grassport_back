const userSchema = require('../models/user')
const adminSchema = require('../models/admins')

async function updateLastIngreso (req, res, next) {
  const { email } = req.body

  const isAdmin = await adminSchema.findOne({ email })

  if (isAdmin == null) {
    await userSchema.updateOne({ email }, {
      fecha_ultimo_ingreso: Date.now()
    })

    await userSchema.updateOne({ email }, { $inc: { conteo_ingresos: 1 } })
  }

  next()
}

module.exports = updateLastIngreso
