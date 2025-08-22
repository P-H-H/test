const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Store = require('./models/Store');
const Product = require('./models/Product');
const Inventory = require('./models/Inventory');

const setupDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/multistoremanager');
    console.log('✅ Connected to MongoDB');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Store.deleteMany({});
    await Product.deleteMany({});
    await Inventory.deleteMany({});

    // Create owner account
    console.log('👤 Creating owner account...');
    const ownerPassword = await bcrypt.hash('password123', 10);
    const owner = await User.create({
      name: 'Store Owner',
      email: 'owner@demo.com',
      password: ownerPassword,
      phone: '+1234567890',
      role: 'owner'
    });
    console.log('✅ Owner account created: owner@demo.com / password123');

    // Create sample stores
    console.log('🏪 Creating sample stores...');
    const store1 = await Store.create({
      name: 'Downtown Mini Market',
      address: {
        street: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001'
      },
      phone: '+1234567891',
      email: 'downtown@minimarket.com',
      owner: owner._id,
      openingHours: {
        monday: { open: '08:00', close: '22:00' },
        tuesday: { open: '08:00', close: '22:00' },
        wednesday: { open: '08:00', close: '22:00' },
        thursday: { open: '08:00', close: '22:00' },
        friday: { open: '08:00', close: '23:00' },
        saturday: { open: '08:00', close: '23:00' },
        sunday: { open: '09:00', close: '21:00' }
      }
    });

    const store2 = await Store.create({
      name: 'Uptown Express',
      address: {
        street: '456 Oak Avenue',
        city: 'New York',
        state: 'NY',
        zipCode: '10002'
      },
      phone: '+1234567892',
      email: 'uptown@minimarket.com',
      owner: owner._id,
      openingHours: {
        monday: { open: '07:00', close: '21:00' },
        tuesday: { open: '07:00', close: '21:00' },
        wednesday: { open: '07:00', close: '21:00' },
        thursday: { open: '07:00', close: '21:00' },
        friday: { open: '07:00', close: '22:00' },
        saturday: { open: '07:00', close: '22:00' },
        sunday: { open: '08:00', close: '20:00' }
      }
    });
    console.log('✅ Sample stores created');

    // Create sample employee
    console.log('👥 Creating sample employee...');
    const employeePassword = await bcrypt.hash('password123', 10);
    const employee = await User.create({
      name: 'John Employee',
      email: 'employee@demo.com',
      password: employeePassword,
      phone: '+1234567893',
      role: 'employee',
      assignedStores: [store1._id, store2._id],
      createdBy: owner._id
    });

    // Update stores with employee
    await Store.findByIdAndUpdate(store1._id, {
      $push: { employees: employee._id },
      manager: employee._id
    });
    await Store.findByIdAndUpdate(store2._id, {
      $push: { employees: employee._id }
    });
    console.log('✅ Sample employee created: employee@demo.com / password123');

    // Create sample products
    console.log('📦 Creating sample products...');
    const sampleProducts = [
      {
        name: 'Coca Cola 500ml',
        description: 'Refreshing cola drink',
        barcode: '1234567890123',
        category: 'Food & Beverages',
        brand: 'Coca Cola',
        unit: 'bottle',
        costPrice: 0.80,
        sellingPrice: 1.50,
        minStockLevel: 50,
        supplier: {
          name: 'Beverage Distributors Inc',
          contact: '+1234567894',
          email: 'orders@beveragedist.com'
        },
        createdBy: owner._id
      },
      {
        name: 'White Bread Loaf',
        description: 'Fresh white bread',
        barcode: '1234567890124',
        category: 'Food & Beverages',
        brand: 'Wonder Bread',
        unit: 'piece',
        costPrice: 1.20,
        sellingPrice: 2.50,
        minStockLevel: 20,
        supplier: {
          name: 'Local Bakery Supply',
          contact: '+1234567895',
          email: 'orders@bakerysupply.com'
        },
        createdBy: owner._id
      },
      {
        name: 'Milk 1L',
        description: 'Fresh whole milk',
        barcode: '1234567890125',
        category: 'Dairy Products',
        brand: 'Farm Fresh',
        unit: 'liter',
        costPrice: 2.00,
        sellingPrice: 3.50,
        minStockLevel: 30,
        supplier: {
          name: 'Dairy Farms Co',
          contact: '+1234567896',
          email: 'orders@dairyfarms.com'
        },
        createdBy: owner._id
      },
      {
        name: 'Potato Chips',
        description: 'Crispy salted potato chips',
        barcode: '1234567890126',
        category: 'Snacks & Confectionery',
        brand: 'Lays',
        unit: 'pack',
        costPrice: 1.00,
        sellingPrice: 2.00,
        minStockLevel: 40,
        supplier: {
          name: 'Snack Distributors',
          contact: '+1234567897',
          email: 'orders@snackdist.com'
        },
        createdBy: owner._id
      },
      {
        name: 'Shampoo 250ml',
        description: 'Hair care shampoo',
        barcode: '1234567890127',
        category: 'Personal Care',
        brand: 'Head & Shoulders',
        unit: 'bottle',
        costPrice: 3.50,
        sellingPrice: 6.99,
        minStockLevel: 15,
        supplier: {
          name: 'Personal Care Supplies',
          contact: '+1234567898',
          email: 'orders@personalcare.com'
        },
        createdBy: owner._id
      }
    ];

    const products = await Product.create(sampleProducts);
    console.log('✅ Sample products created');

    // Create sample inventory for stores
    console.log('📊 Creating sample inventory...');
    const inventoryItems = [];

    for (const product of products) {
      // Add inventory for store1
      inventoryItems.push({
        store: store1._id,
        product: product._id,
        quantity: Math.floor(Math.random() * 100) + 50, // Random quantity between 50-150
        reorderLevel: product.minStockLevel,
        lastUpdatedBy: owner._id
      });

      // Add inventory for store2
      inventoryItems.push({
        store: store2._id,
        product: product._id,
        quantity: Math.floor(Math.random() * 80) + 30, // Random quantity between 30-110
        reorderLevel: product.minStockLevel,
        lastUpdatedBy: owner._id
      });
    }

    await Inventory.create(inventoryItems);
    console.log('✅ Sample inventory created');

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📋 Demo Accounts:');
    console.log('Owner: owner@demo.com / password123');
    console.log('Employee: employee@demo.com / password123');
    console.log('\n🏪 Sample Stores:');
    console.log('- Downtown Mini Market');
    console.log('- Uptown Express');
    console.log('\n📦 Sample Products:');
    console.log('- 5 products with inventory across both stores');
    console.log('\n🚀 You can now start the application!');

  } catch (error) {
    console.error('❌ Setup failed:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run setup
setupDatabase();