import squid from 'flying-squid'
import mineflayer from 'mineflayer'

const server = squid.createMCServer({
  port: 7666,
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

server.on('listening', () => {
  const bot = mineflayer.createBot({
    port: 7666,
    username: 'test'
  })

  let i = 0
  setInterval(() => {
    bot.chat(`message #${++i}`)
  }, 1000)
})
