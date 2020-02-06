const RingBuffer = require('ringbufferjs')
const MAX_HISTORY = 10

class History {
  #buffer = new RingBuffer(MAX_HISTORY)
  #elements = []
  #index = -1
  #last = ''

  push (element) {
    if (!this.#buffer.isEmpty()) {
      if (this.#last === element) {
        return (this.#index = this.#buffer.size())
      }
    }

    this.#buffer.enq(element)
    this.#last = element

    const size = this.#buffer.size()

    this.#elements = this.#buffer.peekN(size)
    this.#index = size

    return size
  }

  start () {
    this.#index = this.#buffer.size()
    return this
  }

  get () {
    return this.#elements[this.#index]
  }

  // Go down
  next (n = 1) {
    const size = this.#buffer.size()
    this.#index += n

    if (this.#index >= size) {
      this.#index = size
      return ''
    }

    return this.get()
  }

  // Go up
  prev (n = 1) {
    this.#index -= n

    if (this.#index <= 0) {
      this.#index = 0
    }

    return this.get()
  }
}

module.exports = History
