const admin = require('firebase-admin')
const serviceAccount = require('./grassportapp-7ccb1-firebase-adminsdk-z9wf6-293f31159a.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'gs://grassportapp-7ccb1.appspot.com'
})

module.exports = admin
