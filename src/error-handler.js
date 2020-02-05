const { logBox, screen } = require('./ui')
const PrettyError = require('pretty-error')

const pe = new PrettyError()
pe.skipNodeFiles()
pe.skipPackage('blessed', 'vm')
pe.skipPath(__filename)

module.exports = function (bot) {
  // NOTE: Remove listener created by logErrors: true
  bot.removeAllListeners('error')
  bot.on('error', err => {
    logBox.pushLine(pe.render(err))
    logBox.scrollTo(logBox.getScrollHeight())
    screen.render()
  })

  process.on('uncaughtException', (err) => {
    logBox.pushLine(pe.render(err))
    logBox.scrollTo(logBox.getScrollHeight())
    screen.render()
  })

  return function (err) {
    logBox.pushLine(pe.render(err))
    logBox.scrollTo(logBox.getScrollHeight())
    screen.render()
  }
}
