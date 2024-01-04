function timeAgo (date) {
  const now = new Date()
  const timeDifference = now - date

  // Convert time difference to seconds
  const seconds = Math.floor(timeDifference / 1000)

  // Define time intervals
  const intervals = [
    { name: 'año', seconds: 31536000 },
    { name: 'mes', seconds: 2592000 },
    { name: 'semana', seconds: 604800 },
    { name: 'dia', seconds: 86400 },
    { name: 'hora', seconds: 3600 },
    { name: 'minuto', seconds: 60 },
    { name: 'segundo', seconds: 1 }
  ]

  // Find the appropriate interval
  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds)
    if (count >= 1) {
      if (interval.name == 'mes') {
        return count > 1
          ? `Hace ${count} ${interval.name}es`
          : `Hace 1 ${interval.name}`
      }

      return count > 1
        ? `Hace ${count} ${interval.name}s`
        : `Hace 1 ${interval.name}`
    }
  }

  return 'Ahora'
}

module.exports = timeAgo
