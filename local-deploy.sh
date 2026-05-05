#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

# Force local helper to use Ollama unless explicitly overridden.
export LLM_PROVIDER="${LLM_PROVIDER:-ollama}"
export OLLAMA_MODEL="${OLLAMA_MODEL:-phi4-mini}"

API_PID_FILE="/tmp/ai-sql-parser-api.pid"
OLLAMA_PID_FILE="/tmp/ai-sql-parser-ollama.pid"
API_LOG="/tmp/ai-sql-parser-api.log"
OLLAMA_LOG="/tmp/ai-sql-parser-ollama.log"

function is_running() {
  local pid="$1"
  if [[ -z "$pid" ]]; then
    return 1
  fi
  if kill -0 "$pid" >/dev/null 2>&1; then
    return 0
  fi
  return 1
}

function read_pid() {
  local file="$1"
  if [[ -f "$file" ]]; then
    cat "$file"
  fi
}

function start_ollama() {
  if ! command -v ollama >/dev/null 2>&1; then
    echo "❌ ollama command not found. Install Ollama from https://ollama.ai and try again."
    exit 1
  fi

  local pid
  pid=$(read_pid "$OLLAMA_PID_FILE" || true)
  if is_running "$pid"; then
    echo "✅ Ollama is already running (PID: $pid)."
    return
  fi

  echo "🚀 Starting Ollama..."
  nohup ollama serve > "$OLLAMA_LOG" 2>&1 &
  echo $! > "$OLLAMA_PID_FILE"
  echo "✅ Ollama started with PID $(cat "$OLLAMA_PID_FILE"). Logs: $OLLAMA_LOG"
}

function start_api() {
  if [[ ! -f "$ROOT/dist/app.js" ]]; then
    echo "🔧 Building the app before starting..."
    npm run build
  fi

  local pid
  pid=$(read_pid "$API_PID_FILE" || true)
  if is_running "$pid"; then
    echo "✅ API server is already running (PID: $pid)."
    return
  fi

  echo "🚀 Starting API server..."
  nohup npm start > "$API_LOG" 2>&1 &
  echo $! > "$API_PID_FILE"

  # Wait a moment and verify the process is still running
  sleep 2
  local new_pid
  new_pid=$(read_pid "$API_PID_FILE")
  if ! is_running "$new_pid"; then
    echo "❌ API server failed to start. Check logs: $API_LOG"
    rm -f "$API_PID_FILE"
    return 1
  fi

  echo "✅ API server started with PID $(cat "$API_PID_FILE"). Logs: $API_LOG"
}

function stop_service() {
  local pid_file="$1"
  if [[ ! -f "$pid_file" ]]; then
    return
  fi

  local pid
  pid=$(cat "$pid_file")
  if is_running "$pid"; then
    echo "🛑 Stopping PID $pid..."
    kill "$pid" >/dev/null 2>&1 || true
    sleep 1
    if is_running "$pid"; then
      echo "⚠️  PID $pid did not exit, sending SIGKILL..."
      kill -9 "$pid" >/dev/null 2>&1 || true
    fi
  fi

  rm -f "$pid_file"
}

function status() {
  local ollama_pid api_pid
  ollama_pid=$(read_pid "$OLLAMA_PID_FILE" || true)
  api_pid=$(read_pid "$API_PID_FILE" || true)

  if is_running "$ollama_pid"; then
    echo "✅ Ollama is running (PID: $ollama_pid)."
  else
    echo "❌ Ollama is stopped."
  fi

  if is_running "$api_pid"; then
    echo "✅ API server is running (PID: $api_pid)."
  elif [[ -f "$API_PID_FILE" ]]; then
    echo "❌ API server is stopped (crashed)."
    if [[ -f "$API_LOG" ]]; then
      local last_error
      last_error=$(tail -n 5 "$API_LOG" | grep -i "error\|exception\|failed" | tail -n 1 || true)
      if [[ -n "$last_error" ]]; then
        echo "   Last error: $last_error"
      fi
    fi
    # Clean up stale PID file
    rm -f "$API_PID_FILE"
  else
    echo "❌ API server is stopped (never started)."
  fi
}

case "${1:-}" in
  start)
    start_ollama
    start_api
    ;;
  stop)
    stop_service "$API_PID_FILE"
    stop_service "$OLLAMA_PID_FILE"
    echo "✅ Local deployment stopped."
    ;;
  status)
    status
    ;;
  *)
    cat <<EOF
Usage: $0 {start|stop|status}

Commands:
  start   Start Ollama and the API server in the background
  stop    Stop the API server and Ollama if they were started by this script
  status  Show whether the local services are running
EOF
    exit 1
    ;;
esac
