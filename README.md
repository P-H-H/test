# 🏪 Myanmar Supermarket Management System

A comprehensive multi-supermarket stores management system designed specifically for Myanmar market conditions, built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

## 🌟 Features

- **Multi-Store Management**: Manage multiple supermarket locations from a single dashboard
- **Inventory Control**: Real-time stock tracking with low stock alerts
- **POS System**: Integrated point of sale with Myanmar Kyat support
- **Staff Management**: Role-based access control and performance tracking
- **Customer Management**: Loyalty programs and purchase history
- **Reporting & Analytics**: Comprehensive business insights and reports
- **Myanmar Localization**: Local currency, language support, and cultural considerations

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd myanmar-supermarket-management
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB connection string and JWT secret
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

   This will start both backend (port 5000) and frontend (port 3000)

## 📁 Project Structure

```
myanmar-supermarket-management/
├── server/                 # Backend Express.js server
│   ├── config/            # Database and app configuration
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Custom middleware
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   └── index.js           # Server entry point
├── client/                # React frontend application
│   ├── public/            # Static assets
│   ├── src/               # Source code
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   ├── hooks/             # Custom React hooks
│   ├── context/           # React context providers
│   ├── utils/             # Utility functions
│   └── App.js             # Main App component
├── package.json            # Root package.json
└── README.md              # This file
```

## 🔧 Available Scripts

- `npm start` - Start production server
- `npm run server` - Start backend server with nodemon
- `npm run client` - Start React development server
- `npm run dev` - Start both backend and frontend simultaneously
- `npm run build` - Build React app for production
- `npm run install-all` - Install both backend and frontend dependencies

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Stores
- `GET /api/stores` - Get all stores
- `POST /api/stores` - Create new store
- `PUT /api/stores/:id` - Update store
- `DELETE /api/stores/:id` - Delete store

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Inventory
- `GET /api/inventory` - Get inventory status
- `PUT /api/inventory/:id` - Update inventory
- `POST /api/inventory/transfer` - Transfer between stores

### Sales
- `GET /api/sales` - Get sales data
- `POST /api/sales` - Create new sale
- `GET /api/sales/reports` - Get sales reports

## 🎨 UI/UX Design

The system features a modern, clean interface designed with Myanmar cultural considerations:

- **Color Scheme**: Deep blue, gold, and green representing trust, prosperity, and growth
- **Responsive Design**: Mobile-first approach for all devices
- **Localization**: Myanmar language support and Kyat currency
- **Accessibility**: High contrast mode and keyboard navigation

## 🔒 Security Features

- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- Rate limiting and security headers
- Audit logging for all operations

## 📊 Database Schema

The system uses MongoDB with the following main collections:
- Users (authentication and permissions)
- Stores (store information and settings)
- Products (product catalog and pricing)
- Inventory (stock levels and tracking)
- Sales (transaction history)
- Staff (employee management)
- Customers (customer database)

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Variables
Create a `.env` file with:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
NODE_ENV=production
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please contact the development team or create an issue in the repository.

---

**Built with ❤️ for Myanmar's growing supermarket industry**