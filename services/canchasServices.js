const CanchasSchema = require('../models/cancha')
const { uploadImage, getSignedUlrImg, deleteImageFirebase } = require('../utils/firebaseStorageUtils')
const { Client } = require('@googlemaps/google-maps-services-js')
const { getCommentsArray } = require('../utils/canchasUtils')
const formatRefIntoUrl = require('../utils/formatRefIntoUrl')
const { mongo } = require('../helpers/db')
const path = require('path')
const User = require('../models/user')
const calculateRating = require('../utils/calculateRating')
const Interaccion = require('../models/interaccionModel')

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
    rating: 1,
    ratingCount: 0,
    isOpen: false,
    comments_count: 0,
    place_id
  })

  await saveInMongo.save()
}

async function canchasGoogleInfo ({ id_cancha, email }) {
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

async function canchasPostedInfo ({ id_cancha, email }) {
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

    const isCanchaRated = await Interaccion.findOne({
      place_id: String(place_id),
      email
    })

    return {
      ...rest,
      ownerName: `${ownerData.nombre} ${ownerData.apellido}`,
      photoURL: url,
      userURL: urlOwner,
      comments,
      isRated: isCanchaRated != null,
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
    canchasArray.map(async (element) => {
      return await formatRefIntoUrl(element, 'canchas')
    })
  )

  return objectResponse
}

async function updateCanchaPostedData ({ place_id, body, image }) {
  const cancha = await CanchasSchema.findById(mongo.ObjectId(place_id)).exec()

  const ref = await new Promise((resolve, reject) => {
    if (image) {
      const fileName = Date.now() + path.extname(image.originalname)

      deleteImageFirebase({
        imageRoute: `canchas/${cancha.ref}`
      })
        .catch((e) => { reject(Error('Error al borrar la imagen')) })

      uploadImage({
        imageRoute: `canchas/${fileName}`,
        image
      }).then(() => {
        resolve({
          ref: fileName
        })
      })
        .catch(() => { reject(Error('Error al subir la imagen')) })
    } else {
      resolve({})
    }
  })

  await CanchasSchema.findByIdAndUpdate(mongo.ObjectId(place_id), {
    ...body,
    ...ref
  })
}

async function giveRatingCanchaPosted ({ place_id, givenRating, email }) {
  const cancha = await CanchasSchema.findById(mongo.ObjectId(place_id))

  const calculatedRating = calculateRating(givenRating, cancha)

  await CanchasSchema.findByIdAndUpdate(mongo.ObjectId(place_id),
    {
      $inc: { ratingCount: 1 },
      rating: calculatedRating
    })

  await Interaccion({ place_id, rating: true, email }).save()
}

module.exports = {
  saveCanchaPostedData,
  canchasGoogleInfo,
  canchasPostedInfo,
  userPostedCanchas,
  updateCanchaPostedData,
  giveRatingCanchaPosted
}
