const userSchema = require('../models/user')
const adminSchema = require('../models/admins')
const historySchema = require('../models/userHistory')
const favoriteSchema = require('../models/favorite')
const reportSchema = require('../models/reportOfProblem')
const notificacionsSchema = require('../models/notificacions')
const admin = require('../firebase/admin')
const path = require('path')
const CommentSchema = require('../models/comments')
const CanchaSchema = require('../models/cancha')
const { mongo } = require('../helpers/db')
const { generateToken } = require('../utils/jwt')
const { uploadImage, getSignedUlrImg } = require('../utils/firebaseStorageUtils')
const timeAgo = require('../utils/time_ago')
const { getCommentsArray } = require('../utils/canchasUtils')

// const { sendCodeEmail } = require('../utils/authCheck')
async function loginUserWithGoogle ({ body }) {
  const { email } = body
  const isUser = await userSchema.findOne({ email }).exec()
  const isAdmin = await adminSchema.findOne({ email }).exec()

  const userType = isUser ?? isAdmin
  const { nombre } = userType?._doc

  const url = await getSignedUlrImg({ route: `${isAdmin ? 'admins' : 'usuarios'}/${userType.ref}` })
  const token = generateToken({ email, nombre, photoURL: url, isAdmin: isAdmin != null })
  return { token }
}

async function loginSinGoogle ({ body }) {
  const { email, clave } = body
  const isUser = await userSchema.findOne({ email, clave }).exec()
  const isAdmin = await adminSchema.findOne({ email, clave }).exec()

  const userType = isUser ?? isAdmin
  const { nombre } = userType?._doc

  const url = await getSignedUlrImg({ route: `${isAdmin ? 'admins' : 'usuarios'}/${userType.ref}` })
  const token = generateToken({ email, nombre, photoURL: url, isAdmin: isAdmin != null })
  return { token }
}

