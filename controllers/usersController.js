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
    console.log(message)
    return res
      .status(cause?.status ?? 401)
      .json({
        exitoso: false,
        error: message
      })
  }
}

async function loginUserSinGoogleController (req, res) {
  try {
    const { body } = req
    const data = await usersServices.loginSinGoogle({ body })

    return res.json({
      exitoso: true,
      ...data
    })
  } catch (error) {
    const { message, cause } = error
    console.log(message)
    return res
      .status(cause?.status ?? 401)
      .json({
        exitoso: false,
        error: message
      })
  }
}

async function registerUserController (req, res) {
  try {
    const { body } = req
    await usersServices.registroUsuario({ body })

    return res.json({
      exitoso: true
    })
  } catch (error) {
    const { message, cause } = error
    console.log(message)
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
    const data = await usersServices.userData({ user: jwt, body: req.body })

    return res.json({
      exitoso: true,
      response: data
    })
  } catch (error) {
    const { message, cause } = error
    console.log(message)
    return res
      .status(cause?.status ?? 401)
      .json({
        exitoso: false,
        error: message
      })
  }
}

async function getUserDataController (req, res) {
  try {
    const { jwt } = req
    const data = await usersServices.getUserData({ user: jwt })

    return res.json({
      exitoso: true,
      response: data
    })
  } catch (error) {
    const { message, cause } = error
    console.log(message)
    return res
      .status(cause?.status ?? 401)
      .json({
        exitoso: false,
        error: message
      })
  }
}

async function userHistoryController (req, res) {
  try {
    const { jwt } = req
    const data = await usersServices.getUserHistory({ isCreated: jwt })

    return res.json({
      exitoso: true,
      ...data
    })
  } catch (error) {
    const { message, cause } = error
    console.log(message)
    return res
      .status(cause?.status ?? 401)
      .json({
        exitoso: false,
        error: message
      })
  }
}

async function userSaveFavorite (req, res) {
  try {
    const { jwt } = req
    await usersServices.saveFavorite({ user: jwt, body: req.body })

    return res.json({
      exitoso: true
    })
  } catch (error) {
    const { message, cause } = error
    console.log(message)
    return res
      .status(cause?.status ?? 401)
      .json({
        exitoso: false,
        error: message
      })
  }
}

async function userFavorites (req, res) {
  try {
    const { jwt } = req
    const data = await usersServices.obtenerFavorites({ user: jwt })

    return res.json({
      exitoso: true,
      ...data
    })
  } catch (error) {
    const { message, cause } = error
    console.log(message)
    return res
      .status(cause?.status ?? 401)
      .json({
        exitoso: false,
        error: message
      })
  }
}

async function reportProblemController (req, res) {
  try {
    const { jwt } = req
    console.log(req.file)
    await usersServices.reportProblem({ user: jwt, file: req.file, body: req.body })

    return res.json({
      exitoso: true
    })
  } catch (error) {
    const { message, cause } = error
    console.log(message)
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
  userDataController,
  userHistoryController,
  userSaveFavorite,
  userFavorites,
  getUserDataController,
  reportProblemController,
  loginUserSinGoogleController,
  registerUserController
}
