const userSchema = require('../models/user')

async function isCreated (req, res, next) {
  const { email } = req.body
  const isCreated = await userSchema.findOne({ email }).exec()

  if (isCreated != null) {
    req.user = isCreated
  }

  next()
}

module.exports = isCreated
