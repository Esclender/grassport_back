const CanchasSchema = require('../models/cancha')
const { uploadImage } = require('../utils/firebaseStorageUtils')
const path = require('path')

async function saveCanchaPostedData ({ body, image, jwt }) {
  const { location, ...rest } = body
  const { email, nombre } = jwt

  const fileName = image == null ? 'profile-ddefault.png' : Date.now() + path.extname(image.originalname)

  if (image) {
    await uploadImage({
      imageRoute: `canchas/${fileName}`,
      image
    })
  } else {
    throw Error('Image Required')
  }

  const saveInMongo = CanchasSchema({
    ...rest,
    location: JSON.parse(location),
    ref: fileName,
    ownerEmail: email,
    ownerName: nombre,
    rating: 5,
    isOpen: false
  })

  await saveInMongo.save()
}

module.exports = {
  saveCanchaPostedData
}
