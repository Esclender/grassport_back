const { default: axios } = require('axios')
const History = require('../models/userHistory')
const { Client } = require('@googlemaps/google-maps-services-js')
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

async function getNearbyLocations ({ latitude, longitude, radius = 1000, keyword = 'cancha, grass' }) {
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

    const nearbyLocations = response.data.results.map((location) => {
      const { geometry, name, vicinity, rating, opening_hours, photos } = location

      const photoR = photos[0].photo_reference
      const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoR}&key=AIzaSyDqtTbNkH59t_Ia6vzUGTH7vNAXaeL8g0Q`

      return {
        location: {
          latitude: geometry.location.lat,
          longitude: geometry.location.lng
        },
        name,
        address: vicinity,
        rating: Math.round(rating),
        isOpen: opening_hours?.open_now ?? null,
        photoURL: photoR != null ? url : defaultImg
      }
    })

    return nearbyLocations
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
  console.log(isSaved)

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
