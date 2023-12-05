const userSchema = require('../models/user')
const historySchema = require('../models/userHistory')
const favoriteSchema = require('../models/favorite')
const reportSchema = require('../models/reportOfProblem')
const admin = require('../firebase/admin')
const path = require('path')
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

async function userData ({ body, user }) {
  const { email } = user
  await userSchema.updateOne({ email }, { ...body })
}

async function getUserData ({ user }) {
  const { email } = user
  const doc = await userSchema.findOne({ email }).exec()
  const { _id, __v, ...data } = doc._doc

  return {
    ...data
  }
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
  const { email } = user
  const { data } = body
  const isSaved = await favoriteSchema.findOne({ street: data.street, email }).exec()

  return new Promise((resolve, reject) => {
    if (isSaved) {
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
    }
  })
}

async function obtenerFavorites ({ user }) {
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
        response: data
      })
    )
  })
}

async function reportProblem ({ user, file, body }) {
  if (!file) {
    throw Error('Ninguna imagen recibida.')
  }

  try {
    const { email } = user
    const bucket = admin.storage().bucket()

    const fileName = Date.now() + path.extname(file.originalname)
    const fileToUpload = bucket.file(fileName)

    const findReport = await userSchema.aggregate(
      [
        {
          $match:
            {
              email
            }
        },
        {
          $project: {
            _id: 0,
            __v: 0
          }
        }
      ]
    )

    const reportCreated = {
      ...findReport[0],
      ...body,
      ref: fileName
    }
    const problemToMongo = reportSchema(reportCreated)

    await problemToMongo.save()

    await fileToUpload.save(file.buffer, {
      metadata: {
        contentType: file.mimetype
      }
    })
  } catch (error) {
    console.error('Error uploading file:', error)
  }
}

module.exports = {
  saveUserData,
  userData,
  getUserHistory,
  saveFavorite,
  obtenerFavorites,
  getUserData,
  reportProblem
}
