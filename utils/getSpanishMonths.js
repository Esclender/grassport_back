function getSpanishMonthName (date) {
  const monthNamesSpanish = [
    'Enero', 'Febrero', 'Marzo', 'Abril',
    'Mayo', 'Junio', 'Julio', 'Agosto',
    'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  const monthIndex = date.getMonth()
  return monthNamesSpanish[monthIndex]
}

module.exports = getSpanishMonthName