// TODO: THE SMS MUST BE SENT RIGHT NOW IS JUST A SIMULATION
async function registroUsuario ({ body, image }) { // REGISTRO
  const { nombre } = body

  if (!image) throw Error('Imagen requerida')

  const fileName = Date.now() + path.extname(image.originalname)

  await uploadImage({
    imageRoute: `usuarios/${fileName}`,
    image
  })

  const usuario = userSchema({
    ...body,
    nombre_minuscula: nombre.toLowerCase(),
    isGoogleAuth: false,
    conteo_ingresos: 0,
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
      fecha_creacion: Date.now(),
      status: 0
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

async function getReportDetails ({ id_reporte }) {
  const reportDetails = await reportSchema.aggregate(
    [
      {
        $match: {
          _id: new mongo.ObjectId(id_reporte)
        }
      },
      {
        $addFields: {
          id: '$_id'
        }
      },
      {
        $project: {
          _id: 0,
          __v: 0,
          ref: 0,
          email: 0,
          status: 0
        }
      }
    ]
  )

  console.log(reportDetails)

  return reportDetails[0]
}

async function saveComment ({ body, jwt, isReply = 'false' }) {
  const { email, isGoogleCancha } = jwt
  const { comentario, place_id, commentToReply } = body

  const user = await userSchema.findOne({ email }).exec()

  const commentObject = await new Promise((resolve, reject) => {
    if (isGoogleCancha) {
      resolve({
        nombre: `${user.nombre} ${user.apellido}`,
        comentario,
        replies: [],
        ref: user?.ref,
        place_id,
        fecha_publicado: Date.now(),
        isOwner: false
      })
    } else {
      CanchaSchema.findOne({
        _id: new mongo.ObjectId(place_id),
        ownerEmail: email
      })
        .then((isOwner) => {
          resolve({
            nombre: `${user.nombre} ${user.apellido}`,
            comentario,
            replies: [],
            ref: user?.ref,
            place_id,
            fecha_publicado: Date.now(),
            posted_place_id: mongo.ObjectId(place_id),
            isOwner: isOwner != null && isOwner != undefined
          })
        })
    }
  })

  try {
    if (!JSON.parse(isReply)) {
      const commentToSave = CommentSchema(commentObject)
      await commentToSave.save()
    } else {
      await CommentSchema.updateOne({
        _id: new mongo.ObjectId(commentToReply),
        place_id
      },
      {
        $push: { replies: commentObject }
      }
      )
    }
  } catch {
    const commentToSave = CommentSchema(commentObject)
    await commentToSave.save()
  }
}

async function getNotifications ({
  jwt
}) {
  const { email } = jwt

  const notifications = await notificacionsSchema.aggregate(
    [
      {
        $match: {
          email
        }
      },
      {
        $lookup: {
          from: 'canchas',
          localField: 'id_cancha',
          foreignField: '_id',
          as: 'dataCancha'
        }
      },
      {
        $lookup: {
          from: 'reportes-problemas',
          localField: 'id_reporte',
          foreignField: '_id',
          as: 'dataReporte'
        }
      },
      {
        $addFields: {
          id: '$_id'
        }
      },
      {

        $project: {
          __v: 0,
          _id: 0
        }
      },
      {
        $facet: {
          nuevasNotificaciones: [
            {
              $match: {
                isNuevo: true
              }
            }
          ],
          allNotificaciones: [
            {
              $sort: {
                isNuevo: -1
              }
            }
          ]
        }
      }
    ]
  )

  const nuevasNotificaciones = notifications[0].nuevasNotificaciones.map((noti) => {
    const { fecha_publicado, ...rest } = noti

    return {
      ...rest,
      tiempo_publicado: timeAgo(fecha_publicado)
    }
  })

  const allNotificaciones = notifications[0].allNotificaciones.map((noti) => {
    const { fecha_publicado, ...rest } = noti

    return {
      ...rest,
      tiempo_publicado: timeAgo(fecha_publicado)
    }
  })

  await notificacionsSchema.updateMany({ email }, { isNuevo: false })

  return {
    nuevasNotificacionesCount: nuevasNotificaciones.length,
    nuevasNotificaciones,
    allNotificaciones
  }
}

async function myPlaceDashboard ({ email }) {
  const dataDashboard = await CanchaSchema.aggregate([
    {
      $match: {
        ownerEmail: email
      }
    },
    {
      $group: {
        _id: null,
        canchasArray: {
          $push: '$$ROOT'

        },

        totalComments: {
          $sum: '$comments_count'
        },
        countCanchas: {
          $count: {}
        },
        averageRating: {
          $avg: '$rating'
        }
      }
    },
    {
      $project: {
        _id: 0, // Exclude _id field
        canchasArray: {
          $map: {
            input: '$canchasArray',
            as: 'cancha',
            in: {
              commentsCount: '$$cancha.comments_count',
              name: '$$cancha.name',
              ref: '$$cancha.ref',
              place_id: '$$cancha._id'
            }
          }
        },
        totalComments: 1,
        countCanchas: 1,
        averageRating: 1
      }
    }
  ])

  const { canchasArray, ...rest } = dataDashboard[0]

  const canchasFotos = await Promise.all(
    canchasArray.map(async (c) => {
      const { ref, place_id, ...rest } = c
      const photoURL = await getSignedUlrImg({
        route: `canchas/${ref}`
      })

      const comments = await getCommentsArray({ place_id: String(place_id) })

      console.log(comments, 'COMMENTS')

      return {
        ...rest,
        photoURL,
        comments
      }
    })
  )

  return {
    ...rest,
    canchas: canchasFotos
  }
}

module.exports = {
  loginUserWithGoogle,
  userData,
  getUserHistory,
  saveFavorite,
  obtenerFavorites,
  getUserData,
  reportProblem,
  getReportDetails,
  loginSinGoogle,
  registroUsuario,
  completedRegister,
  deleteFavorite,
  saveComment,
  getNotifications,
  myPlaceDashboard
}
