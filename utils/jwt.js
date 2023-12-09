const jwt = require('jsonwebtoken')

const generateToken = function (dataToken) {
  const token = jwt.sign(
    dataToken,
    process.env.ACCESS_SECRET,
    {
      expiresIn: '24h'
    }
  )

  return token
}

module.exports = {
  generateToken
}
