const blessed = require('blessed')

const screen = blessed.screen({
  terminal: 'xterm-256color',
  dockBorders: true
})

const logBox = blessed.box({
  parent: screen,
  width: '33%',
  left: '66%+3',
  height: '100%-2',
  border: 'line',
  scrollable: true,
  scrollbar: { bg: 'blue' },
  mouse: true,
  tags: true
})

const textBox = blessed.box({
  parent: screen,
  width: '100%',
  height: 3,
  top: '100%-3',
  border: 'line'
})

module.exports = {
  screen,
  logBox,
  textBox
}
