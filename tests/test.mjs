import mineflayer from 'mineflayer'
import dashboard from '../index.js'
import cp from 'child_process'

const bot = mineflayer.createBot({
  port: 7666,
  username: 'dashboard'
})

// Load dashboard plugin
bot.loadPlugin(dashboard)

bot.once('spawn', () => {
  // Switch to the REPL mode
  bot.dashboard.commands.repl()

  // Overwrite exit command to kill tmux session
  bot.dashboard.commands.exit = () => {
    cp.exec(`tmux kill-session -t ${process.argv[2]}`)
  }
})
