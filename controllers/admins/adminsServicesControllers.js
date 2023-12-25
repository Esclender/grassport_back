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

async function getUsersList (req, res) {
  try {
    const { tops, nombre, orden } = req.query
    const reports = await adminServices.getUsersList({ tops, filterName: nombre, orderBy: orden })

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

async function getPanelController (req, res) {
  try {
    const { jwt } = req
    const panel = await adminServices.getAdminPanel({ user: jwt })

    return res.json({
      exitoso: true,
      response: panel
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

async function updateReportStatusController (req, res) {
  try {
    const { id_reporte } = req.params
    console.log(id_reporte)
    await adminServices.updateProblemStatus({ body: req.body, idReport: id_reporte })

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
  getReportsController,
  accesoController,
  getUsersList,
  getPanelController,
  updateReportStatusController
}
