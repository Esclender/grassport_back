const userSchema = require('../models/user')
const adminSchema = require('../models/admins')
const historySchema = require('../models/userHistory')
const favoriteSchema = require('../models/favorite')
const reportSchema = require('../models/reportOfProblem')
const admin = require('../firebase/admin')
const path = require('path')
const getImagePublicUrl = require('../utils/retrieveImageFromSto')
const { generateToken } = require('../utils/jwt')
const { sendCodeEmail } = require('../utils/authCheck')
const { uploadImage, deleteImageFirebase } = require('../utils/firebaseStorageUtils')

async function loginUserWithGoogle ({ body }) {
  const { email } = body

  const isAdmin = await adminSchema.findOne({ email }).exec()

  const token = generateToken({ ...body, isAdmin: isAdmin != null })

  return {
    token
  }
}

async function loginSinGoogle ({ body }) {
  const { email, clave } = body
  const isRegistered = await userSchema.findOne({ email, clave }).exec()

  if (!isRegistered) throw Error('Correo no registrado')

  // get image url FOR 24 HOURS
  const bucket = admin.storage().bucket()
  const destinationFolder = 'usuarios'

  const fileToUpload = bucket.file(`${destinationFolder}/${isRegistered.ref}`)

  const url = await getImagePublicUrl(fileToUpload)

  if (!isRegistered) throw Error('No registrado')

  await userSchema.updateOne({ email }, { $inc: { conteo_ingresos: 1 } })
  const isAdmin = await adminSchema.findOne({ email }).exec()
  const { nombre, auth } = isRegistered._doc

  if (!auth) throw Error('Correo no registrado')

  // LOGIC TO CHECK IF HE IS AN ADMIN OR EDITOR
  const token = generateToken({ email, nombre, photoURL: url, isAdmin: isAdmin != null })
  return { token }
}

async function registroUsuario ({ body, image }) { // REGISTRO
  const { email, nombre, numero } = body
  const isCreated = await userSchema.findOne({ email }).exec()
  const isAdminOrEditor = await adminSchema.findOne({ email }).exec()

  if (isAdminOrEditor) throw Error('Correo registrado')
  if (isCreated?.auth) throw Error('Correo registrado')

  const fileName = image == null ? 'profile-ddefault.png' : Date.now() + path.extname(image.originalname)

  if (!isCreated?.auth && isCreated != null) {
    await userSchema.deleteOne({ email })

    if (isCreated?.ref != 'profile-ddefault.png') {
      await deleteImageFirebase({
        imageRoute: `usuarios/${isCreated?.ref}`
      })
    }
  } else {
    throw Error('Email ya registrado')
  }

  if (image) {
    await uploadImage({
      imageRoute: `usuarios/${fileName}`,
      image
    })
  }

  const usuario = userSchema({
    ...body,
    nombre_minuscula: nombre.toLowerCase(),
    isGoogleAuth: false,
    conteo_ingresos: isCreated?._doc?.conteo_ingresos ?? 0,
    ref: fileName,
    fecha_creacion: Date.now(),
    auth: false,
    fecha_ultimo_ingreso: Date.now()
  })

  await usuario.save()

  const verificationCode = 8888// await sendCodeEmail({ to: `+51${numero}` })

  return {
    verificationCode,
    expirationTime: 500
  }
}

async function completedRegister ({ body }) {
  const { email } = body

  await userSchema.findOneAndUpdate({ email }, { auth: true })
}

async function userData ({ body, user, image }) {
  const { email } = user

  const userData = await userSchema.findOne({ email }).exec()

  if (!userData) {
    const fileName = image == null
      ? 'profile-ddefault.png'
      : Date.now() + path.extname(image.originalname)

    const bucket = admin.storage().bucket()

    const fileToUpload = bucket.file(`usuarios/${fileName}`)

    const saveUser = userSchema(
      {
        email,
        fecha_creacion: Date.now(),
        fecha_ultimo_ingreso: Date.now(),
        auth: false,
        isGoogleAuth: true,
        ref: fileName,
        ...body
      }
    )

    await fileToUpload.save(image.buffer, {
      metadata: {
        contentType: image.mimetype
      }
    })

    await saveUser.save()
  } else {
    const fileName = image == null
      ? userData.ref
      : Date.now() + path.extname(image.originalname)

    if (image) {
      const bucket = admin.storage().bucket()

      const fileToUpload = bucket.file(`usuarios/${fileName}`)

      if (userData.ref != 'profile-ddefault.png' && userData.ref != null) {
        const fileToUpload = bucket.file(`usuarios/${userData.ref}`)

        await fileToUpload.delete()
      }

      await fileToUpload.save(image.buffer, {
        metadata: {
          contentType: image.mimetype
        }
      })
    }

    await userSchema.updateOne({ email }, { ...body, ref: fileName })
  }
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
  const isSaved = await favoriteSchema.findOne({ street: data.street, emailUsuario: email }).exec()

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
        .then((r) => {
          console.log(r)
          resolve()
        })
        .catch((e) => {
          reject(e)
        })
    } else {
      resolve({
        message: 'Ya guardado'
      })
    }
  })
}

async function deleteFavorite ({ idFavorite }) {
  await favoriteSchema.findByIdAndDelete(idFavorite)
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
            __v: 0
          }
        },
        {
          $addFields: {
            id: '$_id'
          }
        },
        {
          $unset: '_id'
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
      email,
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

async function updateProblemStatus ({ user, idReport }) {

}

module.exports = {
  loginUserWithGoogle,
  userData,
  getUserHistory,
  saveFavorite,
  obtenerFavorites,
  getUserData,
  reportProblem,
  loginSinGoogle,
  registroUsuario,
  completedRegister,
  deleteFavorite,
  updateProblemStatus
}
