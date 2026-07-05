# POS System - Point of Sale Application

A full-featured Point of Sale (POS) system built with React, Node.js, Express, and SQLite. Supports multi-user role-based access, inventory management, customer loyalty, thermal receipt printing, audit logging, customizable settings (currency, locale, tax, fees, store info), order types, and cashier restrictions.

## Features

### Core Functionality
- **Multi-User Authentication**: Role-based access control (Admin, Manager, Cashier) with JWT
- **Point of Sale Interface**: Fast product search (name/SKU/barcode), cart management, discounts, order types (Dine-in/Takeaway/Delivery/Pickup/Curbside), payment (cash/card)
- **Inventory Management**: Product CRUD, stock tracking (auto-decrements on sale), low-stock alerts, SKU/barcode support
- **Customer Management**: Profiles, purchase history, loyalty points system
- **Transaction History**: Searchable, filterable sales list for all roles; cashiers see only their own
- **Sales Management**: Transaction processing, void transactions (with stock restoration), receipt printing
- **Reports & Analytics**: Sales summaries, revenue charts, top products, inventory valuation, cashier performance
- **Audit Logging**: Track all CREATE, UPDATE, DELETE, VOID, LOGIN, and STOCK_ADJUST actions with user, IP, and details
- **Dashboard**: Today's sales, transaction count, low stock alerts, quick actions

### Configurable Settings (Admin)

| Section | Options |
|---------|---------|
| **Store Information** | Store name, address, phone, receipt footer message |
| **Tax & Fees** | Tax rate (%), tax inclusive toggle, service charge (on/off + rate %) |
| **POS Behavior** | Rounding mode (none / $0.05 / $0.10 / whole $), default payment (cash/card), auto-print receipt |
| **Cashier Restrictions** | Hide prices from cashiers, hide stock counts from cashiers |
| **Order Types** | Toggle Dine-in, Takeaway, Delivery, Pickup, Curbside — shown as tabs in POS |
| **Currency & Regional** | 15 preset currencies + custom code, 12 locales, live preview |

### Thermal Receipt Printing
- 80mm thermal printer support via `window.print()` with `@page { size: 80mm auto }`
- Store name, address, phone from settings
- Line items, quantities, prices, subtotals, service charge, discount, tax, total
- Order type, payment method, customer name
- Customizable footer message
- Hidden page UI during print (`visibility: hidden` on all body elements except receipt)

### Mobile Responsive
- Hamburger navigation on mobile, horizontal nav on desktop
- POS stacks vertically on mobile (products above, cart below)
- Bottom-sheet modals on phone (`items-end sm:items-center`)
- Tables horizontally scrollable
- Adaptive product grid (2 cols mobile → 3 tablet → 4 desktop)

### Cashier Workflow
- Dashboard shows their own today's sales and transaction count
- Transaction history filtered to their own sales only
- Optional price/stock hiding via admin settings
- Can view reports for end-of-shift data

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
- The server (`server/server-dev.js`) starts and auto-creates an SQLite database file (`server/database.sqlite`)
- Tables are synchronized via Sequelize models
- Sample data is seeded automatically: users, categories, suppliers, products, customers, and settings
- The client Vite dev server proxies `/api` requests to the backend at `localhost:5000`

## Default Login Credentials

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
- Settings (store info, tax, fees, POS behavior, currency, locale)
- Reports and analytics
- Void transactions

### Manager
- Reports and analytics
- Full inventory management
- Transaction history
- Void transactions
- Cannot manage users or view audit logs/settings

### Cashier
- POS register (create sales, apply discounts, select order types)
- View products and customers
- Dashboard with their own today's sales and transaction count
- Transaction history (their own sales only)
- Reports (end-of-shift data)
- Cannot edit/delete products or customers
- No user management, audit logs, or settings
- Optionally restricted from seeing prices and stock (admin configurable)

## Project Structure

