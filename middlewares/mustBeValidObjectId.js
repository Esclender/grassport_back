const moongose = require('mongoose')

async function mustBeValidObjectIdByBody (req, res, next) {
  const { place_id } = req.body
  const { isGoogleCancha } = req.jwt

  if (!moongose.Types.ObjectId.isValid(place_id) && !isGoogleCancha) {
    return res.statsu(401).json({
      exitoso: false,
      message: 'Id no valido'
    })
  }

  next()
}

async function mustBeValidObjectIdByParam (req, res, next) {
  const { place_id } = req.params
  const { isGoogleCancha } = req.jwt

  if (!moongose.Types.ObjectId.isValid(place_id) && !isGoogleCancha) {
    return res.statsu(401).json({
      exitoso: false,
      message: 'Id no valido'
    })
  }

  next()
}

module.exports = {
  mustBeValidObjectIdByBody,
  mustBeValidObjectIdByParam
}
