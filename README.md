# POS System - Point of Sale Application

A comprehensive, full-featured Point of Sale (POS) system built with React, Node.js, Express, and MongoDB. This system enables retail businesses to manage sales, inventory, customers, and analytics with multi-user support and role-based access control.

## Features

### Core Functionality
- **Multi-User Authentication**: Role-based access control (Admin, Manager, Cashier)
- **Point of Sale Interface**: Fast product search, cart management, and checkout
- **Inventory Management**: Product CRUD operations, stock tracking, low stock alerts
- **Customer Management**: Customer profiles, purchase history, loyalty points system
- **Sales Management**: Transaction processing, hold/complete/void transactions
- **Reports & Analytics**: Sales summaries, revenue charts, top products, inventory valuation

### Tech Stack

**Frontend**
- React 19 with Vite
- React Router v7 for navigation
- Tailwind CSS v4 for styling
- Axios for API calls
- Recharts for data visualization
- React Context API for state management

**Backend**
- Node.js with Express
- MongoDB with Mongoose ODM
- JWT authentication
- bcryptjs for password hashing
- RESTful API design

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn

### Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd testtoken
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```
   This will install dependencies for both the root, server, and client.

3. **Configure environment variables**
   
   The server `.env` file is already configured with defaults:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/pos-system
   JWT_SECRET=your-secret-key-change-in-production
   JWT_EXPIRE=30d
   NODE_ENV=development
   ```
   
   The client `.env` file is configured to connect to the backend:
   ```
   VITE_API_URL=http://localhost:5000
   ```

4. **Start MongoDB**
   ```bash
   # If MongoDB is not running, start it:
   sudo systemctl start mongod
   # Or on macOS with Homebrew:
   brew services start mongodb-community
   ```

5. **Seed the database with sample data**
   ```bash
   cd server && npm run seed
   ```
   
   This creates:
   - 3 users (admin, manager, cashier)
   - 4 product categories
   - 12 sample products
   - 2 suppliers
   - 5 sample customers

### Running the Application

**Development Mode (both frontend and backend)**
```bash
npm run dev
```

This starts:
- Backend API on http://localhost:5000
- Frontend dev server on http://localhost:5173

**Run servers separately**
```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run client
```

## Default Login Credentials

After seeding the database, use these credentials to log in:

- **Admin**: admin@pos.com / admin123
- **Manager**: manager@pos.com / manager123
- **Cashier**: cashier@pos.com / cashier123

## User Roles & Permissions

### Admin
- Full access to all features
- User management (create, edit, delete users)
- Access to reports and analytics
- Can void transactions
- Full inventory management

### Manager
- Access to reports and analytics
- Full inventory management
- Can void transactions
- Cannot manage users

### Cashier
- Access to POS system
- View products and customers
- Create sales transactions
- Cannot edit/delete products or customers
- No access to reports or user management

## Project Structure

```
testtoken/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # React Context providers
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service layer
│   │   └── utils/         # Utility functions
│   └── package.json
├── server/                # Express backend
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── utils/            # Utility functions
│   └── server.js         # Entry point
└── package.json          # Root package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user (admin only)
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - List products (with search, filters, pagination)
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (admin/manager)
- `PUT /api/products/:id` - Update product (admin/manager)
- `DELETE /api/products/:id` - Soft delete product (admin/manager)
- `PUT /api/products/:id/stock` - Adjust stock level (admin/manager)
- `GET /api/products/low-stock` - Get low stock items

### Categories
- `GET /api/categories` - List all categories
- `POST /api/categories` - Create category (admin/manager)
- `PUT /api/categories/:id` - Update category (admin/manager)
- `DELETE /api/categories/:id` - Delete category (admin/manager)

### Sales
- `POST /api/sales` - Create new sale
- `GET /api/sales` - List sales (with filters)
- `GET /api/sales/:id` - Get sale details
- `PUT /api/sales/:id/hold` - Hold transaction
- `PUT /api/sales/:id/complete` - Complete held transaction
- `PUT /api/sales/:id/void` - Void transaction (admin/manager)

### Customers
- `GET /api/customers` - List customers
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer (admin/manager)
- `DELETE /api/customers/:id` - Delete customer (admin/manager)
- `GET /api/customers/:id/purchases` - Get purchase history
- `PUT /api/customers/:id/points` - Update loyalty points (admin/manager)

### Reports
- `GET /api/reports/sales-summary` - Sales summary with aggregations
- `GET /api/reports/revenue` - Revenue over time
- `GET /api/reports/top-products` - Best-selling products
- `GET /api/reports/inventory-value` - Inventory valuation
- `GET /api/reports/cashier-performance` - Per-user sales stats

### Users
- `GET /api/users` - List users (admin/manager)
- `PUT /api/users/:id` - Update user (admin)
- `DELETE /api/users/:id` - Delete user (admin)

## Development

### Adding New Features

1. **Backend**: Add models, controllers, and routes in the server directory
2. **Frontend**: Add services, components, and pages in the client directory
3. **Test**: Use the seeded data to test new features

### Testing

Test the application by:
1. Logging in with different user roles
2. Creating sales transactions
3. Managing inventory
4. Viewing reports (admin/manager only)

## Deployment

### Production Build

```bash
# Build the frontend
cd client && npm run build

# Start the backend in production mode
cd ../server && npm start
```

For production deployment:
- Use environment-specific `.env` files
- Deploy backend to services like Heroku, Railway, or DigitalOcean
- Deploy frontend to Vercel, Netlify, or serve from Express
- Use MongoDB Atlas for the database
- Enable CORS for your production domain
- Implement rate limiting and security headers
- Use HTTPS for all connections

## Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# View MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log
```

### Port Already in Use
```bash
# Kill process on port 5000 (backend)
sudo lsof -ti:5000 | xargs kill -9

# Kill process on port 5173 (frontend)
sudo lsof -ti:5173 | xargs kill -9
```

### Clear and Reseed Database
```bash
cd server && npm run seed
```

## License

MIT

## Support

For issues or questions, please check the project documentation or contact the development team.
