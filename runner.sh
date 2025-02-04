#!/bin/bash

# Get absolute path of the project directory
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Open a new macOS Terminal tab and start the frontend
osascript -e "tell application \"Terminal\" to do script \"cd '$PROJECT_DIR/client' && npm run dev\""

# Open another new macOS Terminal tab and start the backend
osascript -e "tell application \"Terminal\" to do script \"cd '$PROJECT_DIR/server' && conda activate testingenv && uvicorn main:app --reload\""

# Give servers a second to start, then open the app in the browser
sleep 2
open http://localhost:3000