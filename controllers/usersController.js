const usersServices = require('../services/usersServices')

async function saveUserController (req, res) {
  try {
    const { body, user } = req
    const { token } = await usersServices.saveUserData({ body, isCreated: user })

    return res.json({
      exitoso: true,
      token
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

async function userDataController (req, res) {
  try {
    const { jwt } = req
    const data = await usersServices.userData({ isCreated: jwt })

    return res.json({
      exitoso: true,
      response: data
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
  saveUserController,
  userDataController
}
