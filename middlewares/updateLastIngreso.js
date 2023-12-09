const userSchema = require('../models/user')
const adminSchema = require('../models/admins')

async function updateLastIngreso (req, res, next) {
  const { email } = req.body

  const isAdmin = await adminSchema.findOne({ email })

  if (isAdmin == null) {
    await userSchema.updateOne({ email }, {
      fecha_ultimo_ingreso: Date.now()
    })
  }

  next()
}

module.exports = updateLastIngreso
