const blessed = require('blessed')
const { textBox } = require('../src/ui')
const modeManager = require('../src/mode-manager')

const input = blessed.textbox({
  parent: textBox,
  width: '100%-9',
  height: 1,
  left: 7
})

let cursor = 0

input._listener = async function (ch, key) {
  const value = this.value
  const program = this.screen.program
  const mode = modeManager.mode

  function move (direction) {
    // `direction` is 1 for right and -1 for left
    program._write(direction === -1 ? '\x1b[1D' : '\x1b[1C')
    cursor += direction
  }

  if (key.name === 'tab') {
    const res = await mode.complete(value.slice(0, cursor), key.shift ? -1 : 1)
    this.value = value.slice(0, cursor) + res
    return this.screen.render()
  } else if (mode.resetCompletion()) {
    cursor = value.length
  }

  let handled = true
  switch (key.full) {
    case 'C-c':
      if (value.length) {
        this.value = ''
        cursor = 0
      } else {
        // NOTE: run :exit command in this mode
        await mode.interprete(':exit')
      }
      break

    case 'S-up':
      mode.scroll(1)
      break

    case 'S-down':
      mode.scroll(-1)
      break

    case 'enter':
      if (value.trim() !== '') {
        mode.history.push(this.value)
      }

      await mode.interprete(this.value)

      cursor = 0
      this.value = ''
      break

    default: handled = false
  }

  if (!handled) {
    handled = true

    switch (key.name) {
      case 'left':
        if (cursor - 1 >= 0) move(-1)
        break

      case 'right':
        if (cursor + 1 <= value.length) move(1)
        break

      case 'up':
        this.value = mode.history.prev()
        cursor = this.value.length
        break

      case 'down':
        this.value = mode.history.next()
        cursor = this.value.length
        break

      case 'backspace':
        // require('./log')(value, cursor)
        if (!value.length || cursor <= 0) break

        // TODO: Handle utf8 characters
        this.value = value.slice(0, cursor - 1) + value.slice(cursor)
        cursor -= 1
        break

      default: handled = false
    }
  }

  if (!handled && !/^[\x00-\x08\x0b-\x0c\x0e-\x1f\x7f]$/.test(ch)) {
    this.value = value.slice(0, cursor) + ch + value.slice(cursor)
    cursor += 1
  }

  // Update the screen if value has changed
  if (value !== this.value) {
    this.screen.render()
  }
}

module.exports = function () {
  input.readInput()
  input.screen.render()
}
