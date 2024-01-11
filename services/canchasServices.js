const CanchasSchema = require('../models/cancha')
const { uploadImage, getSignedUlrImg } = require('../utils/firebaseStorageUtils')
const { Client } = require('@googlemaps/google-maps-services-js')
const { getCommentsArray } = require('../utils/canchasUtils')
const formatRefIntoUrl = require('../utils/formatRefIntoUrl')
const { mongo } = require('../helpers/db')
const path = require('path')
const User = require('../models/user')
const client = new Client({})
const defaultImg = 'https://ichef.bbci.co.uk/news/640/cpsprodpb/238D/production/_95410190_gettyimages-488144002.jpg'

async function saveCanchaPostedData ({ body, image, jwt }) {
  const { location, place_id, ...rest } = body
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
    isOpen: false,
    comments_count: 0,
    place_id
  })

  await saveInMongo.save()
}

async function canchasGoogleInfo ({ id_cancha }) {
  const googleCancha = await client.placeDetails({
    params: {
      key: process.env.GOOGLE_MAPS_API_KEY,
      place_id: id_cancha
    }
  })

  const { geometry, name, vicinity, rating, opening_hours, photos, place_id } = googleCancha.data.result
  const photoR = photos != undefined ? photos[0].photo_reference : null
  const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoR}&key=AIzaSyDqtTbNkH59t_Ia6vzUGTH7vNAXaeL8g0Q`

  const comments = await getCommentsArray({ place_id })

  return {
    location: {
      latitude: geometry.location.lat,
      longitude: geometry.location.lng
    },
    name,
    address: vicinity,
    rating: Math.round(rating),
    isOpen: opening_hours?.open_now ?? null,
    photoURL: photoR != null ? url : defaultImg,
    place_id,
    comments

  }
}

async function canchasPostedInfo ({ id_cancha }) {
  const cancha = await CanchasSchema.aggregate(
    [
      {
        $match: {
          _id: mongo.ObjectId(id_cancha)
        }
      },
      {
        $addFields: {
          place_id: '$_id'
        }
      }, {
        $project: {
          __v: 0,
          _id: 0
        }
      }
    ]
  )

  if (cancha.length > 0) {
    const { ref, place_id, ownerEmail, ...rest } = cancha[0]

    const ownerData = await User.findOne({ email: ownerEmail }).exec()
    const url = await getSignedUlrImg({ route: `canchas/${ref}` })
    const urlOwner = await getSignedUlrImg({ route: `usuarios/${ownerData.ref}` })
    const comments = await getCommentsArray({ place_id: id_cancha, isPostedCanchas: true })

    return {
      ...rest,
      ownerName: `${ownerData.nombre} ${ownerData.apellido}`,
      photoURL: url,
      userURL: urlOwner,
      comments,
      place_id
    }
  }

  return {}
}

async function userPostedCanchas ({ jwt }) {
  const { email } = jwt
  const canchasArray = await CanchasSchema.aggregate(
    [
      {
        $match: {
          ownerEmail: email
        }
      },
      {
        $addFields: {
          place_id: '$_id'
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

  const objectResponse = await Promise.all(
    canchasArray.map(formatRefIntoUrl)
  )

  return objectResponse
}

module.exports = {
  saveCanchaPostedData,
  canchasGoogleInfo,
  canchasPostedInfo,
  userPostedCanchas
}
