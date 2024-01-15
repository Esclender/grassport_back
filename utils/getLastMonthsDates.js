async function getLastMonths ({ amountPreviousMonths = 3, data }) {
  const dataResponse = data.filter((date) => {
    const actualMonth = new Date().getMonth()

    return (date.getMonth() + amountPreviousMonths) >= actualMonth
  })

  return dataResponse
}

module.exports = getLastMonths