```
testtoken/
├── client/                   # React frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components (Layout, Receipt, ProtectedRoute)
│   │   ├── context/          # React Context providers (AuthContext, CartContext)
│   │   ├── pages/            # Pages (Login, Dashboard, POS, Inventory, Customers, Transactions, Reports, Users, Settings, AuditLogs)
│   │   ├── services/         # API service layer
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
- `GET /api/products/low-stock` - Low stock alerts
- `POST /api/products` - Create product (admin/manager)
- `PUT /api/products/:id` - Update product (admin/manager)
- `DELETE /api/products/:id` - Soft delete (set status=inactive)
- `PUT /api/products/:id/stock` - Adjust stock level (admin/manager)

### Customers
- `GET /api/customers` - List customers (search, pagination)
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer
- `GET /api/customers/:id/purchases` - Purchase history
- `PUT /api/customers/:id/points` - Update loyalty points

### Sales
- `POST /api/sales` - Create new sale (auto-decrements stock, awards loyalty points)
- `GET /api/sales` - List sales (filters: status, paymentMethod, cashierId, date range; pagination)
- `GET /api/sales/:id` - Get sale details
- `PUT /api/sales/:id/void` - Void transaction (admin/manager; restores stock and reverses loyalty)

### Reports
- `GET /api/reports/sales-summary` - Aggregated sales summary (all roles; cashiers can filter by cashierId)
- `GET /api/reports/revenue` - Revenue over time (admin/manager)
- `GET /api/reports/top-products` - Best-selling products (admin/manager)
- `GET /api/reports/inventory-value` - Inventory valuation (admin/manager)
- `GET /api/reports/cashier-performance` - Per-user sales stats (admin/manager)

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
| stock       | INTEGER | Auto-decremented on sale |
| minStock    | INTEGER | Low stock threshold      |
| barcode     | TEXT    | Optional                 |
| status      | TEXT    | active or inactive       |

### Sale
| Field          | Type    | Notes                       |
|----------------|---------|-----------------------------|
| id             | INTEGER | Auto-increment              |
| transactionId  | TEXT    | Unique transaction code     |
| items          | JSON    | Array of line items         |
| customerId     | INTEGER | References Customer         |
| subtotal       | REAL    |                             |
| tax            | REAL    | Configurable rate           |
| discount       | REAL    |                             |
| serviceCharge  | REAL    | Configurable rate           |
| orderType      | TEXT    | Dine-in, Takeaway, etc.     |
| total          | REAL    | With optional rounding      |
| paymentMethod  | TEXT    | cash or card                |
| cashierId      | INTEGER | References User             |
| status         | TEXT    | completed or void           |

### Customer
| Field          | Type    | Notes              |
|----------------|---------|--------------------|
| id             | INTEGER | Auto-increment     |
| name           | TEXT    | Required           |
| email          | TEXT    | Optional           |
| phone          | TEXT    | Optional           |
| address        | TEXT    | Optional           |
| loyaltyPoints  | INTEGER | Earned from sales  |
| totalPurchases | REAL    | Lifetime total     |

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
- **4 categories**: Electronics, Clothing, Food & Beverage, Home & Garden
- **2 suppliers**: Tech Supply Co, Fashion Distributors
- **12 products**: 3 per category with realistic data (names, SKUs, barcodes, prices, stock levels)
- **5 customers**: With purchase history and loyalty points
- **16 default settings**: store info, tax (8%), service charge, rounding, payment, order types, currency (USD), locale (en-US), cashier restrictions

## Receipt Printing

Receipts are designed for 80mm thermal printers:
- Monospace font, black & white only
- `@page { size: 80mm auto; margin: 0; }` CSS for correct sizing
- Store name, address, and phone from settings (editable in Settings page)
- Line items table with quantities and prices
- Service charge, tax, discount, and totals
- Order type, payment method, customer info
- Customizable footer message from settings
- Hidden page UI during print (only receipt content visible)
- Triggered via `window.print()` — works with any printer driver
- Optional auto-print after sale (configurable in Settings)

## Settings Reference

All settings are stored as key-value pairs. Admin configures them via the Settings page.

| Key | Default | Description |
|-----|---------|-------------|
| store_name | My Store | Store name on receipts |
| store_address | (empty) | Store address on receipts |
| store_phone | (empty) | Store phone on receipts |
| receipt_footer | Thank you for your purchase! | Receipt footer message |
| tax_rate | 8 | Tax percentage |
| tax_inclusive | false | Prices already include tax |
| service_charge_enabled | false | Enable service charge |
| service_charge_rate | 5 | Service charge percentage |
| rounding_mode | none | none, nearest_005, nearest_010, nearest_int |
| default_payment | cash | Pre-selected payment method |
| receipt_auto_print | false | Auto-print after sale |
| cashier_hide_prices | false | Hide prices from cashiers |
| cashier_hide_stock | false | Hide stock from cashiers |
| order_types | ["Dine-in","Takeaway","Delivery"] | Available order types |
| currency | USD | Currency code |
| locale | en-US | Regional locale |

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
