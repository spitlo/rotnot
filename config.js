module.exports = {
  table: {
    drawHorizontalLine: (index, size) =>
      index < 2 || (index - 1) % 5 === 0 || index === size,
    columns: {
      0: {
        alignment: 'left',
        width: 33,
      },
      1: {
        alignment: 'right',
        width: 10,
      },
      2: {
        alignment: 'right',
        width: 10,
      },
    },
  },
}
