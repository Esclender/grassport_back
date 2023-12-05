async function getImagePublicUrl (fileToUpload) {
  return new Promise((resolve, reject) => {
    fileToUpload.getSignedUrl({
      action: 'read',
      expires: Date.now() + 5 * 60 * 1000 // URL will expire in 5 minutes
    }, (err, url) => {
      if (err) {
        reject(err)
      } else {
        resolve(url)
      }
    })
  })
}

module.exports = getImagePublicUrl
