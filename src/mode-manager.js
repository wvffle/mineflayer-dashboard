const { textBox } = require('./ui')
const { EventEmitter } = require('events')
const blessed = require('blessed')

const modeBox = blessed.box({
  parent: textBox,
  height: 1,
  width: 7,
  tags: true
})

const modes = {}
let currentMode

const emitter = new EventEmitter()

module.exports = {
  modes,

  add (mode) {
    modes[mode.name] = mode
    emitter.emit('new', mode)
  },

  // NOTE: Internally we need only 'on' function
  on (...args) {
    emitter.on(...args)
  },

  set mode (mode) {
    if (mode && typeof mode.name === 'string') {
      mode = mode.name
    }

    if (currentMode) {
      this.mode.window.hide()
    }

    currentMode = mode
    modeBox.width = this.mode.decoratedName.length + 2
    modeBox.setContent(this.mode.decoratedName)

    const { update: updateInput } = require('./input-manager')
    updateInput(mode)

    this.mode.window.show()
  },

  get mode () {
    if (currentMode === undefined) {
      return null
    }

    return modes[currentMode]
  }
}
