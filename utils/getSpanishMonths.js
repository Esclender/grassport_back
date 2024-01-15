function getSpanishMonthName (date) {
  const monthNamesSpanish = [
    'enero', 'febrero', 'marzo', 'abril',
    'mayo', 'junio', 'julio', 'agosto',
    'septiembre', 'octubre', 'noviembre', 'diciembre'
  ]

  const monthIndex = date.getMonth()
  return monthNamesSpanish[monthIndex]
}

module.exports = getSpanishMonthName
