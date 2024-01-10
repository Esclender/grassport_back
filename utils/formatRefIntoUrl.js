const { getSignedUlrImg } = require('../utils/firebaseStorageUtils')

async function formatRefIntoUser (element, route) {
  const { ref, place_id, ...rest } = element
  const photoURL = await getSignedUlrImg({
    route: `${route}/${ref}`
  })

  return {
    ...rest,
    photoURL
  }
}

module.exports = formatRefIntoUser
