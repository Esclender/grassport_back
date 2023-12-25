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

module.exports = {
  deleteImageFirebase,
  uploadImage
}
