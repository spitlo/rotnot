module.exports = {
  table: {
    drawHorizontalLine: (index, size) =>
      index < 2 || (size > 9 && (index - 1) % 10 === 0) || index === size,
    columns: {
      0: {
        alignment: 'left',
        width: 24,
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
