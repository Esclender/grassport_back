const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const logger = require('morgan')

const indexRouter = require('./routes/index')
const usuarioRouter = require('./routes/usersRoutes')
const ubicacionesRouter = require('./routes/ubicacionesRoutes')
const adminsRouter = require('./routes/adminsRoutes')

const app = express()
const corsOptions = {
  origin: '*',
  credentials: true,
  optionSuccessStatus: 200
}

// view engine setup
app.use(cors(corsOptions))
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Routes
app.use('/', indexRouter)
app.use('/usuarios', usuarioRouter)
app.use('/ubicacion', ubicacionesRouter)
app.use('/admins', adminsRouter)

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
