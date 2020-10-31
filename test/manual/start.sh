#!/bin/bash

SESSION=mineflayer-dashboard-test

tmux attach -t $SESSION 2> /dev/null || {
  tmux new -dt $SESSION
  tmux split-pane -ht $SESSION "node test/manual/server.mjs; tmux kill-session -t $SESSION"

  tmux select-pane -l
  tmux respawn-pane -k "sleep 1; node test/manual/test.mjs $SESSION" \; set remain-on-exit on

  tmux attach -t $SESSION || exit 1
}
