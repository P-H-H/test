#!/bin/bash

echo "🚀 Setting up Myanmar Supermarket Management System"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm version: $(npm -v)"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created. Please update it with your configuration."
else
    echo "✅ .env file already exists."
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Backend dependencies installed successfully."
else
    echo "❌ Failed to install backend dependencies."
    exit 1
fi

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd client
npm install

if [ $? -eq 0 ]; then
    echo "✅ Frontend dependencies installed successfully."
else
    echo "❌ Failed to install frontend dependencies."
    exit 1
fi

cd ..

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p server/uploads
mkdir -p server/logs

# Set permissions
chmod +x server/uploads
chmod +x server/logs

echo "✅ Directories created successfully."

# Check if MongoDB is running
echo "🔍 Checking MongoDB connection..."
if command -v mongosh &> /dev/null; then
    if mongosh --eval "db.runCommand('ping')" > /dev/null 2>&1; then
        echo "✅ MongoDB is running and accessible."
    else
        echo "⚠️  MongoDB is installed but not accessible. Please start MongoDB service."
    fi
else
    echo "⚠️  MongoDB is not installed. Please install MongoDB or use MongoDB Atlas."
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Update .env file with your MongoDB connection string and JWT secret"
echo "2. Start the development server: npm run dev"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "Available commands:"
echo "  npm run dev          - Start both backend and frontend"
echo "  npm run server       - Start backend only"
echo "  npm run client       - Start frontend only"
echo "  npm start            - Start production server"
echo ""
echo "Happy coding! 🚀"