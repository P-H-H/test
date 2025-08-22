# Multi-Store Manager - Deployment Guide

This guide will help you deploy the Multi-Store Manager application to various platforms.

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### 1. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install --legacy-peer-deps
cd ..
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

### 3. Database Setup

Run the setup script to initialize the database with sample data:

```bash
npm run setup
```

This will create:
- Owner account: `owner@demo.com` / `password123`
- Employee account: `employee@demo.com` / `password123`
- 2 sample stores with products and inventory

### 4. Start Development Server

```bash
# Start both backend and frontend
npm run dev

# Or start them separately:
npm run server  # Backend only
npm run client  # Frontend only (in another terminal)
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🌐 Production Deployment

### Option 1: Heroku Deployment

1. **Create a Heroku app:**
```bash
heroku create your-app-name
```

2. **Set environment variables:**
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_production_jwt_secret_here
heroku config:set MONGODB_URI=your_mongodb_atlas_connection_string
```

3. **Deploy:**
```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

4. **Run setup (optional):**
```bash
heroku run npm run setup
```

### Option 2: DigitalOcean App Platform

1. **Create a new app** in DigitalOcean App Platform
2. **Connect your GitHub repository**
3. **Configure build settings:**
   - Build Command: `npm install && npm run build`
   - Run Command: `npm start`
4. **Set environment variables** in the app settings
5. **Deploy**

### Option 3: AWS Elastic Beanstalk

1. **Install EB CLI:**
```bash
pip install awsebcli
```

2. **Initialize and deploy:**
```bash
eb init
eb create production
eb deploy
```

### Option 4: Docker Deployment

1. **Create Dockerfile:**
```dockerfile
FROM node:16-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm install
RUN cd client && npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build frontend
RUN cd client && npm run build

EXPOSE 5000

CMD ["npm", "start"]
```

2. **Create docker-compose.yml:**
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/multistoremanager
      - JWT_SECRET=your_jwt_secret_here
    depends_on:
      - mongo
  
  mongo:
    image: mongo:4.4
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

3. **Deploy:**
```bash
docker-compose up -d
```

## 🗄️ Database Configuration

### MongoDB Atlas (Recommended for Production)

1. **Create a MongoDB Atlas account** at https://cloud.mongodb.com
2. **Create a new cluster**
3. **Create a database user**
4. **Whitelist your IP address** (or use 0.0.0.0/0 for all IPs)
5. **Get your connection string** and update `MONGODB_URI`

Example connection string:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/multistoremanager?retryWrites=true&w=majority
```

### Local MongoDB

1. **Install MongoDB** from https://www.mongodb.com/try/download/community
2. **Start MongoDB service:**
```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Ubuntu
sudo systemctl start mongod

# On Windows
net start MongoDB
```

## 🔒 Security Configuration

### Production Environment Variables

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_very_secure_jwt_secret_at_least_32_characters_long
JWT_EXPIRE=7d
```

### Security Best Practices

1. **Use strong JWT secrets** (at least 32 characters)
2. **Enable HTTPS** in production
3. **Set up CORS** properly for your domain
4. **Use MongoDB Atlas** with authentication
5. **Implement rate limiting** (optional)
6. **Keep dependencies updated**

## 📊 Monitoring & Maintenance

### Health Checks

The application includes basic health check endpoints:
- `GET /api/health` - Basic health check
- `GET /api/auth/me` - Authentication check

### Logging

Add logging middleware for production:
```bash
npm install morgan winston
```

### Backup Strategy

1. **Database backups** (MongoDB Atlas provides automatic backups)
2. **Code repository** (GitHub/GitLab)
3. **Environment variables** (secure storage)

## 🔧 Troubleshooting

### Common Issues

1. **MongoDB Connection Error:**
   - Check `MONGODB_URI` environment variable
   - Ensure MongoDB service is running
   - Check firewall settings

2. **JWT Authentication Issues:**
   - Verify `JWT_SECRET` is set
   - Check token expiration settings
   - Clear browser localStorage

3. **Build Errors:**
   - Run `npm install --legacy-peer-deps` in client folder
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall

4. **Port Conflicts:**
   - Change `PORT` environment variable
   - Check if ports 3000/5000 are available

### Debug Mode

Enable debug logging:
```bash
DEBUG=* npm run dev
```

## 📱 Mobile Considerations

The application is responsive and works on mobile devices. For native mobile apps:

1. **React Native** - Port the React components
2. **Progressive Web App** - Add service worker and manifest
3. **Cordova/PhoneGap** - Wrap the web app

## 🚀 Performance Optimization

### Frontend Optimization
- Implement lazy loading for routes
- Optimize images and assets
- Use React.memo for expensive components
- Implement virtual scrolling for large lists

### Backend Optimization
- Add Redis for caching
- Implement database indexing
- Use connection pooling
- Add rate limiting

### Database Optimization
- Create proper indexes
- Implement aggregation pipelines
- Use MongoDB Atlas performance advisor
- Regular maintenance and monitoring

## 📈 Scaling

### Horizontal Scaling
- Load balancer (nginx, AWS ALB)
- Multiple application instances
- Database sharding
- CDN for static assets

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Implement caching strategies
- Monitor performance metrics

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
          
      - name: Install dependencies
        run: |
          npm install
          cd client && npm install --legacy-peer-deps
          
      - name: Run tests
        run: npm test
        
      - name: Build application
        run: npm run build
        
      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{secrets.HEROKU_API_KEY}}
          heroku_app_name: "your-app-name"
          heroku_email: "your-email@example.com"
```

## 📞 Support

For deployment issues:
1. Check the troubleshooting section
2. Review application logs
3. Check environment variables
4. Verify database connectivity
5. Open an issue in the repository

## 🔗 Useful Links

- [MongoDB Atlas](https://cloud.mongodb.com)
- [Heroku Documentation](https://devcenter.heroku.com)
- [DigitalOcean App Platform](https://docs.digitalocean.com/products/app-platform)
- [AWS Elastic Beanstalk](https://docs.aws.amazon.com/elasticbeanstalk)
- [Docker Documentation](https://docs.docker.com)

---

**Happy Deploying! 🚀**