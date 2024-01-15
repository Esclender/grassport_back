function removeDuplicates (array1, array2) {
  const uniquePlaceIds = new Set(array2.map(element => element.place_id.toString()))

  array1 = array1.filter(element => !uniquePlaceIds.has(element.place_id.toString()))

  return array1
}

module.exports = removeDuplicates
