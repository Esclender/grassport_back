const userSchema = require('../models/user')
const { generateToken } = require('../utils/jwt')

async function saveUserData ({ body, isCreated }) {
  return new Promise((resolve, reject) => {
    if (isCreated == null) {
      const { latitude, longitude, ...rest } = body

      const newUser = {
        ...rest,
        ultima_ubicacion: {
          latitude,
          longitude
        }
      }

      const usuario = userSchema(newUser)
      const token = generateToken(newUser)

      usuario.save()
        .then(() => {
          resolve({ token })
        })
        .catch((e) => {
          reject(e)
        })
    } else {
      const { ultima_ubicacion, email, _id } = isCreated
      const token = generateToken({ ultima_ubicacion, email, _id })
      resolve({ token })
    }
  })
}

async function userData ({ isCreated }) {
  console.log(isCreated)

  return 'DATOS DEL USUARIO'
}

module.exports = {
  saveUserData,
  userData
}
