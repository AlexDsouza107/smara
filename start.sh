#!/bin/bash

# SmritiCare Launch Script
# Smart India Hackathon 2024

echo "🧠 Starting SmritiCare - Dementia Care Platform"
echo "=============================================="
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

echo "🚀 Starting development server..."
echo ""
echo "The application will open at: http://localhost:5173/"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev
