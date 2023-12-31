const canchasServices = require('../services/canchasServices')

async function postCanchaController (req, res) {
  try {
    const { body, jwt, file } = req
    await canchasServices.saveCanchaPostedData({ body, jwt, image: file })

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

async function getCanchaInfo (req, res) {
  try {
    const { jwt, params } = req
    const { isGoogleCancha } = jwt
    const { id_cancha } = params

    console.log({ isGoogleCancha })

    const data = isGoogleCancha
      ? await canchasServices.canchasGoogleInfo({ id_cancha })
      : await canchasServices.canchasPostedInfo({ id_cancha })

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

module.exports = {
  postCanchaController,
  getCanchaInfo
}
