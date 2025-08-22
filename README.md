# Multi-Store Manager

A comprehensive MERN stack application for managing multiple mini-market stores from home. This application provides separate interfaces for owners and employees with role-based access control.

## Features

### Owner Features
- **Dashboard Overview**: View statistics across all stores
- **Store Management**: Create, update, and manage multiple store locations
- **Employee Management**: Add, edit, and manage employee accounts
- **Product Catalog**: Manage global product catalog
- **Inventory Oversight**: Monitor inventory levels across all stores
- **Sales Analytics**: View sales reports and analytics for all stores
- **Role-based Access**: Full administrative control

### Employee Features
- **Personal Dashboard**: View assigned stores and quick actions
- **Point of Sale (POS)**: Process sales transactions
- **Inventory Management**: Update stock levels for assigned stores
- **Sales Reporting**: View sales data for assigned stores
- **Store-specific Access**: Access only to assigned stores

### Technical Features
- **JWT Authentication**: Secure login system
- **Role-based Authorization**: Owner and employee roles
- **Real-time Updates**: Socket.io integration
- **Responsive Design**: Mobile-friendly interface
- **RESTful API**: Well-structured backend API
- **Data Validation**: Comprehensive input validation
- **Error Handling**: Robust error handling and user feedback

## Technology Stack

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **MongoDB**: Database
- **Mongoose**: ODM for MongoDB
- **JWT**: Authentication tokens
- **bcryptjs**: Password hashing
- **Socket.io**: Real-time communication
- **Express Validator**: Input validation

### Frontend
- **React**: UI library
- **React Router**: Client-side routing
- **React Query**: Data fetching and caching
- **Axios**: HTTP client
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **React Hot Toast**: Notifications

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Backend Setup

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/multistoremanager
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
JWT_EXPIRE=30d
```

3. Start the backend server:
```bash
npm run server
```

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install frontend dependencies:
```bash
npm install --legacy-peer-deps
```

3. Start the React development server:
```bash
npm start
```

### Full Development Setup

To run both backend and frontend concurrently:
```bash
npm run dev
```

## Quick Start

### 1. Install Dependencies
```bash
npm install
cd client && npm install --legacy-peer-deps && cd ..
```

### 2. Environment Setup
Create a `.env` file in the root directory:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/multistoremanager
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
JWT_EXPIRE=30d
```

### 3. Initialize Database
```bash
npm run setup
```

### 4. Start Application
```bash
npm run dev
```

Visit http://localhost:3000 to access the application.

### Demo Accounts

The setup script creates these demo accounts:

**Owner Account:**
- Email: owner@demo.com
- Password: password123

**Employee Account:**
- Email: employee@demo.com
- Password: password123

### Sample Data Included

- 2 sample stores (Downtown Mini Market, Uptown Express)
- 5 sample products with inventory
- 1 employee assigned to both stores

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/password` - Change password

### Stores
- `GET /api/stores` - Get all stores
- `POST /api/stores` - Create new store (Owner only)
- `GET /api/stores/:id` - Get single store
- `PUT /api/stores/:id` - Update store (Owner only)
- `DELETE /api/stores/:id` - Delete store (Owner only)

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create new product
- `GET /api/products/:id` - Get single product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Inventory
- `GET /api/inventory/:storeId` - Get store inventory
- `POST /api/inventory` - Add product to inventory
- `PUT /api/inventory/:id` - Update inventory item
- `PUT /api/inventory/:id/adjust` - Adjust inventory levels

### Sales
- `GET /api/sales/:storeId` - Get store sales
- `POST /api/sales` - Create new sale
- `PUT /api/sales/:id/void` - Void a sale
- `GET /api/sales/analytics/:storeId` - Get sales analytics

### Users (Owner only)
- `GET /api/users/employees` - Get all employees
- `POST /api/users/employees` - Create new employee
- `PUT /api/users/employees/:id` - Update employee
- `DELETE /api/users/employees/:id` - Delete employee

## Database Schema

### User Model
- name, email, password, role, phone
- assignedStores (for employees)
- isActive status

### Store Model
- name, address, phone, email
- manager, employees
- openingHours, owner

### Product Model
- name, description, barcode, category
- unit, costPrice, sellingPrice
- minStockLevel, supplier info

### Inventory Model
- store, product, quantity
- reorderLevel, location
- lastRestocked, lastUpdatedBy

### Sale Model
- store, items, subtotal, tax, discount
- totalAmount, paymentMethod
- cashier, receiptNumber

## Security Features

- **Password Hashing**: bcryptjs for secure password storage
- **JWT Tokens**: Secure authentication tokens
- **Role-based Access**: Middleware for role-based route protection
- **Input Validation**: Express validator for API input validation
- **CORS Configuration**: Proper CORS setup for cross-origin requests

## Development

### Project Structure
```
/
├── models/          # MongoDB models
├── routes/          # API routes
├── middleware/      # Custom middleware
├── client/          # React frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── contexts/     # React contexts
│   │   └── ...
├── server.js        # Express server
└── package.json
```

### Available Scripts

Backend:
- `npm start` - Start production server
- `npm run server` - Start development server with nodemon
- `npm run dev` - Start both backend and frontend

Frontend (in client directory):
- `npm start` - Start React development server
- `npm run build` - Build for production
- `npm test` - Run tests

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the repository or contact the development team.

## Future Enhancements

- Mobile app development
- Advanced analytics and reporting
- Multi-currency support
- Integration with payment gateways
- Barcode scanning functionality
- Advanced inventory forecasting
- Multi-language support
- Advanced user permissions