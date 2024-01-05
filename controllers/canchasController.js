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

module.exports = {
  postCanchaController
}
