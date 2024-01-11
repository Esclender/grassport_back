const { getSignedUlrImg } = require('../utils/firebaseStorageUtils')

async function formatRefIntoUser (element, route) {
  const { ref, ...rest } = element
  const photoURL = await getSignedUlrImg({
    route: `${route}/${ref}`
  })

  return {
    ...rest,
    photoURL
  }
}

module.exports = formatRefIntoUser
