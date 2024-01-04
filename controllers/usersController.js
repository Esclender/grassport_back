const usersServices = require('../services/usersServices')

async function loginUserWithGoogleController (req, res) {
  try {
    const { body, user } = req
    const { token } = await usersServices.loginUserWithGoogle({ body, isCreated: user })

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
    const { body, file } = req
    console.log(file)
    const data = await usersServices.registroUsuario({ body, image: file })

    return res.json({
      exitoso: true,
      response: {
        ...data
      }
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
    const { jwt, file } = req
    const data = await usersServices.userData({ user: jwt, body: req.body, image: file })

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

async function completedRegisterController (req, res) {
  try {
    const { body } = req
    await usersServices.completedRegister({ body })

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

async function deleteFavoriteController (req, res) {
  try {
    const { id_favorite } = req.params
    await usersServices.deleteFavorite({ idFavorite: id_favorite })

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

async function reportProblemController (req, res) {
  try {
    const { jwt } = req
    console.log(jwt)
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

async function postNewComment (req, res) {
  try {
    const { body, jwt, query } = req
    await usersServices.saveComment({ body, jwt, isReply: query.isReply })

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
  loginUserWithGoogleController,
  userDataController,
  userHistoryController,
  userSaveFavorite,
  userFavorites,
  getUserDataController,
  reportProblemController,
  loginUserSinGoogleController,
  registerUserController,
  deleteFavoriteController,
  completedRegisterController,
  postNewComment
}
