const canchasServices = require('../services/canchasServices')

async function postCanchaController (req, res) {
  try {
    const { body, jwt, file } = req
    console.log(body)
    console.log(file)
    await canchasServices.saveCanchaPostedData({ body, jwt, image: file })

    return res.json({
      exitoso: true
    })
  } catch (error) {
    const { message, cause } = error
    console.log(error)
    return res
      .status(cause?.status ?? 401)
      .json({
        exitoso: false,
        error: message
      })
  }
}

async function getCanchaInfo (req, res) {
  try {
    const { jwt, params } = req
    const { isGoogleCancha, email } = jwt
    const { id_cancha } = params

    console.log(jwt)

    const data = isGoogleCancha
      ? await canchasServices.canchasGoogleInfo({ id_cancha, email })
      : await canchasServices.canchasPostedInfo({ id_cancha, email })

    return res.json({
      exitoso: true,
      response: data
    })
  } catch (error) {
    const { message, cause } = error
    console.log(error)
    return res
      .status(cause?.status ?? 401)
      .json({
        exitoso: false,
        error: message
      })
  }
}

async function getUserPostedCanchas (req, res) {
  try {
    const { jwt } = req

    const data = await canchasServices.userPostedCanchas({ jwt })

    return res.json({
      exitoso: true,
      response: data
    })
  } catch (error) {
    const { message, cause } = error
    console.log(error)
    return res
      .status(cause?.status ?? 401)
      .json({
        exitoso: false,
        error: message
      })
  }
}

async function updateCanchaData (req, res) {
  try {
    const { body, params, file } = req
    const { place_id } = params
    console.log(body)

    await canchasServices.updateCanchaPostedData({
      place_id,
      body,
      image: file
    })

    return res.json({
      exitoso: true
    })
  } catch (error) {
    const { message, cause } = error
    console.log(error)
    return res
      .status(cause?.status ?? 401)
      .json({
        exitoso: false,
        error: message
      })
  }
}

module.exports = {
  postCanchaController,
  getCanchaInfo,
  getUserPostedCanchas,
  updateCanchaData
}
