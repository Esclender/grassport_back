const userSchema = require('../models/user')
const historySchema = require('../models/userHistory')
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

async function getUserHistory ({ isCreated }) {
  return new Promise((resolve, reject) => {
    if (isCreated.isLogged) {
      const { email } = isCreated
      historySchema.aggregate(
        [
          {
            $match:
              {
                emailUsuario: email
              }
          },
          {
            $project: {
              _id: 0,
              __v: 0
            }
          }
        ]
      ).then(
        (data) => resolve({
          historial: data
        })
      )
    } else {
      resolve({
        historial: []
      })
    }
  })
}

module.exports = {
  saveUserData,
  userData,
  getUserHistory
}
