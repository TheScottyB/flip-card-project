#!/bin/bash

# Simple script to start the Agent SDK interactive documentation

# Check for Node.js
if ! command -v node &> /dev/null
then
    echo "Node.js is required but not installed. Please install Node.js and try again."
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start the development server
echo "Starting Agent SDK documentation server..."
echo "Once started, open http://localhost:3000 in your browser"
npm start