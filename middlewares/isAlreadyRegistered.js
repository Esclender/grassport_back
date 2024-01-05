const userSchema = require('../models/user')
const adminSchema = require('../models/admins')

async function isAlreadyRegistered (req, res, next) {
  const { email } = req.body
  const isCreated = await userSchema.findOne({ email }).exec()
  const isAdmin = await adminSchema.findOne({ email }).exec()

  if ((isCreated && isCreated?.auth) || isAdmin) {
    return res.status(400).json({
      exitoso: false,
      message: 'Correo ya registrado'
    })
  }

  if (!isCreated?.auth) {
    await userSchema.deleteOne({ email })
  }

  next()
}

module.exports = isAlreadyRegistered
