const admin = require('../firebase/admin')

async function deleteImageFirebase ({ imageRoute }) {
  const bucket = admin.storage().bucket()

  const fileToUpload = bucket.file(imageRoute)// `usuarios/${userData.ref}`

  await fileToUpload.delete()
}

async function uploadImage ({ imageRoute, image }) {
  const bucket = admin.storage().bucket()

  const fileToUpload = bucket.file(imageRoute) // `usuarios/${fileName}`

  await fileToUpload.save(image.buffer, {
    metadata: {
      contentType: image.mimetype
    }
  })
}

async function getSignedUlrImg ({ route }) {
  const bucket = admin.storage().bucket()

  const fileToUpload = bucket.file(route)
  const expirationDate = new Date()
  expirationDate.setDate(expirationDate.getDate() + 1)

  const [url] = await fileToUpload.getSignedUrl({
    action: 'read',
    expires: expirationDate.toISOString()
  })

  return url
}

module.exports = {
  deleteImageFirebase,
  uploadImage,
  getSignedUlrImg
}
