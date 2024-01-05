const { uploadImage } = require('../utils/firebaseStorageUtils')
const { default: axios } = require('axios')

async function saveGoogleUserImg ({ urlToRetrieve }) {
  try {
    const response = await axios.get(urlToRetrieve, { responseType: 'arraybuffer' })
    const imageBuffer = Buffer.from(response.data, 'binary')

    // Extract content-type from headers
    const contentType = response.headers['content-type']

    // Extract image format from content-type
    const ext = contentType.split('/')[1]

    const ref = `${Date.now()}.${ext}`

    await uploadImage({
      imageRoute: `usuarios/${ref}`,
      image: {
        buffer: imageBuffer,
        mimetype: contentType
      }
    })

    return ref
  } catch (e) {
    if (e.status == 401) {
      return 'profile-ddefault.png'
    }
  }
}

module.exports = saveGoogleUserImg
