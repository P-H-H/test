#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Multi-Store Manager - Starting Application...\n');

// Check if MongoDB is running
const checkMongoDB = () => {
  return new Promise((resolve) => {
    exec('mongosh --eval "db.runCommand({ ping: 1 })" --quiet', (error) => {
      if (error) {
        console.log('❌ MongoDB is not running or not installed');
        console.log('📝 Please start MongoDB:');
        console.log('   - macOS: brew services start mongodb-community');
        console.log('   - Ubuntu: sudo systemctl start mongod');
        console.log('   - Windows: net start MongoDB');
        console.log('   - Or use MongoDB Atlas cloud database\n');
        resolve(false);
      } else {
        console.log('✅ MongoDB is running');
        resolve(true);
      }
    });
  });
};

// Check if .env file exists
const checkEnvFile = () => {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    console.log('✅ Environment file found');
    return true;
  } else {
    console.log('❌ .env file not found');
    console.log('📝 Please create a .env file with the following content:');
    console.log(`
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/multistoremanager
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
JWT_EXPIRE=30d
`);
    return false;
  }
};

// Check if dependencies are installed
const checkDependencies = () => {
  const nodeModulesPath = path.join(__dirname, 'node_modules');
  const clientNodeModulesPath = path.join(__dirname, 'client', 'node_modules');
  
  const backendDeps = fs.existsSync(nodeModulesPath);
  const frontendDeps = fs.existsSync(clientNodeModulesPath);
  
  if (backendDeps) {
    console.log('✅ Backend dependencies installed');
  } else {
    console.log('❌ Backend dependencies not installed');
    console.log('📝 Run: npm install');
  }
  
  if (frontendDeps) {
    console.log('✅ Frontend dependencies installed');
  } else {
    console.log('❌ Frontend dependencies not installed');
    console.log('📝 Run: cd client && npm install --legacy-peer-deps');
  }
  
  return backendDeps && frontendDeps;
};

// Install dependencies
const installDependencies = () => {
  return new Promise((resolve) => {
    console.log('📦 Installing dependencies...');
    
    // Install backend dependencies
    const backendInstall = spawn('npm', ['install'], { stdio: 'inherit' });
    
    backendInstall.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Backend dependencies installed');
        
        // Install frontend dependencies
        const frontendInstall = spawn('npm', ['install', '--legacy-peer-deps'], { 
          cwd: path.join(__dirname, 'client'),
          stdio: 'inherit' 
        });
        
        frontendInstall.on('close', (frontendCode) => {
          if (frontendCode === 0) {
            console.log('✅ Frontend dependencies installed');
            resolve(true);
          } else {
            console.log('❌ Failed to install frontend dependencies');
            resolve(false);
          }
        });
      } else {
        console.log('❌ Failed to install backend dependencies');
        resolve(false);
      }
    });
  });
};

// Setup database
const setupDatabase = () => {
  return new Promise((resolve) => {
    console.log('🗄️  Setting up database...');
    
    const setup = spawn('node', ['setup.js'], { stdio: 'inherit' });
    
    setup.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Database setup completed');
        resolve(true);
      } else {
        console.log('❌ Database setup failed');
        resolve(false);
      }
    });
  });
};

// Start the application
const startApplication = () => {
  console.log('🚀 Starting the application...\n');
  console.log('📱 Frontend will be available at: http://localhost:3000');
  console.log('🔧 Backend API will be available at: http://localhost:5000');
  console.log('📋 Demo accounts:');
  console.log('   Owner: owner@demo.com / password123');
  console.log('   Employee: employee@demo.com / password123\n');
  console.log('Press Ctrl+C to stop the application\n');
  
  const app = spawn('npm', ['run', 'dev'], { stdio: 'inherit' });
  
  app.on('close', (code) => {
    console.log(`\n👋 Application stopped with code ${code}`);
  });
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down gracefully...');
    app.kill('SIGINT');
    process.exit(0);
  });
};

// Main startup function
const main = async () => {
  try {
    console.log('🔍 Checking system requirements...\n');
    
    // Check environment file
    const envExists = checkEnvFile();
    if (!envExists) {
      process.exit(1);
    }
    
    // Check MongoDB
    const mongoRunning = await checkMongoDB();
    if (!mongoRunning) {
      console.log('⚠️  MongoDB is required. Please start MongoDB and try again.');
      process.exit(1);
    }
    
    // Check dependencies
    const depsInstalled = checkDependencies();
    if (!depsInstalled) {
      console.log('\n📦 Installing missing dependencies...');
      const installSuccess = await installDependencies();
      if (!installSuccess) {
        console.log('❌ Failed to install dependencies');
        process.exit(1);
      }
    }
    
    console.log('\n🔍 Checking database setup...');
    
    // Check if database has data
    const mongoose = require('mongoose');
    require('dotenv').config();
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/multistoremanager');
    
    const User = require('./models/User');
    const userCount = await User.countDocuments();
    
    if (userCount === 0) {
      console.log('🗄️  Database is empty. Setting up sample data...');
      await mongoose.connection.close();
      
      const setupSuccess = await setupDatabase();
      if (!setupSuccess) {
        console.log('❌ Database setup failed');
        process.exit(1);
      }
    } else {
      console.log('✅ Database already has data');
      await mongoose.connection.close();
    }
    
    console.log('\n✅ All checks passed! Starting application...\n');
    
    // Start the application
    startApplication();
    
  } catch (error) {
    console.error('❌ Startup failed:', error.message);
    process.exit(1);
  }
};

// Run the startup script
main();