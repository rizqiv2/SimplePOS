# POS System - Point of Sale Application

A full-featured Point of Sale (POS) system built with React, Node.js, Express, and SQLite. Supports multi-user role-based access, inventory management, customer loyalty, thermal receipt printing, audit logging, and customizable currency/locale settings.

## Features

### Core Functionality
- **Multi-User Authentication**: Role-based access control (Admin, Manager, Cashier) with JWT
- **Point of Sale Interface**: Fast product search (name/SKU/barcode), cart management, discounts, payment (cash/card)
- **Inventory Management**: Product CRUD, stock tracking, low-stock alerts, SKU/barcode support
- **Customer Management**: Profiles, purchase history, loyalty points system
- **Sales Management**: Transaction processing, void transactions, receipt printing
- **Reports & Analytics**: Sales summaries, revenue charts, top products, inventory valuation
- **Audit Logging**: Track all CREATE, UPDATE, DELETE, VOID, LOGIN, and STOCK_ADJUST actions
- **Settings**: Configurable currency (15 currencies + custom) and locale (12 locales) with live preview
- **Thermal Receipt Printing**: 80mm thermal printer support via `window.print()` with `@page { size: 80mm auto }`
- **Mobile Responsive**: Hamburger navigation, stacked POS layout, bottom-sheet modals on phone/tablet

### Tech Stack

**Frontend**
- React 19 with Vite
- React Router v7 for navigation
- Tailwind CSS v3 for styling
- Recharts for data visualization
- React Context API for state management

**Backend**
- Node.js with Express
- SQLite via Sequelize ORM
- JWT authentication
- bcryptjs for password hashing
- RESTful API design

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Navigate to the project directory**
   ```bash
   cd testtoken
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```
   This installs dependencies for root, server, and client.

3. **Start the application (development mode)**
   ```bash
   npm run dev
   ```
   This starts both servers concurrently:
   - Backend API on http://localhost:5000
   - Frontend dev server on http://localhost:5173

   **Or run them separately:**
   ```bash
   # Terminal 1 - Backend
   npm run server

   # Terminal 2 - Frontend
   npm run client
   ```

4. **Re-seed the database** (if needed)
   ```bash
   rm server/database.sqlite && npm run server
   ```
   The database auto-seeds on startup with sample data.

### How It Works

- The server (`server/server-dev.js`) starts and auto-creates an SQLite database file (`server/database.sqlite`) if one doesn't exist
- Tables are synchronized via Sequelize models
- Sample data is seeded automatically: users, categories, suppliers, products, customers, and settings
- The client Vite dev server proxies `/api` requests to the backend at `localhost:5000`

## Default Login Credentials

After seeding, use these credentials:

| Role    | Email              | Password |
|---------|--------------------|----------|
| Admin   | admin@pos.com      | admin123 |
| Manager | manager@pos.com    | manager123 |
| Cashier | cashier@pos.com    | cashier123 |

## User Roles & Permissions

### Admin
- Full access to all features
- User management (create, edit, delete)
- Audit log viewer
- Settings (currency, locale)
- Reports and analytics
- Void transactions

### Manager
- Reports and analytics
- Full inventory management
- Void transactions
- Cannot manage users or view audit logs

### Cashier
- POS system only
- View products and customers
- Create sales transactions
- No edit/delete on products/customers
- No reports, users, audit logs, or settings

## Project Structure

