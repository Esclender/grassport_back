const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const client = require('twilio')(accountSid, authToken)

function sendCodeEmail ({ to }) {
  return new Promise((resolve, reject) => {
    const code = Math.floor(Math.random() * 10000)

    client.messages
      .create({
        body: 'Tu codigo de verificacion de grassport',
        from: '+15017122661',
        to
      })
      .then(message => resolve(code))
  })
}

module.exports = {
  sendCodeEmail
}
