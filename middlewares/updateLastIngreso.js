const userSchema = require('../models/user')
const ingresosSchema = require('../models/analisisIngresos')
const adminSchema = require('../models/admins')

async function updateLastIngreso (req, res, next) {
  const { email } = req.body
  const actualDate = new Date()
  const mes = actualDate.getMonth()
  const isMonthRegistered = await ingresosSchema.findOne({ mes }).exec()

  const isAdmin = await adminSchema.findOne({ email })

  if (isAdmin == null) {
    await userSchema.updateOne({ email }, {
      fecha_ultimo_ingreso: actualDate
    })

    await userSchema.updateOne({ email }, { $inc: { conteo_ingresos: 1 } })

    if (isMonthRegistered) {
      await ingresosSchema.findOneAndUpdate({ mes }, {
        $inc: {
          total_ingresos: 1
        }
      })
    } else {
      const ingreso = ingresosSchema({ mes, total_ingresos: 1 })

      await ingreso.save()
    }
  }

  next()
}

module.exports = updateLastIngreso
