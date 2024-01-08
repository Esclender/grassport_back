const userSchema = require('../models/user')
const adminSchema = require('../models/admins')

async function isUserRegistered (req, res, next) {
  const { email } = req.body
  const isCreated = await userSchema.findOne({ email }).exec()
  const isAdmin = await adminSchema.findOne({ email }).exec()

  if (isCreated == null && isAdmin == null) {
    return res.status(400).json({
      exitoso: false,
      message: 'Correo no registrado'
    })
  }

  if (!isCreated?.auth && !isAdmin?.auth) {
    return res.status(400).json({
      exitoso: false,
      message: 'Correo no registrado'
    })
  }

  next()
}

module.exports = isUserRegistered
