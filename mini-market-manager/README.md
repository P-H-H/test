# Mini Market Management System

A comprehensive web-based application for managing multiple mini-market stores with real-time inventory, sales, and reporting capabilities.

## Features

### 🔐 Authentication & Role-Based Access
- JWT-based authentication
- Two roles: Owner and Employee
- Secure role-based permissions

### 👑 Owner Capabilities
- Access all stores
- Add/edit/delete stores
- View comprehensive reports across all stores
- Manage all users and employees
- Monitor store performance

### 👨‍💼 Employee Capabilities
- Access assigned store only
- Manage inventory (add/edit products)
- Process sales through POS system
- View store-specific reports

### 🏪 Store Management
- Multi-store support
- Employee assignment to specific stores
- Store performance monitoring

### 📦 Inventory Management
- Product tracking (name, barcode, price, quantity, supplier, expiry)
- Stock alerts (low stock, expiry warnings)
- Real-time inventory updates

### 💰 Sales Management (POS System)
- Barcode scanning support
- Shopping cart functionality
- Discount application
- Receipt generation
- Transaction history

### 📊 Dashboard & Reports
- Real-time analytics
- Sales summaries (daily, weekly, monthly)
- Profit margin calculations
- Top-performing stores analysis

## Tech Stack

- **MongoDB** - Database for storing all application data
- **Express.js** - Backend API server
- **React.js** - Frontend user interface
- **Node.js** - Backend runtime environment

## Installation

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## Environment Variables

Create `.env` files in both backend and frontend directories with the required configuration variables.

## License

This project is licensed under the MIT License.