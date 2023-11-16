const axios = require('axios').default

const geocodeGoogle = axios.create({
  baseURL: 'https://maps.googleapis.com/maps/api/',
  timeout: 1000
})

module.exports = {
  geocodeGoogle
}
