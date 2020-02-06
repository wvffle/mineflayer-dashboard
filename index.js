// const unicode = require('blessed/src/unicode')
const vm = require('vm')
const log = require('./src/log')
const Mode = require('./lib/mode')
const errorHandler = require('./src/error-handler')
const inputListen = require('./src/input-manager')
const modeManager = require('./src/mode-manager')
const { commands, bind } = require('./src/commands')
const { inspect } = require('util')

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

    // Chat handler
    bot.on('message', message => {
      if (!bot.dashboard._chatPattern.test(message.toString())) return
      chat.println(` ${message.toAnsi()}{|}{gray-fg}${new Date().toLocaleString()}{/} `)
    })

    // Create REPL context
    const context = { bot }
    vm.createContext(context)

    // Register REPL mode
    // eslint-disable-next-line
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

    bind(bot)

    const chatPattern = options.chatPattern ||
      (bot.chatPatterns && bot.chatPatterns.find(p => p.type === 'chat').pattern) ||
      /^<\w+> /

    bot.dashboard = {
      log,
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

            resolve((matches || []).map(k => k.slice(string.length - string.lastIndexOf(' ') - 1)))
          }, false, false)
        })
      }
    }

    inputListen()
  }
}
