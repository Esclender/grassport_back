const userSchema = require('../models/user')

async function saveUserData ({ body }) {
  const usuario = userSchema(body)
  await usuario.save()
}

module.exports = {
  saveUserData
}
