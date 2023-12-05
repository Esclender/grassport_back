const adminSchema = require('../../models/admins')
// const historySchema = require('../models/userHistory')
// const favoriteSchema = require('../models/favorite')
const reportSchema = require('../../models/reportOfProblem')
// const getPublicImage = require('../utils/retrieveImageFromSto')
// const admin = require('../firebase/admin')
// const path = require('path')
const { generateToken } = require('../../utils/jwt')

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

async function getReports ({ user }) {
  // const bucket = admin.storage().bucket()

  // const fileToUpload = bucket.file(refImg)

  const allReports = await reportSchema.aggregate(
    [
      {
        $project: {
          _id: 0,
          __v: 0
        }
      }
    ]
  )

  return allReports
}

module.exports = {
  getReports,
  acceso
}
