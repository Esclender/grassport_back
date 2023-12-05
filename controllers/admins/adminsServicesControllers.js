const adminServices = require('../../services/admins/adminServices')

async function accesoController (req, res) {
  try {
    const { body } = req
    const token = await adminServices.acceso({ body })

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

async function getReportsController (req, res) {
  try {
    const { jwt } = req
    const reports = await adminServices.getReports({ user: jwt })

    return res.json({
      exitoso: true,
      response: reports
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
  getReportsController,
  accesoController
}
