const modeManager = require('./mode-manager')
const inputManager = require('./input-manager')
const log = require('./log')

module.exports = function (bot) {
  const commands = {
    exit: () => {
      if (!bot.dashboard._ended) {
        log('Killing bot. Press C-c again or type \':exit\' to quit the program')
        return bot.end()
      }

      process.exit()
    },
    clear: () => modeManager.mode.window.setContent(''),
    help: () => log('Available commands:', ...Object.keys(commands))
  }

  for (const mode in modeManager.modes) {
    commands[mode] = () => modeManager.mode = mode
  }

  modeManager.on('new', (mode) => {
    commands[mode.name] = () => modeManager.mode = mode
  })

  return commands
}
