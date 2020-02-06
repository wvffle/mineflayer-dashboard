/**
 * History module
 * @module
 */

const RingBuffer = require('ringbufferjs')
/**
 * Maximum history size. Defaults to `10`
 * @type {number}
 */
const MAX_HISTORY = 10

/**
 * Mode interpreter history class
 */
class History {
  #buffer = new RingBuffer(MAX_HISTORY)
  #elements = []
  #index = -1
  #last = ''

  /**
   * Push string to the history
   * @param {String} string - string to store in history
   * @returns {Number} - size of history
   */
  push (string) {
    if (!this.#buffer.isEmpty()) {
      if (this.#last === string) {
        return (this.#index = this.#buffer.size())
      }
    }

    this.#buffer.enq(string)
    this.#last = string

    const size = this.#buffer.size()

    this.#elements = this.#buffer.peekN(size)
    this.#index = size

    return size
  }

  /**
   * Reset history position to the start
   * @returns {History}
   */
  start () {
    this.#index = this.#buffer.size()
    return this
  }

  /**
   * Get current history element
   * @returns {String|undefined}
   */
  get () {
    return this.#elements[this.#index]
  }

  /**
   * Go down the history
   * @param {Number} [n=1] - How many steps to go down
   * @returns {String}
   */
  next (n = 1) {
    const size = this.#buffer.size()
    this.#index += n

    if (this.#index >= size) {
      this.#index = size
      return ''
    }

    return this.get()
  }

  /**
   * Go u[ the history
   * @param {Number} [n=1] - How many steps to go up
   * @returns {String}
   */
  prev (n = 1) {
    this.#index -= n

    if (this.#index <= 0) {
      this.#index = 0
    }

    return this.get()
  }
}

module.exports = History
