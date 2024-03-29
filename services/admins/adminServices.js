const adminSchema = require('../../models/admins')
// const historySchema = require('../models/userHistory')
// const favoriteSchema = require('../models/favorite')
const reportSchema = require('../../models/reportOfProblem')
// const getPublicImage = require('../utils/retrieveImageFromSto')
const admin = require('../../firebase/admin')
const userSchema = require('../../models/user')
// const path = require('path')
const { generateToken } = require('../../utils/jwt')
const getLastMonday = require('../../utils/getLastMonday')
const convertISOToYYMMDD = require('../../utils/convertISOdates')
const Cancha = require('../../models/cancha')
const ingresosSchema = require('../../models/analisisIngresos')

async function acceso ({ body }) {
  return new Promise((resolve, reject) => {
    const { email } = body

    adminSchema.findOne({ email })
      .then(() => {
        const token = generateToken({ email, isAdmin: true })
        resolve(token)
      }).catch((err) => {
        reject(err)
      })
  })
}

async function getReports () {
  const allReports = await reportSchema.aggregate(
    [
      {
        $match: {
          status: 0
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
  )

  const expirationDate = new Date()
  expirationDate.setDate(expirationDate.getDate() + 1)

  const reportsWithImageURLs = await Promise.all(
    allReports.map(async (report) => {
      const { ref, fecha_creacion } = report
      const bucket = admin.storage().bucket()
      const destinationFolder = 'reportes'

      const fileToUpload = bucket.file(`${destinationFolder}/${ref}`)

      const [url] = await fileToUpload.getSignedUrl({
        action: 'read',
        expires: expirationDate.toISOString()
      })

      return {
        ...report,
        imageURL: url,
        fecha_creacion: convertISOToYYMMDD(fecha_creacion)
      }
    })
  )

  return reportsWithImageURLs
}

async function getUsersList ({ tops = 10, filterName, filterEmail, filterDate, orderBy }) {
  try {
    const matchConditions = {}

    if (filterName) {
      matchConditions.nombre_minuscula = { $regex: filterName, $options: 'i' } // Case-insensitive regex search
    } else if (filterEmail) {
      matchConditions.email = { $regex: filterEmail, $options: 'i' }
    }

    if (filterDate) {
      matchConditions.fecha_creacion = { $gte: new Date(filterDate) }
    }

    const [ordenPor, orden] = orderBy?.split(',') ?? []
    const checkOrder = (sort) => sort == 'asc' ? 1 : -1

    const projectFields = {
      _id: 0,
      __v: 0,
      clave: 0
    }

    const sortConditions = {}
    if (ordenPor === 'nombre') {
      sortConditions.nombre_minuscula = checkOrder(orden)
    } else if (ordenPor === 'fecha_creacion') {
      sortConditions.fecha_creacion = checkOrder(orden)
    } else if (ordenPor === 'conteo_ingresos') {
      sortConditions.conteo_ingresos = checkOrder(orden)
    } else {
      sortConditions.fecha_creacion = 1
    }

    const adminsPipeline = [
      { $project: { email: 1 } }
    ]

    const adminEmails = await adminSchema.aggregate(adminsPipeline)
    const emailToExclude = adminEmails.map((admin) => admin.email)

    const pipeline = [
      {
        $match: {
          ...matchConditions,
          isGoogleAuth: false
        }
      },
      { $project: projectFields },

      { $sort: sortConditions }
    ]

    const topIngresosPipeline = [
      {
        $match: {
          email: { $nin: emailToExclude },
          isGoogleAuth: false
        }
      },
      { $sort: { conteo_ingresos: -1 } },
      { $limit: Number(tops) },
      { $project: projectFields }
    ]

    const topIngresos = await userSchema.aggregate(topIngresosPipeline)
    const allUsers = await userSchema.aggregate(pipeline)

    // Calculate expiration date (one day from now)
    const expirationDate = new Date()
    expirationDate.setDate(expirationDate.getDate() + 1)

    const usersWithImageURLs = await Promise.all(
      allUsers.map(async (user) => {
        const { ref, fecha_creacion, fecha_ultimo_ingreso } = user
        const bucket = admin.storage().bucket()
        const destinationFolder = 'usuarios'

        const fileToUpload = bucket.file(`${destinationFolder}/${ref}`)

        const [url] = await fileToUpload.getSignedUrl({
          action: 'read',
          expires: expirationDate.toISOString()
        })

        return {
          ...user,
          imageURL: url,
          fecha_creacion: convertISOToYYMMDD(fecha_creacion),
          fecha_ultimo_ingreso: convertISOToYYMMDD(fecha_ultimo_ingreso)
        }
      })
    )

    const topUsersWithImageURLs = await Promise.all(
      topIngresos.map(async (user) => {
        const { ref, fecha_creacion, fecha_ultimo_ingreso } = user
        const bucket = admin.storage().bucket()
        const destinationFolder = 'usuarios'

        const fileToUpload = bucket.file(`${destinationFolder}/${ref}`)

        const [url] = await fileToUpload.getSignedUrl({
          action: 'read',
          expires: expirationDate.toISOString()
        })

        return {
          ...user,
          imageURL: url,
          fecha_creacion: convertISOToYYMMDD(fecha_creacion),
          fecha_ultimo_ingreso: convertISOToYYMMDD(fecha_ultimo_ingreso)

        }
      })
    )

    return {
      lista_usuarios: usersWithImageURLs,
      topIngresos: topUsersWithImageURLs
    }
  } catch (error) {
    console.error('Error getting users list:', error)
    throw error
  }
}

async function getAdminPanel ({ user }) {
  const { email } = user

  const adminsPipeline = [
    { $project: { email: 1 } }
  ]

  const expirationDate = new Date()
  expirationDate.setDate(expirationDate.getDate() + 1)

  const adminEmails = await adminSchema.aggregate(adminsPipeline)
  const emailToExclude = adminEmails.map((admin) => admin.email)

  const usuariosCount = await userSchema.countDocuments({ isGoogleAuth: false, email: { $nin: emailToExclude } })
  const reportesCount = await reportSchema.countDocuments()
  const postedCanchasCount = await Cancha.countDocuments()

  const today = new Date()

  const threeMonthsAgo = new Date()
  threeMonthsAgo.setMonth(today.getMonth() - 3)

  const dataIngresos = await ingresosSchema.aggregate(
    [
      {
        $match: {
          fecha: {
            $gte: threeMonthsAgo
          }
        }
      },
      {
        $sort: {
          fecha: 1
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

  const reportesWeekCount = await reportSchema.aggregate(
    [
      {
        $match: {
          fecha_creacion: { $gte: getLastMonday() }
        }
      },
      {
        $count: 'totalReports'
      }
    ]
  )

  const adminInfo = await adminSchema.aggregate(
    [
      {
        $match: {
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

  const admin_info = {
    ...adminInfo[0]
  }

  const { ref } = admin_info
  const bucket = admin.storage().bucket()
  const destinationFolder = 'admins'

  const fileToUpload = bucket.file(`${destinationFolder}/${ref}`)

  const [url] = await fileToUpload.getSignedUrl({
    action: 'read',
    expires: expirationDate.toISOString()
  })

  return {
    reports_week: reportesWeekCount[0]?.totalReports ?? 0,
    usuariosCount,
    reportesCount,
    postedCanchasCount,
    ingresosLastMonths: dataIngresos,
    admin_info: {
      ...admin_info,
      imageURL: url
    }
  }
}

async function getCanchasLocations () {
  const locations = await Cancha.aggregate(
    [
      {
        $addFields: {
          place_id: '$_id'
        }
      },
      {
        $project: {
          location: 1,
          place_id: 1,
          _id: 0
        }
      }
    ]
  )

  return locations
}

async function updateProblemStatus ({ body, idReport }) {
  const { comentario } = body

  await reportSchema.findByIdAndUpdate(idReport, {
    comentario,
    status: 1
  })
}

module.exports = {
  getReports,
  acceso,
  getUsersList,
  getAdminPanel,
  updateProblemStatus,
  getCanchasLocations
}
