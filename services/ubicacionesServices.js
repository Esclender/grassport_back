// const userSchema = require('../models/user')
const { Client } = require('@googlemaps/google-maps-services-js')
const client = new Client({})
// const { geocodeGoogle } = require('../clients/googleInstance')

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
          street: adrresses[1].formatted_address,
          locality: adrresses[4].formatted_address
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

    // console.log(client.placePhoto({
    //   params: {

    //   }
    // }))

    const nearbyLocations = response.data.results.map((location) => {
      const { geometry, name, vicinity, rating, opening_hours } = location

      return {
        location: geometry.location,
        name,
        address: vicinity,
        rating,
        isOpen: opening_hours?.open_now ?? null
      }
    })

    return nearbyLocations
  } catch (error) {
    console.error('Error fetching nearby locations:', error.message)
    throw error
  }
}

module.exports = {
  getGeolocation,
  getNearbyLocations
}
