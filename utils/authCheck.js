const { Resend } = require('resend')

function sendCodeEmail ({ to }) {
  return new Promise((resolve, reject) => {
    const code = Math.floor(Math.random() * 10000)

    const resend = new Resend(process.env.RESEND_API_KEY)

    resend.emails.send({
      from: 'onboarding@resend.dev',
      to,
      subject: 'Grassport - Tu codigo de verificacion',
      html: `<p>Tu codigo de verificacion es: <strong>${code}</strong>!</p>`
    }).then((message) => {
      console.log(`Sent verification email with code ${code} to ${to}.`)
      resolve(code)
    })
  })
}

module.exports = {
  sendCodeEmail
}
