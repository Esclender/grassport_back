const { default: axios } = require('axios')
const History = require('../models/userHistory')

const CanchasSchema = require('../models/cancha')
const { Client } = require('@googlemaps/google-maps-services-js')
const findPostedCanchasNearbyLocations = require('../utils/haversineFormule')
const { getSignedUlrImg } = require('../utils/firebaseStorageUtils')
const { getCommentsArray } = require('../utils/canchasUtils')
const client = new Client({})
const defaultImg = 'https://ichef.bbci.co.uk/news/640/cpsprodpb/238D/production/_95410190_gettyimages-488144002.jpg'

async function getGeolocation ({ latitude, longitude }) {
  return new Promise((resolve, reject) => {
    const args = {
      params: {
        key: process.env.GOOGLE_MAPS_API_KEY,
        latlng: {
          latitude,
          longitude
        }
      }
    }

    client.reverseGeocode(args)
      .then(({ data }) => {
        const adrresses = data.results

        console.log(adrresses)

        resolve({
          location: {
            lat: latitude,
            lng: longitude
          },
          street: adrresses[1].formatted_address,
          locality: adrresses[adrresses.length - 2].formatted_address
        })
      }).catch((err) => {
        console.log(err)
        reject(err)
      })
  })
}

async function getNearbyLocations ({ latitude, longitude, radius = 200, keyword = 'cancha, grass' }) {
  let Response = []
  let canchasPostedData = await CanchasSchema.aggregate(
    [
      {
        $project: {
          __v: 0
        }
      },
      {
        $addFields: {
          place_id: '$_id'
        }
      },
      {
        $unset: '_id'
      }
    ]
  )

  const locationsFinded = findPostedCanchasNearbyLocations({
    myLat: latitude,
    myLon: longitude,
    locations: canchasPostedData,
    radius: 200
  })

  if (locationsFinded.length > 0) {
    const data = await Promise.all(
      locationsFinded.map(async (cancha) => {
        const { ref, place_id, ...rest } = cancha

        const url = await getSignedUlrImg({ route: `canchas/${ref}` })
        const comments = await getCommentsArray({ place_id, isPostedCanchas: true })

        return {
          ...rest,
          photoURL: url,
          comments,
          place_id
        }
      })
    )

    Response.push(...data)
  }

  try {
    const response = await client.placesNearby({
      params: {
        key: process.env.GOOGLE_MAPS_API_KEY,
        location: {
          latitude,
          longitude
        },
        radius,
        language: 'es',
        keyword
      }
    })

    const nearbyLocations = await Promise.all(
      response.data.results.map(async (location) => {
        const { geometry, name, vicinity, rating, opening_hours, photos, place_id } = location
        const photoR = photos != undefined ? photos[0].photo_reference : null
        const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoR}&key=AIzaSyDqtTbNkH59t_Ia6vzUGTH7vNAXaeL8g0Q`

        console.log(place_id)

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
      })
    )

    Response.push(...nearbyLocations)

    return Response
  } catch (error) {
    console.error('Error fetching nearby locations:', error.message)
    throw error
  }
}

// FUNCTION TO GET ALL LOCATIONS SEARCHED BY ADDRESS
async function findByAddress ({ address, userToken }) {
  const args = {
    params: {
      key: process.env.GOOGLE_MAPS_API_KEY,
      address,
      components: 'country:PE|locality:LIMA'
    }
  }

  const response = await client.geocode(args)
  const locationsArray = response.data.results.map((res) => {
    const { formatted_address, address_components, geometry } = res

    return {
      leading: 'place',
      street: formatted_address,
      locality: address_components[0].short_name,
      location: geometry.location,
      emailUsuario: userToken?.email ?? null
    }
  })

  return locationsArray
}

async function searchCanchasLocations ({ nombre, userToken }) {
  const mapsPlacesEndpoint = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${nombre}+cancha+Lima,Peru&key=${process.env.GOOGLE_MAPS_API_KEY}`
  const responseApi = await axios.get(mapsPlacesEndpoint)

  const locationsArray = responseApi.data.results.map((res) => {
    const { formatted_address, name, geometry } = res

    return {
      leading: 'place',
      street: formatted_address,
      locality: name,
      location: geometry.location,
      emailUsuario: userToken?.email ?? null
    }
  })

  return locationsArray
}

async function saveHistoryLocation ({ data, userToken }) {
  const isSaved = await History.findOne({ street: data.street, emailUsuario: userToken?.email }).exec()

  if (!isSaved) {
    const mappedData = new History({
      ...data,
      leading: 'history',
      emailUsuario: userToken?.email ?? null,
      fecha_busqueda: Date.now()
    })

    await mappedData.save()
  }
}

module.exports = {
  getGeolocation,
  getNearbyLocations,
  findByAddress,
  saveHistoryLocation,
  searchCanchasLocations
}
