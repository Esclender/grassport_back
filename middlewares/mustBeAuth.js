async function mustBeAuthenticated (req, res, next) {
  const { isLogged } = req.jwt
  if (!isLogged) {
    return res.status(401).json({
      exitoso: false,
      message: 'Sin acceso a historial'
    })
  }

  next()
}

module.exports = mustBeAuthenticated