```
testtoken/
├── client/                   # React frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components (Layout, Receipt, ProtectedRoute)
│   │   ├── context/          # React Context providers (AuthContext, CartContext)
│   │   ├── pages/            # Page components (Login, Dashboard, POS, Inventory, Customers, Reports, Users, Settings, AuditLogs)
│   │   ├── services/         # API service layer (api, authService, productService, customerService, salesService, reportService, settingService, auditLogService)
│   │   └── utils/            # Utility functions (formatters with dynamic currency/locale)
│   ├── vite.config.js        # Vite config with API proxy
│   └── package.json
├── server/                   # Express backend
│   ├── controllers/          # Route controllers
│   ├── middleware/           # Auth middleware, error handler
│   ├── models/               # Sequelize models (User, Product, Category, Supplier, Customer, Sale, Setting, AuditLog)
│   ├── routes/               # API routes
│   ├── utils/                # Utilities (generateToken, auditLogger)
│   ├── database.sqlite       # SQLite database file (auto-created)
│   ├── server-dev.js         # Dev server entry (auto-seeds)
│   ├── server.js             # Production entry
│   └── package.json
├── package.json              # Root package.json with dev/install scripts
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user (admin only)
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - List products (search, filter by status, pagination)
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (admin/manager)
- `PUT /api/products/:id` - Update product (admin/manager)
- `DELETE /api/products/:id` - Soft delete (set status=inactive)
- `PUT /api/products/:id/stock` - Adjust stock level
- `GET /api/products/low-stock` - Low stock alerts

### Customers
- `GET /api/customers` - List customers (search, pagination)
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer
- `GET /api/customers/:id/purchases` - Purchase history
- `PUT /api/customers/:id/points` - Update loyalty points

### Sales
- `POST /api/sales` - Create new sale
- `GET /api/sales` - List sales (filters, pagination)
- `GET /api/sales/:id` - Get sale details
- `PUT /api/sales/:id/void` - Void transaction

### Reports
- `GET /api/reports/sales-summary` - Aggregated sales summary
- `GET /api/reports/revenue` - Revenue over time
- `GET /api/reports/top-products` - Best-selling products
- `GET /api/reports/inventory-value` - Inventory valuation
- `GET /api/reports/cashier-performance` - Per-user sales stats

### Users
- `GET /api/users` - List users (admin only)
- `PUT /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

### Settings
- `GET /api/settings` - Get all settings (admin only)
- `PUT /api/settings` - Update settings (admin only)

### Audit Logs
- `GET /api/audit-logs` - List audit logs with pagination and filters (admin only)
  - Query params: `page`, `limit`, `action`, `resource`, `userId`

## Models

### User
| Field    | Type    | Notes                         |
|----------|---------|-------------------------------|
| id       | INTEGER | Auto-increment                |
| username | TEXT    | Required, unique              |
| email    | TEXT    | Required, unique              |
| password | TEXT    | Hashed with bcryptjs          |
| role     | TEXT    | admin, manager, or cashier    |
| status   | TEXT    | active or inactive            |

### Product
| Field       | Type    | Notes                    |
|-------------|---------|--------------------------|
| id          | INTEGER | Auto-increment           |
| name        | TEXT    | Required                 |
| sku         | TEXT    | Required, unique         |
| description | TEXT    | Optional                 |
| price       | REAL    | Required                 |
| stock       | INTEGER | Current stock level      |
| minStock    | INTEGER | Low stock threshold      |
| barcode     | TEXT    | Optional                 |
| status      | TEXT    | active or inactive       |

### Sale
| Field          | Type    | Notes                       |
|----------------|---------|-----------------------------|
| id             | INTEGER | Auto-increment              |
| transactionId  | TEXT    | Unique transaction code     |
| items          | JSON    | Array of line items         |
| subtotal       | REAL    |                             |
| tax            | REAL    | 8% default                  |
| discount       | REAL    |                             |
| total          | REAL    |                             |
| paymentMethod  | TEXT    | cash or card                |
| status         | TEXT    | completed or void           |

### Customer
| Field         | Type    | Notes         |
|---------------|---------|---------------|
| id            | INTEGER | Auto-increment|
| name          | TEXT    | Required      |
| email         | TEXT    | Optional      |
| phone         | TEXT    | Optional      |
| address       | TEXT    | Optional      |
| loyaltyPoints | INTEGER | Default 0     |
| totalPurchases| REAL    | Default 0     |

