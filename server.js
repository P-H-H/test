const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/multistoremanager', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log('MongoDB connection error:', err));

// Routes
app.use('/api/health', require('./routes/health'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/stores', require('./routes/stores'));
app.use('/api/products', require('./routes/products'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/sales', require('./routes/sales'));
app.use('/api/users', require('./routes/users'));

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Socket.io for real-time updates
const io = require('socket.io')(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.handshake.auth);
  
  const userId = socket.handshake.auth.userId;
  const userRole = socket.handshake.auth.role;
  
  // Join user-specific room
  socket.on('join-user-room', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined their room`);
  });
  
  // Join store room
  socket.on('join-store', (storeId) => {
    socket.join(`store-${storeId}`);
    console.log(`User joined store room: ${storeId}`);
  });
  
  // Handle inventory updates
  socket.on('inventory-update', (data) => {
    // Broadcast to all users in the store
    socket.to(`store-${data.storeId}`).emit('inventory-updated', data);
    
    // Check for low stock alerts
    if (data.newQuantity <= data.reorderLevel && data.newQuantity > 0) {
      io.to(`store-${data.storeId}`).emit('inventory-low-stock', {
        storeId: data.storeId,
        productId: data.productId,
        productName: data.productName,
        storeName: data.storeName,
        currentStock: data.newQuantity,
        reorderLevel: data.reorderLevel
      });
    } else if (data.newQuantity === 0) {
      io.to(`store-${data.storeId}`).emit('inventory-out-of-stock', {
        storeId: data.storeId,
        productId: data.productId,
        productName: data.productName,
        storeName: data.storeName
      });
    }
  });
  
  // Handle sale completion
  socket.on('sale-completed', (data) => {
    // Broadcast to all users in the store
    io.to(`store-${data.storeId}`).emit('new-sale', data);
    
    // Notify owner
    if (userRole !== 'owner') {
      socket.to(`user-${data.ownerId}`).emit('new-sale', data);
    }
  });
  
  // Handle employee assignments
  socket.on('employee-assigned', (data) => {
    socket.to(`user-${data.employeeId}`).emit('employee-assigned', data);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Make io available globally for route handlers
global.io = io;

module.exports = { app, io };