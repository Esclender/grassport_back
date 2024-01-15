function calculateRating (givenRating, cancha) {
  return Math.floor((cancha.ratingCount * cancha.rating + (1 * givenRating)) / (cancha.ratingCount + 1))
}

module.exports = calculateRating
