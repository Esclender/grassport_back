const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
  return res.json({
    exitoso: true,
    mensaje: 'Bienvenido a la API de Grassport'
  })
})

module.exports = router
