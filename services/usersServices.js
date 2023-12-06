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
      const usuario = userSchema({
        ...body,
        isGoogleAuth: true
      })
      const token = generateToken(body)

      usuario.save()
        .then(() => {
          resolve({ token })
        })
        .catch((e) => {
          reject(e)
        })
    } else {
      const { email, _id } = isCreated
      const token = generateToken({ email, _id })
      resolve({ token })
    }
  })
}

async function loginSinGoogle ({ body }) {
  const { email, clave } = body

  const isRegistered = await userSchema.findOne({ email, clave }).exec()

  if (!isRegistered) throw Error('No registrado')

  // LOGIC TO CHECK IF HE IS AN ADMIN OR EDITOR

  const token = generateToken({ email })
  return token
}

async function registroUsuario ({ body }) { // REGISTRO
  const { email } = body
  const isCreated = await userSchema.findOne({ email }).exec()

  if (isCreated?.isGoogleAuth) {
    await userSchema.deleteOne({ email })
  }

  if (!isCreated?.isGoogleAuth && isCreated != null) throw Error('Email ya registrado')

  const usuario = userSchema({
    ...body,
    isGoogleAuth: false
  })

  await usuario.save()
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
      ref: fileName,
      fecha_Creacion: Date.now()
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
  reportProblem,
  loginSinGoogle,
  registroUsuario
}
