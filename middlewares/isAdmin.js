async function isAdmin (req, res, next) {
  const { isAdmin } = req.jwt

  if (isAdmin == null || !isAdmin) {
    return res.status(401).json({
      exitoso: false,
      message: 'Debe ser admin'
    })
  }

  next()
}

module.exports = isAdmin
