const { sin, cos, sqrt, atan2 } = require('mathjs') // Make sure to install the 'mathjs' library using 'npm install mathjs'

function haversine (lat1, lon1, lat2, lon2) {
  // Radius of the Earth in meters
  const R = 6371000.0;

  // Convert latitude and longitude from degrees to radians
  [lat1, lon1, lat2, lon2] = [lat1, lon1, lat2, lon2].map(coord => {
    return coord * Math.PI / 180
  })

  // Calculate the differences in coordinates
  const dlat = lat2 - lat1
  const dlon = lon2 - lon1

  // Haversine formula
  const a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
  const c = 2 * atan2(sqrt(a), sqrt(1 - a))

  // Calculate the distance
  const distance = R * c

  return distance
}

function findPostedCanchasNearbyLocations ({ myLat, myLon, locations, radius }) {
  const nearbyLocations = []

  for (const place of locations) {
    const distance = haversine(myLat, myLon, place.location.lat, place.location.lng)
    if (distance <= radius) {
      nearbyLocations.push(place)
    }
  }

  return nearbyLocations
}

module.exports = findPostedCanchasNearbyLocations
