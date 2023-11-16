const mongoose = require('mongoose')

mongoose.set('strictQuery', true)

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: process.env.DB_NAME
})
  .then(() => console.log('Connected to DB!'))
  .catch(error => console.log(error.message))

module.exports = mongoose
