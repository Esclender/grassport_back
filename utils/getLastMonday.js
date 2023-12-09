function getLastMonday () {
  const today = new Date()
  const dayOfWeek = today.getUTCDay()
  const diff = today.getUTCDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1) // Adjust for Sundays
  const lastMonday = new Date()
  lastMonday.setUTCDate(diff)

  // Optionally, set time to 00:00:00 to get the start of the day
  lastMonday.setUTCHours(0, 0, 0, 0)

  return lastMonday
}

module.exports = getLastMonday
