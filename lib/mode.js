const modeManager = require('../src/mode-manager')
const { screen } = require('../src/ui')
const blessed = require('blessed')
const History = require('./history')
const split = require('split-string')

const splitOptions = {
  separator: ' ',
  quotes: ["'", '"'],
  keep (value, state) {
    return value !== '\\' && (!["'", '"'].includes(value) || state.prev() === '\\')
  }
}

module.exports = function (bot) {
  class Mode {
    #name = 'undefined'
    #decoratedName = 'undefined'
    #complete = function (string) {
      return []
    }

    #interpreter = function (string) {}

    #completion = {
      cached: null,
      matches: [],
      index: -1
    }

    #window = blessed.box({
      parent: screen,
      width: '66%+4',
      height: '100%-2',
      border: 'line',
      scrollable: true,
      tags: true
    })

    #history = new History()

    constructor (name, customOptions) {
      const options = {
        fg: 'gray',
        bg: 'green',
        completer: this.#complete,
        interpreter: this.#interpreter,
        bypassDefaultCompletion: false,
        ...customOptions
      }

      this.#decoratedName = `{${options.fg}-fg}{${options.bg}-bg}{bold} ${name.toUpperCase()} {/}`
      this.#completion.bypass = options.bypassDefaultCompletion
      this.#complete = (options.completer || this.#complete).bind(this)
      this.#interpreter = (options.interpreter || this.#interpreter).bind(this)
      this.#name = name

      modeManager.add(this)
      this.window.hide()
    }

    println (...args) {
      for (let arg of args) {
        this.#window.pushLine(arg)
        this.#window.scrollTo(this.#window.getScrollHeight())
        screen.render()
      }
    }

    async interprete (string) {
      let spaceIndex = string.indexOf(' ')
      if (spaceIndex === -1) spaceIndex = string.length
      const key = string.slice(1, spaceIndex)

      if (string[0] === ':' && key in bot.dashboard.commands) {
        const args = split(key.slice(spaceIndex + 1), splitOptions)
        return bot.dashboard.commands[key](...args)
      }

      return this.#interpreter(string)
    }

    async complete (string, direction = 1) {
      if (this.#completion.bypass === true) {
        return this.#complete(string, direction)
      }

      if (string !== this.#completion.cached) {
        const matches = await this.#complete(string)

        // No matches found
        if (!matches) return ''

        this.#completion.matches = matches // TODO: Maybe reverse?
        this.#completion.cached = string
        this.#completion.index = -1

        return this.complete(string)
      }

      this.#completion.index += direction
      let match = this.#completion.matches[this.#completion.index] || null
      if (match === null) {
        match = ''
        this.#completion.index = -1
      }

      return match
    }

    resetCompletion () {
      if (this.#completion.cached === null) return false

      this.#completion.matches = []
      this.#completion.cached = null
      this.#completion.index = -1

      return true
    }

    // TODO: Scroll #window
    scroll (direction = 1) {

    }

    get name () {
      return this.#name
    }

    get window () {
      return this.#window
    }

    get decoratedName () {
      return this.#decoratedName
    }

    get history () {
      return this.#history
    }
  }

  return Mode
}


