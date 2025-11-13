#!/bin/bash

# Backend Setup Script
echo "Setting up IQR Backend..."

# Check if .env already exists
if [ -f .env ]; then
    echo ".env file already exists. Skipping creation."
else
    echo "Creating .env file from env.example..."
    cp env.example .env
    echo ".env file created successfully!"
fi

# Install dependencies
echo "Installing dependencies..."
npm install

echo ""
echo "✅ Backend setup complete!"
echo ""
echo "Next steps:"
echo "1. Review .env file and update if needed"
echo "2. Run 'npm start' to start the server"
echo "3. For development with auto-reload, run 'npm run dev'"
echo ""

