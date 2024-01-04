const { getSignedUlrImg } = require('./firebaseStorageUtils')
const timeAgo = require('./time_ago')

async function getCommentsArray ({ data }) {
  const comments = []

  if (data?.length > 0) {
    for (let comment of data) {
      const { ref, fecha_publicado, replies, ...res } = comment
      // console.log(res, 'res')

      const photoURL = await getSignedUlrImg({ route: `usuarios/${ref}` })
      const tiempo_publicado = timeAgo(fecha_publicado)
      let repliesArray = []

      if (replies.length > 0) {
        repliesArray = await getCommentsArray({ data: replies })
      }

      const commentObject = {
        ...res,
        photoURL,
        tiempo_publicado,
        replies: repliesArray
      }

      comments.push(commentObject)
    }

    return comments
  }

  return comments
}

module.exports = {
  getCommentsArray
}
