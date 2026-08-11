# 📦 StockFlow — Warehouse Inventory Management System

A full-stack **MERN** inventory management system with **role-based access control**, **real-time stock tracking**, a complete **audit trail**, and a polished, animated UI.

> Built as a practical task for a Full Stack Developer position — designed to mirror real-world WMS workflows.

![Stack](https://img.shields.io/badge/Stack-MERN-4f46e5) ![Node](https://img.shields.io/badge/Node-%E2%89%A518-16a34a) ![License](https://img.shields.io/badge/License-MIT-blue)

## 🔗 Live Demo

| | URL |
|---|---|
| **Frontend (app)** | **https://wms-frontend-weld.vercel.app** |
| **Backend (API)** | https://wms-api-wvzd.onrender.com/api |
| **Health check** | https://wms-api-wvzd.onrender.com/api/health |

Log in with any demo account below (or use the one-click demo buttons on the login screen).

> ⏳ The API is hosted on Render's free tier, which sleeps after inactivity — the **first request may take ~30–50 s to wake up**, then it's fast.

---

## ✨ Features

| Area | Highlights |
|------|-----------|
| **Auth** | JWT authentication, bcrypt password hashing, protected routes |
| **RBAC** | Three roles — **Admin**, **Manager**, **Staff** — enforced on both API and UI |
| **Products** | Full CRUD, unique SKU, category filters, live search, low-stock highlighting |
| **Inventory** | Inbound / outbound movements with stock validation & full audit logging |
| **Dashboard** | Total products, inventory value, low-stock alerts, category charts, activity feed |
| **Logs** | Complete movement history, filterable by product, action type & date range |
| **UX** | Responsive design, animations (Framer Motion), skeleton loaders, toast notifications, empty & error states |

### Role permissions

| Capability | Admin | Manager | Staff |
|------------|:-----:|:-------:|:-----:|
| View products & dashboard | ✅ | ✅ | ✅ |
| Create / edit products | ✅ | ✅ | ❌ |
| Delete products | ✅ | ❌ | ❌ |
| Inbound / outbound stock | ✅ | ✅ | ❌ |
| View inventory logs | ✅ | ✅ | ✅ |
| Manage users | ✅ | ❌ | ❌ |

---

## 🛠 Tech Stack

**Backend:** Node.js · Express · MongoDB · Mongoose · JWT · bcryptjs · express-validator · helmet · morgan
**Frontend:** React 18 · Vite · React Router · Context API · Axios · Framer Motion · Recharts · Lucide Icons · React Hot Toast

---

## 📁 Project Structure

```
WMS/
├── backend/
│   ├── src/
│   │   ├── config/         # MongoDB connection
│   │   ├── models/         # User, Product, InventoryLog schemas
│   │   ├── controllers/    # Business logic
│   │   ├── routes/         # API route definitions + validation
│   │   ├── middleware/     # auth, roles, validation, error handling
│   │   ├── utils/          # ApiError, asyncHandler, token helper
│   │   ├── seed.js         # Demo data seeder
│   │   ├── app.js          # Express app
│   │   └── server.js       # Entry point
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/            # Axios instance + interceptors
│   │   ├── context/        # AuthContext (Context API)
│   │   ├── components/     # Layout, UI primitives, guards
│   │   ├── pages/          # Login, Dashboard, Products, Inventory, Logs, Users
│   │   └── lib/            # Formatting helpers
│   └── .env.example
├── WMS.postman_collection.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **MongoDB** running locally (`mongodb://localhost:27017`) **or** a MongoDB Atlas URI

### 1. Clone

```bash
git clone https://github.com/Vghkrishna/WMS.git
cd WMS
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env      # then edit values if needed
npm run seed              # seed demo users + products
npm run dev               # starts on http://localhost:5000
```

### 3. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev               # starts on http://localhost:5173
```

Open **http://localhost:5173** and log in with a demo account below.

> 💡 From the repo root you can also run `npm run install:all` and use the root scripts (`npm run dev:backend`, `npm run dev:frontend`, `npm run seed`).

---

## 🔑 Demo Accounts

Created by `npm run seed`:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@wms.com` | `admin123` |
| Manager | `manager@wms.com` | `manager123` |
| Staff | `staff@wms.com` | `staff123` |

The login screen also has **one-click demo buttons** for each role.

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | API port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/warehouse-inventory` |
| `JWT_SECRET` | Secret used to sign JWTs | `your-secret-key` |
| `JWT_EXPIRE` | Token lifetime | `7d` |
| `CLIENT_URL` | Allowed CORS origin(s), comma-separated | `http://localhost:5173` |

### Frontend (`frontend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Base URL of the backend API | `http://localhost:5000/api` |

---

## 📡 API Documentation

Base URL: `http://localhost:5000/api`
All protected endpoints require the header: `Authorization: Bearer <token>`

Standard success shape: `{ "success": true, "data": ... }`
Standard error shape: `{ "success": false, "message": "...", "errors": [...] }`

### Authentication

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/auth/login` | Public | Login, returns JWT + user |
| `POST` | `/auth/register` | Admin | Create a manager/staff/admin user |
| `GET` | `/auth/me` | Any | Current user profile |
| `GET` | `/auth/users` | Admin | List all users |

**Login request**
```json
{ "email": "admin@wms.com", "password": "admin123" }
```
**Login response**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOi...",
    "user": { "_id": "...", "name": "Admin User", "email": "admin@wms.com", "role": "admin" }
  }
}
```

### Products

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/products` | Any | List products. Query: `search`, `category`, `lowStock=true`, `sort`, `order`, `page`, `limit` |
| `GET` | `/products/:id` | Any | Product details + recent logs |
| `GET` | `/products/meta/categories` | Any | Distinct category list |
| `POST` | `/products` | Admin, Manager | Create product |
| `PUT` | `/products/:id` | Admin, Manager | Update product |
| `DELETE` | `/products/:id` | Admin | Delete product + its logs |

**Create/Update body**
```json
{
  "name": "Wireless Mouse",
  "sku": "ELE-MOU-001",
  "category": "Electronics",
  "quantity": 120,
  "price": 25.99,
  "location": "A1-R2",
  "lowStockThreshold": 20
}
```

### Inventory

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/inventory/inbound` | Admin, Manager | Add stock, logs the movement |
| `POST` | `/inventory/outbound` | Admin, Manager | Remove stock (validates sufficient stock) |
| `GET` | `/inventory/logs` | Any | Movement history. Query: `productId`, `action`, `startDate`, `endDate` |
| `GET` | `/inventory/low-stock` | Any | Products at/below their low-stock threshold |

**Inbound / Outbound body**
```json
{ "productId": "<id>", "quantity": 25, "notes": "PO #1234" }
```

### Dashboard

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/dashboard/stats` | Any | Totals, value, low-stock count, category breakdown, recent activity |

---

## 🧪 Postman Collection

Import **`WMS.postman_collection.json`** into Postman.

1. Run **Auth → Login (Admin)** first — the token is **saved automatically** to the collection variable `{{token}}` via a test script.
2. Every other request uses `{{token}}` and `{{baseUrl}}` automatically.
3. Product/inventory requests store the created `productId` for chaining.

---

## 💡 Business Logic Notes

- **Inbound** increases `quantity` and writes an `inbound` log with the resulting stock level.
- **Outbound** validates `quantity <= currentStock` (returns `400` otherwise), decreases stock, writes an `outbound` log.
- **Low stock** is any product where `quantity <= lowStockThreshold` — highlighted in red across the UI.
- Every movement is stamped with the acting **user** and a **timestamp** for a complete audit trail.
- Creating a product with an opening quantity records an initial `inbound` log automatically.

---

## 🌐 Deployment

The app is deployment-ready for common platforms:

- **Backend** → Render / Railway / Fly.io. Set the env vars above; start command `npm start`. A `render.yaml` blueprint is included.
- **Frontend** → Vercel / Netlify. Build command `npm run build`, output dir `dist`, and set `VITE_API_URL` to your deployed API URL. A `vercel.json` (SPA rewrite) is included.
- **Database** → MongoDB Atlas (free tier). Put the connection string in `MONGODB_URI`.

**This project is deployed:**

| Layer | Platform | URL |
|-------|----------|-----|
| Frontend | Vercel | https://wms-frontend-weld.vercel.app |
| Backend | Render | https://wms-api-wvzd.onrender.com/api |
| Database | MongoDB Atlas | (cloud cluster) |

> **Note on Atlas:** the cluster's Network Access must allow the host running the API. For Render's free tier (no static outbound IP), set Atlas Network Access to `0.0.0.0/0`.

---

## 👤 Author

**Krishna Vaghela** — Full Stack Developer

## 📄 License

MIT — see [LICENSE](LICENSE).
