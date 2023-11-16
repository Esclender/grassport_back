const usersServices = require('../services/usersServices')

async function saveUserController (req, res) {
  try {
    const { body } = req
    await usersServices.saveUserData({ body })

    return res.json({
      exitoso: true
    })
  } catch (error) {
    const { message, cause } = error

    return res
      .status(cause?.status ?? 401)
      .json({
        exitoso: false,
        error: message
      })
  }
}

module.exports = {
  saveUserController
}
