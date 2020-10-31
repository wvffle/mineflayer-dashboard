const blessed = require('blessed')
const { textBox } = require('./ui')
const modeManager = require('./mode-manager')

const input = blessed.textbox({
  parent: textBox,
  width: '100%-9',
  height: 1,
  left: 7
})

let cursor = 0
let offset = 0
let completionBase = null

input._listener = async function (ch, key) {
  const value = this.value
  const program = this.screen.program
  const mode = modeManager.mode

  function move (direction) {
    // `direction` is 1 for right and -1 for left
    program._write(direction === -1 ? '\x1b[1D' : '\x1b[1C')
    cursor += direction
    offset += direction
  }

  if (key.name === 'tab') {
    const toComplete = value.slice(0, cursor)

    if (!toComplete.startsWith(completionBase)) {
      completionBase = toComplete
    }

    const right = value.slice(cursor)
    try {
      const res = await mode.complete(completionBase, key.shift ? -1 : 1)
      this.value = res + right
      cursor = res.length
    } catch {
      completionBase = null
      mode.resetCompletion()
      return
    }

    return this.screen.render()
  } else if (mode.resetCompletion()) {
    completionBase = null
    cursor = value.length
  }

  let handled = true
  switch (key.full) {
    case 'C-c':
      if (value.length) {
        if (offset < 0) {
          while (offset++) {
            program._write('\x1b[1C')
          }

          this.screen.render()
        }

        this.value = ''
        offset = 0
        cursor = 0
      } else {
        // NOTE: run :exit command in this mode
        await mode.interpret(':exit')
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

      await mode.interpret(this.value)

      if (offset < 0) {
        while (offset++) {
          program._write('\x1b[1C')
        }

        this.screen.render()
      }

      offset = 0
      cursor = 0
      this.value = ''
      break

    default: handled = false
  }

  if (!handled) {
    handled = true

    let prev
    switch (key.name) {
      case 'left':
        if (cursor - 1 >= 0) move(-1)
        break

      case 'right':
        if (cursor + 1 <= value.length) move(1)
        break

      case 'up':
        prev = mode.history.prev()
        if (!prev) break

        this.value = prev
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

  // eslint-disable-next-line
  if (!handled && ch && !/^[\x00-\x08\x0b-\x0c\x0e-\x1f\x7f]$/.test(ch)) {
    this.value = value.slice(0, cursor) + ch + value.slice(cursor)
    cursor += 1
  }

  // Update the screen if value has changed
  if (value !== this.value) {
    this.screen.render()
  }
}

module.exports = {
  listen () {
    module.exports.update(modeManager.mode.name)
    input.readInput()
    input.screen.render()
  },

  update (mode) {
    input.width = '100%-' + (mode.length + 2)
    input.left = mode.length + 3
  },
  input
}
