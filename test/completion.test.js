const assert = require('assert')
const mineflayer = require('mineflayer')
const squid = require('flying-squid')
const dashboard = require('../index')
const { once } = require('events')

let bot
const server = squid.createMCServer({
  port: 8666,
  version: '1.12',
  gameMode: 1,
  'view-distance': 2,
  'online-mode': false,
  logging: false,
  plugins: {},
  generation: {
    name: 'diamond_square',
    options: { worldHeight: 80 }
  },
  'player-list-text': {
    header: { text: 'Flying squid' },
    footer: { text: 'Test server' }
  }
})

const serverStarted = once(server, 'listening')

beforeEach(async () => {
  await serverStarted

  const bot2 = mineflayer.createBot({
    port: 8666,
    username: 'a_dummy'
  })

  await once(bot2, 'spawn')

  bot = mineflayer.createBot({
    port: 8666,
    username: `completion-${Math.random().toString(36).slice(2, 7)}`
  })

  await once(bot, 'spawn')
  bot.loadPlugin(dashboard)
})

afterEach(() => {
  bot.end()
})

describe('completion', () => {
  describe('_minecraftCompleter', () => {
    it('nicknames', async () => {
      const matches = await bot.dashboard._minecraftCompleter('com')
      // assert.deepStrictEqual(matches, [bot.username])
      // TODO: Update when flying-squid#457 is fixed
      assert.deepStrictEqual(matches, ['a_dummy', bot.username])
    })

    it('commands', async () => {
      const matches = await bot.dashboard._minecraftCompleter('/hel')
      // assert.deepStrictEqual(matches, ['/help'])
      // TODO: Update when flying-squid#457 is fixed
      assert.deepStrictEqual(matches, ['/ping', '/modpe', '/version', '/bug', '/help', '/effect', '/kill'])
    })
  })

  describe('REPL mode', () => {
    it('bo|t', async () => {
      const repl = bot.dashboard.commands.repl()

      const matches = await repl._complete('bo')
      assert.deepStrictEqual(matches, ['bot'])
    })
    it('req|uire', async () => {
      const repl = bot.dashboard.commands.repl()

      const matches = await repl._complete('req')
      assert.deepStrictEqual(matches, ['require'])
    })
  })
})
