const userSchema = require('../models/user')

async function isUserRegistered (req, res, next) {
  const { email } = req.body
  const isCreated = await userSchema.findOne({ email }).exec()

  if (isCreated == null) {
    return res.json({
      exitoso: false,
      message: 'Usuario no registrado'
    })
  }

  next()
}

module.exports = isUserRegistered
