function convertISOToYYMMDD (isoDate) {
  const date = new Date(isoDate)

  // Extracting components
  const year = date.getFullYear() % 100 // Get last two digits of the year
  const month = String(date.getMonth() + 1).padStart(2, '0') // Months are 0-based
  const day = String(date.getDate()).padStart(2, '0')

  // Joining components with "-"
  const yyMMddDate = `${year}-${month}-${day}`

  return yyMMddDate
}

module.exports = convertISOToYYMMDD
