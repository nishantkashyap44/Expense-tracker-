# 💰 Expense Tracker Pro

A professional, production-ready expense tracking application with advanced security features, modern UI, and comprehensive financial management capabilities.

## 🌟 Features

### Core Functionality
- ✅ **User Authentication** - Secure JWT-based authentication with bcrypt password hashing
- 📊 **Dashboard** - Dynamic, real-time financial overview with interactive charts
- 💳 **Transaction Management** - Track income and expenses with detailed categorization
- 🎯 **Budget Planning** - Set and monitor budgets with visual progress indicators
- 📈 **Reports & Analytics** - Comprehensive financial reports with Chart.js visualizations
- 💾 **Wallet Management** - Track your current balance and transaction history

### Security Features
- 🔒 **JWT Authentication** - Token-based secure authentication
- 🛡️ **Helmet.js** - Security headers configuration
- 🚦 **Rate Limiting** - Protection against brute force attacks
- ✅ **Input Validation** - Express-validator for all API endpoints
- 🔐 **CORS Protection** - Configurable Cross-Origin Resource Sharing
- 🚫 **SQL Injection Prevention** - Parameterized queries with MySQL2

### UI/UX Features
- 🎨 **Modern Glass Morphism Design** - Beautiful glassmorphism cards
- 🌓 **Dark/Light Theme** - Persistent theme switching
- 📱 **Fully Responsive** - Mobile-first design approach
- 🔔 **Toast Notifications** - Beautiful success/error/warning notifications
- ⚡ **Loading States** - Skeleton loaders and loading indicators
- 📊 **Dynamic Charts** - Interactive Chart.js visualizations
- 🎯 **Empty States** - Helpful empty state UI

## 🚀 Quick Start

### Prerequisites
- Node.js >= 16.0.0
- npm >= 8.0.0
- MySQL >= 5.7

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd expense-tracker-pro
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Server
NODE_ENV=development
PORT=5000

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=expense_tracker

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=24h

# Client
CLIENT_URL=http://localhost:3000
```

4. **Create database and tables**
```bash
mysql -u root -p < database/schema.sql
```

5. **Start the server**
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

6. **Access the application**
```
http://localhost:5000
```

## 📁 Project Structure

```
expense-tracker-pro/
├── src/
│   ├── config/
│   │   └── database.js          # Database connection pool
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── dashboardController.js
│   │   └── ...
│   ├── middleware/
│   │   ├── auth.js              # JWT verification
│   │   ├── errorHandler.js      # Centralized error handling
│   │   ├── validation.js        # Input validation rules
│   │   ├── rateLimiter.js       # Rate limiting config
│   │   └── notFound.js          # 404 handler
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── dashboardRoutes.js
│   │   └── ...
│   ├── utils/
│   │   └── asyncHandler.js      # Async error wrapper
│   └── server.js                # Application entry point
├── public/
│   ├── css/
│   │   ├── dashboard.css        # Main dashboard styles
│   │   └── auth.css             # Login/register styles
│   ├── js/
│   │   ├── api.js               # API service layer
│   │   ├── utils.js             # Utility functions
│   │   ├── dashboard.js         # Dashboard logic
│   │   └── login.js             # Login logic
│   ├── dashboard.html
│   └── login.html
├── database/
│   └── schema.sql               # Database schema
├── .env.example                 # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## 🔒 Security Best Practices

### 1. **Authentication**
- JWT tokens with expiration
- Bcrypt password hashing (12 rounds)
- Token verification on every protected route
- Automatic logout on token expiration

### 2. **Input Validation**
- All inputs validated using express-validator
- Type checking and sanitization
- Custom validation rules
- Detailed error messages

### 3. **Rate Limiting**
- General API: 100 requests per 15 minutes
- Auth endpoints: 5 requests per 15 minutes
- IP-based limiting with trust proxy support

### 4. **Security Headers**
- Helmet.js for secure HTTP headers
- Content Security Policy (CSP)
- XSS protection
- HSTS enabled

### 5. **Database Security**
- Connection pooling for performance
- Parameterized queries (no SQL injection)
- Transaction support for data integrity
- Proper indexing for performance

## 📊 API Endpoints

