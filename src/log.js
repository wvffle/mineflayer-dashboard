const { inspect } = require('util')
const { logBox, screen } = require('./ui')

const inspectOptions = { colors: true }
module.exports = function (...args) {
  for (const arg of args) {
    const str = typeof arg === 'string' ? arg : inspect(arg, inspectOptions)
    const arr = str.split('\n')
    const date = new Date().toLocaleString()

    logBox.pushLine(` ${arr[0]}{|}{gray-fg}${date}{/} `)
    for (const line of arr.slice(1)) {
      logBox.pushLine(' ' + line)
    }

    logBox.scrollTo(logBox.getScrollHeight())
    screen.render()
  }
}
