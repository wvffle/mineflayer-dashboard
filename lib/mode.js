/**
 * Mode window module
 * @module
 */

const modeManager = require('../src/mode-manager')
const { commands } = require('../src/commands')
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

/**
 * Create a mode window
 */
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
    scrollbar: { bg: 'blue' },
    mouse: true,
    tags: true
  })

  #history = new History()

  /**
   * @param name - mode name
   * @param [options={}] - mode options
   * @param {String} [options.fg='white'] - blessed color of the text
   * @param {String} [options.bg='green'] - blessed color of the background
   * @param {String} [options.completer=function(string) {}] - custom completer that returns an array of completions
   * @param {String} [options.interpreter=function(string) {}] - custom interpreter that interprets user input
   * @param {String} [options.bypassDefaultCompletion=false] - Do not use caching when in completer
   */
  constructor (name, options = {}) {
    const opts = {
      fg: 'white',
      bg: 'green',
      completer: this.#complete,
      interpreter: this.#interpreter,
      bypassDefaultCompletion: false,
      ...options
    }

    this.#decoratedName = `{${opts.fg}-fg}{${opts.bg}-bg}{bold} ${name.toUpperCase()} {/}`
    this.#completion.bypass = opts.bypassDefaultCompletion
    this.#complete = (opts.completer || this.#complete).bind(this)
    this.#interpreter = (opts.interpreter || this.#interpreter).bind(this)
    this.#name = name

    // NOTE: Expose #complete only when run by mocha
    if (Object.keys(require.cache).some(path => path.endsWith('mocha/bin/mocha'))) {
      this._complete = this.#complete
    }

    this.window.hide()
  }

  /**
   * Print line in mode window
   * @param {...String} lines
   */
  println (...lines) {
    for (const line of lines) {
      this.#window.pushLine(line)
      this.#window.scrollTo(this.#window.getScrollHeight())
      screen.render()
    }
  }

  /**
   * Interpret user input
   * @async
   * @param {String} string - user input
   * @returns {Promise<*>}
   */
  async interpret (string) {
    let spaceIndex = string.indexOf(' ')
    if (spaceIndex === -1) spaceIndex = string.length
    const key = string.slice(1, spaceIndex)

    if (string[0] === ':' && key in commands) {
      const args = split(key.slice(spaceIndex + 1), splitOptions)
      return commands[key](...args)
    }

    return this.#interpreter(string)
  }

  /**
   * Complete user input
   * @async
   * @param {String} string
   * @param {Number} direction - 1 or -1
   * @returns {Promise<String>}
   */
  async complete (string, direction = 1) {
    if (this.#completion.bypass === true) {
      return this.#complete(string, direction)
    }

    if (string !== this.#completion.cached) {
      const matches = await this.#complete(string)

      // No matches found
      if (!matches) return ''

      this.#completion.matches = matches
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

  /**
   * Reset completion
   * @returns {boolean} true if reset, false if there is no cached completion
   */
  resetCompletion () {
    if (this.#completion.cached === null) return false

    this.#completion.matches = []
    this.#completion.cached = null
    this.#completion.index = -1

    return true
  }

  // TODO: Scroll #window
  /**
   * Scroll the window
   * @param direction - 1 or -1
   */
  scroll (direction = 1) {

  }

  /**
   * Get mode name
   * @returns {string}
   */
  get name () {
    return this.#name
  }

  /**
   * Get blessed {@link https://github.com/chjj/blessed#box-from-element|box}
   * @returns {Box}
   */
  get window () {
    return this.#window
  }

  /**
   * Get decorated name
   * @returns {String}
   */
  get decoratedName () {
    return this.#decoratedName
  }

  /**
   * Get interpreter history
   * @returns {History}
   */
  get history () {
    return this.#history
  }
}

module.exports = Mode
