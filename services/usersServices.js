const userSchema = require('../models/user')
const historySchema = require('../models/userHistory')
const favoriteSchema = require('../models/favorite')
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

async function saveFavorite ({ body, user }) {
  return new Promise((resolve, reject) => {
    const { email } = user
    const { data } = body

    const newFavorite = {
      emailUsuario: email,
      leading: 'favorite',
      fecha_guardado: Date.now(),
      ...data
    }

    const addingFavorite = favoriteSchema(newFavorite)

    addingFavorite.save()
      .then(() => {
        resolve()
      })
      .catch((e) => {
        reject(e)
      })
  })
}

async function obtenerFavorites ({ body, user }) {
  return new Promise((resolve, reject) => {
    const { email } = user

    favoriteSchema.aggregate(
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
        favorites: data
      })
    )
  })
}

module.exports = {
  saveUserData,
  userData,
  getUserHistory,
  saveFavorite,
  obtenerFavorites
}
