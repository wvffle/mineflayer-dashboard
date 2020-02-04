// const unicode = require('blessed/src/unicode')
const vm = require('vm')
const log = require('./src/log')
const mode = require('./lib/mode')
const errorHandler = require('./src/error-handler')
const inputListen = require('./src/input-manager')
const modeManager = require('./src/mode-manager')
const { inspect } = require('util')

module.exports = function (options) {

  // Check if user passed 'bot' as an options
  if (options._client) {
    return module.exports()(options)
  }

  return function (bot) {
    const Mode = mode(bot)

    // Enable error handling
    const logError = errorHandler(bot)

    // Register CHAT mode
    const chat = new Mode('chat', {
      bg: 'green',
      async complete (string) {
        return new Promise((resolve, reject) => {
          bot.tabComplete(string, (err, matches) => {
            if (err) {
              return reject(err)
            }

            resolve((matches || []).map(k => k.slice(string.length - string.lastIndexOf(' ') - 1)))
          }, false, false)
        })
      },

      interpreter (string) {
        bot.chat(string)
      }
    })

    // Chat handler
    bot.on('message', message => {
      // TODO: Add option to change that
      if (!/ » /.test(message.toString())) return
      chat.println(` ${message.toAnsi()}{|}{gray-fg}${new Date().toLocaleString()}{/} `)
    })

    // Create REPL context
    const context = { bot }
    vm.createContext(context)

    // Register REPL mode
    const repl = new Mode('repl', {
      bg: 'red',
      complete (string) {
        let root = context
        let leftSide = ''
        let key = ''

        for (const c of string) {
          leftSide += c

          if (c === '.' || c === '[') {
            if (!key in root) break
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
          matches.push(k.slice(key.length))
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

    modeManager.mode = chat

    bot.once('end', () => {
      bot.dashboard._ended = true
    })

    bot.dashboard = {
      log,
      Mode,
      _ended: false
    }

    inputListen()
  }
}

