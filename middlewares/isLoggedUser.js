const jwt = require('jsonwebtoken')

async function isAuthenticated (req, res, next) {
  try {
    let token = req.header('Authorization')
    if (!token) {
      return res
        .status(404)
        .json({ exitoso: false, mensaje: 'Token no encontrado' })
    }
    token = token.split(' ')[1]
    const decoded = jwt.verify(token, process.env.ACCESS_SECRET)
    req.jwt = decoded

    next()
  } catch (error) {
    let mensaje = error.message
    if (mensaje == 'invalid signature') {
      mensaje = 'firma invalida'
    }
    return res.status(401).json({ exitoso: false, mensaje })
  }
}

module.exports = isAuthenticated