### Setting
| Field | Type | Notes           |
|-------|------|-----------------|
| key   | TEXT | Primary key     |
| value | TEXT | Setting value   |

### AuditLog
| Field      | Type    | Notes                        |
|------------|---------|------------------------------|
| id         | INTEGER | Auto-increment               |
| userId     | INTEGER | References User              |
| action     | TEXT    | CREATE, UPDATE, DELETE, VOID, LOGIN, REGISTER, STOCK_ADJUST |
| resource   | TEXT    | Product, Customer, User, Sale, Setting |
| resourceId | TEXT    | ID of affected resource      |
| details    | JSON    | Additional context           |
| ip         | TEXT    | Request IP address           |

## Default Seed Data

The database auto-seeds on first startup:
- **3 users**: admin, manager, cashier
- **4 categories**: Food & Beverages, Electronics, Clothing, Stationery
- **2 suppliers**: Supplier A, Supplier B
- **12 products**: 3 per category with realistic data
- **5 customers**: With varying purchase history and loyalty points
- **3 default settings**: `pos_currency` (USD), `pos_locale` (en-US)

## Receipt Printing

Receipts are designed for 80mm thermal printers:
- Monospace font, black & white only
- `@page { size: 80mm auto; margin: 0; }` CSS for correct sizing
- Store name, address, and contact from settings
- Line items table with quantities and prices
- Totals, payment info, and footer
- Triggered via `window.print()` — works with any printer driver

## Currency & Locale Settings

Admin can configure currency and locale under Settings:
- **15 preset currencies**: USD, EUR, GBP, JPY, CNY, INR, IDR, BRL, CAD, AUD, KRW, SGD, MYR, PHP, THB
- **Custom currency**: Enter any currency code (e.g., VND, MXN)
- **12 locales**: en-US, en-GB, de-DE, fr-FR, ja-JP, zh-CN, id-ID, es-ES, pt-BR, ko-KR, th-TH, vi-VN
- Changes apply immediately across all pages via `formatCurrency()` reading from localStorage

## Audit Logging

All significant actions are logged:
- **LOGIN / REGISTER**: User authentication events
- **CREATE / UPDATE / DELETE**: Product, Customer, User changes
- **VOID**: Sale voiding
- **STOCK_ADJUST**: Manual stock adjustments
- **SETTINGS**: Configuration changes

Audit logs include user, timestamp, action type, resource, affected ID, JSON details, and IP address. Viewable under Audit Logs page (admin only) with action/resource filtering and pagination.

## Mobile Responsiveness

The UI adapts to phone, tablet, and desktop:
- **Navigation**: Desktop horizontal nav → hamburger slide-down menu on mobile
- **POS**: Side-by-side layout on desktop → stacked vertically on mobile (products on top, cart below)
- **Modals**: Centered dialog on desktop → bottom-sheet style on mobile (`items-end sm:items-center`)
- **Tables**: Horizontal scroll on all pages
- **Cards**: Adaptive grid (2 cols mobile → 3 tablet → 4 desktop)

## Development

### Adding New Features
1. **Backend**: Add Sequelize model in `server/models/`, controller in `server/controllers/`, route in `server/routes/`, mount in `server-dev.js`
2. **Frontend**: Add service in `client/src/services/`, page in `client/src/pages/`, add route in `App.jsx`, add nav link in `Layout.jsx`
3. **Audit logging**: Import `auditLog` utility in controller and call after operations
4. **Restart the server** to sync new models (auto table creation via `sequelize.sync()`)

### Production Build
```bash
cd client && npm run build
cd ../server && node server.js
```

### Troubleshooting

**Port already in use:**
```bash
lsof -ti:5000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

**Re-seed database:**
```bash
rm server/database.sqlite && npm run server
```

**Check server logs:**
```bash
cat /tmp/server.log
cat /tmp/client.log
```

## License

MIT