### Authentication
```
POST   /api/auth/register        # Register new user
POST   /api/auth/login           # Login user
GET    /api/auth/me              # Get current user
POST   /api/auth/verify          # Verify token
```

### Dashboard
```
GET    /api/dashboard/summary              # Get dashboard summary
GET    /api/dashboard/recent-transactions  # Get recent transactions
GET    /api/dashboard/monthly-trend        # Get 6-month trend
GET    /api/dashboard/budget-comparison    # Get budget vs actual
```

### Transactions
```
GET    /api/transactions         # Get all transactions
POST   /api/transactions         # Create transaction
PUT    /api/transactions/:id     # Update transaction
DELETE /api/transactions/:id     # Delete transaction
```

### Budget
```
GET    /api/budget              # Get budgets
POST   /api/budget              # Create budget
PUT    /api/budget/:id          # Update budget
DELETE /api/budget/:id          # Delete budget
```

### Expenses
```
GET    /api/expenses            # Get expenses
POST   /api/expenses            # Create expense
PUT    /api/expenses/:id        # Update expense
DELETE /api/expenses/:id        # Delete expense
```

## 🎨 UI Components

### Dashboard Components
1. **Stats Cards** - Glass morphism cards showing key metrics
2. **Trend Chart** - Line chart showing income vs expenses over time
3. **Category Chart** - Doughnut chart showing expense breakdown
4. **Recent Transactions** - List of latest transactions
5. **Budget Status** - Progress bars showing budget utilization

### Features
- **Toast Notifications** - Success, error, warning, info
- **Loading States** - Skeleton loaders for all data
- **Empty States** - Helpful messages when no data exists
- **Responsive Design** - Works on all screen sizes
- **Dark Theme** - Toggle between light and dark modes

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment mode | development |
| PORT | Server port | 5000 |
| DB_HOST | Database host | localhost |
| DB_USER | Database user | root |
| DB_PASSWORD | Database password | - |
| DB_NAME | Database name | expense_tracker |
| JWT_SECRET | JWT signing secret | - |
| JWT_EXPIRE | Token expiration | 24h |
| CLIENT_URL | Frontend URL for CORS | * |

### Rate Limiting Configuration

Edit `src/middleware/rateLimiter.js`:
```javascript
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100                    // 100 requests
});
```

### CORS Configuration

Edit `src/server.js`:
```javascript
const corsOptions = {
  origin: process.env.CLIENT_URL || '*',
  credentials: true
};
```

## 📈 Performance Optimization

1. **Database Connection Pooling** - Reuses connections for better performance
2. **Response Compression** - Gzip compression for all responses
3. **Parallel Queries** - Multiple queries executed simultaneously
4. **Efficient Queries** - Optimized SQL with proper indexing
5. **Caching** - localStorage for user data and theme preferences

## 🐛 Error Handling

### Centralized Error Handler
All errors are caught and processed through a centralized error handler that:
- Differentiates between operational and programming errors
- Provides detailed error messages in development
- Returns safe error messages in production
- Logs errors for debugging

### Example Error Response
```json
{
  "status": "error",
  "message": "Invalid credentials"
}
```

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run with coverage
npm run test:coverage
```

## 📝 Development Guidelines

### Code Style
- Use ES6+ features
- Follow MVC pattern
- Use async/await for asynchronous code
- Add JSDoc comments for functions
- Use meaningful variable names

### Git Workflow
1. Create feature branch: `git checkout -b feature/new-feature`
2. Commit changes: `git commit -am 'Add new feature'`
3. Push to branch: `git push origin feature/new-feature`
4. Create Pull Request

## 🚢 Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET`
- [ ] Configure `CLIENT_URL` properly
- [ ] Set up SSL/TLS
- [ ] Enable database backups
- [ ] Set up monitoring
- [ ] Configure logging
- [ ] Set up reverse proxy (nginx)
- [ ] Enable firewall
- [ ] Use process manager (PM2)

### PM2 Deployment
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start src/server.js --name expense-tracker

# Save PM2 configuration
pm2 save

# Set up startup script
pm2 startup
```

## 📜 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, email your-email@example.com or create an issue in the repository.

## 🎉 Acknowledgments

- Chart.js for beautiful charts
- Font Awesome for icons
- Inter font family
- All open-source contributors

---

Made with ❤️ for better financial management
