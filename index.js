// const unicode = require('blessed/src/unicode')
const vm = require('vm')
const log = require('./src/log')
const Mode = require('./lib/mode')
const errorHandler = require('./src/error-handler')
const { listen: inputListen } = require('./src/input-manager')
const modeManager = require('./src/mode-manager')
const { commands, bind } = require('./src/commands')
const { inspect } = require('util')

/**
 * mineflayer-dashboard
 * @module mineflayer-dashboard
 * @param {Object|bot} options - Options object or mineflayer bot
 * @param {RegExp} [options.chatPattern=/^<\w+> /] - Chat pattern
 * @returns {Function}
 */
module.exports = function (options = {}) {
  // Check if user passed 'bot' as an options
  if (options._client) {
    return module.exports()(options)
  }

  return function (bot) {
    // Enable error handling
    const logError = errorHandler(bot)

    // Register CHAT mode
    const chat = new Mode('chat', {
      bg: 'green',
      async completer (string) {
        return bot.dashboard._minecraftCompleter(string)
      },

      interpreter (string) {
        bot.chat(string)
      }
    })

    modeManager.add(chat)

    // Chat handler
    bot.on('message', message => {
      if (!bot.dashboard._chatPattern.test(message.toString())) return
      chat.println(` ${message.toAnsi()}{|}{gray-fg}${new Date().toLocaleString()}{/} `)
    })

    modeManager.mode = chat

    // Create REPL context
    const context = {}
    const addToContext = (obj) => {
      for (const [key, value] of Object.entries(obj)) {
        Object.defineProperty(context, key, {
          configurable: false,
          enumerable: true,
          value
        })
      }
    }

    addToContext({ bot })
    addToContext({ require, eval, parseInt, parseFloat, isNaN, isFinite })
    addToContext({ encodeURI, encodeURIComponent, decodeURI, decodeURIComponent })
    addToContext({ Object, Array, Buffer, Number, Function, Boolean, BigInt, Date, String, RegExp })
    addToContext({ Error, EvalError, RangeError, ReferenceError, SyntaxError, TypeError, URIError })
    addToContext({ Int8Array, Uint8Array, Uint8ClampedArray, Int16Array, Uint16Array, Int32Array, Uint32Array })
    addToContext({ Float32Array, Float64Array, BigInt64Array, BigUint64Array })
    addToContext({ Map, Set, WeakMap, WeakSet })
    addToContext({ ArrayBuffer, SharedArrayBuffer, Atomics, DataView, JSON })
    addToContext({ Promise })
    addToContext({ Reflect, Proxy })
    addToContext({ Math })
    addToContext({ NaN, Infinity, Symbol })
    addToContext({ setImmediate, clearImmediate })
    addToContext({ setTimeout, clearTimeout })
    addToContext({ setInterval, clearInterval })

    vm.createContext(context)

    // Register REPL mode
    const repl = new Mode('repl', {
      bg: 'red',
      completer (string) {
        let root = context
        let leftSide = ''
        let key = ''

        for (const c of string) {
          leftSide += c

          if (c === '.' || c === '[') {
            if (!(key in root)) break
            root = root[key]
            key = ''
          } else if (c !== ']') {
            key += c
          }
        }

        if (string !== leftSide) {
          return []
        }

        const matches = []
        for (const k in root) {
          if (!k.startsWith(key)) continue
          matches.push(leftSide + k.slice(key.length))
        }

        return matches
      },

      interpreter (string) {
        try {
          const res = vm.runInContext(string, context)
          if (res === undefined) return

          this.println(inspect(res, { colors: true }))
        } catch (err) {
          logError(err)
        }
      }
    })

    modeManager.add(repl)

    bot.once('end', () => {
      bot.dashboard._ended = true
    })

    bind(bot)

    const chatPattern = options.chatPattern ||
      (bot.chatPatterns && bot.chatPatterns.find(p => p.type === 'chat').pattern) ||
      /^<\w+> /

    bot.dashboard = {
      log,
      addMode (mode) {
        modeManager.add(mode)
      },
      Mode,
      commands,
      _chatPattern: chatPattern,
      _ended: false,
      _minecraftCompleter (string) {
        return new Promise((resolve, reject) => {
          bot.tabComplete(string, (err, matches) => {
            if (err) {
              return reject(err)
            }

            if (matches == null || matches.length === 0) {
              return resolve([])
            }

            if (bot.supportFeature('tabCompleteHasAToolTip')) {
              return resolve(matches.map(obj => obj.match))
            }

            resolve(matches)
          }, false, false)
        })
      }
    }

    inputListen()
  }
}
