const assert = require('assert')
const mineflayer = require('mineflayer')
const squid = require('flying-squid')
const { once } = require('events')

let bot
let bot2
let server

before(async () => {
  server = squid.createMCServer({
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

  await once(server, 'listening')
})

beforeEach(async () => {
  bot2 = mineflayer.createBot({
    port: 8666,
    username: 'a_dummy'
  })

  await once(bot2, 'spawn')

  bot = mineflayer.createBot({
    port: 8666,
    username: `completion-${Math.random().toString(36).slice(2, 7)}`
  })

  await once(bot, 'spawn')

  bot.loadPlugin(require('../index'))
})

afterEach(async () => {
  const { screen } = require('../src/ui')
  screen.destroy()

  bot.end()
  await once(bot, 'end')

  bot2.end()
  await once(bot2, 'end')
  require.cache = {}
})

describe('completion', () => {
  describe('_minecraftCompleter', () => {
    // TODO: Fails due to flying-squid#457
    it('nicknames', async () => {
      const matches = await bot.dashboard._minecraftCompleter('com')
      assert.deepStrictEqual(matches, [bot.username])
    })

    // TODO: Fails due to flying-squid#457
    it('commands', async () => {
      const matches = await bot.dashboard._minecraftCompleter('/hel')
      assert.deepStrictEqual(matches, ['/help'])
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

    it('bot.play|ers', async () => {
      const repl = bot.dashboard.commands.repl()

      const matches = await repl._complete('bot.play')
      assert.deepStrictEqual(matches, ['bot.players', 'bot.player'])
    })

    it('bot.players.a_|dummy', async () => {
      const repl = bot.dashboard.commands.repl()

      const matches = await repl._complete('bot.players.a_')
      assert.deepStrictEqual(matches, ['bot.players.a_dummy'])
    })
  })
})

after(async () => {
  server._server.close()
  await once(server._server, 'close')
})
