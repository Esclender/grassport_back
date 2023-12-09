const userSchema = require('../models/user')
const adminSchema = require('../models/admins')
const historySchema = require('../models/userHistory')
const favoriteSchema = require('../models/favorite')
const reportSchema = require('../models/reportOfProblem')
const admin = require('../firebase/admin')
const path = require('path')
const getImagePublicUrl = require('../utils/retrieveImageFromSto')
const { generateToken } = require('../utils/jwt')

async function saveUserData ({ body, isCreated }) {
  return new Promise((resolve, reject) => {
    if (isCreated == null) {
      const { email } = body
      const usuario = userSchema({
        ...body,
        isGoogleAuth: true,
        conteo_ingresos: 1,
        fecha_creacion: Date.now(),
        fecha_ultimo_ingreso: Date.now()
      })

      usuario.save()

      adminSchema.findOne({ email }).exec()
        .then((res) => {
          const token = generateToken({ ...body, isAdmin: res != null })
          resolve({ token })
        })
    } else {
      const { email, _id } = isCreated
      userSchema.updateOne({ email }, { $inc: { conteo_ingresos: 1 } }).then(() => {})
      adminSchema.findOne({ email }).exec()
        .then((res) => {
          const token = generateToken({ ...body, _id, isAdmin: res != null })
          resolve({ token })
        })
    }
  })
}

async function loginSinGoogle ({ body }) {
  const { email, clave } = body
  console.log(email, clave)
  const isRegistered = await userSchema.findOne({ email, clave }).exec()

  // get image url FOR 24 HOURS
  const bucket = admin.storage().bucket()
  const destinationFolder = 'usuarios'

  const fileToUpload = bucket.file(`${destinationFolder}/${isRegistered.ref}`)

  const url = await getImagePublicUrl(fileToUpload)

  if (!isRegistered) throw Error('No registrado')

  await userSchema.updateOne({ email }, { $inc: { conteo_ingresos: 1 } })
  const isAdmin = await adminSchema.findOne({ email }).exec()
  const { nombre } = isRegistered._doc

  // LOGIC TO CHECK IF HE IS AN ADMIN OR EDITOR
  const token = generateToken({ email, nombre, photoURL: url, isAdmin: isAdmin != null })
  return { token }
}

async function registroUsuario ({ body }) { // REGISTRO
  const { email, nombre } = body
  const isCreated = await userSchema.findOne({ email }).exec()

  if (isCreated?.isGoogleAuth) {
    await userSchema.deleteOne({ email })
  }

  if (!isCreated?.isGoogleAuth && isCreated != null) throw Error('Email ya registrado')

  const usuario = userSchema({
    ...body,
    nombre_minuscula: nombre.toLowerCase(),
    isGoogleAuth: false,
    conteo_ingresos: isCreated?._doc?.conteo_ingresos ?? 0,
    ref: 'profile-ddefault.png',
    fecha_creacion: Date.now(),
    fecha_ultimo_ingreso: Date.now()
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
    if (!isSaved) {
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
    } else {
      resolve({})
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
    const fileToUpload = bucket.file(`reportes/${fileName}`)

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
      fecha_creacion: Date.now()
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
