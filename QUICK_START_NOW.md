# 🚀 Smart POS System - Quick Start (2 Minutes)

## Option 1: Mock Backend (No Database Needed) ⚡ FASTEST

**Terminal 1 - Backend (Mock):**
```bash
cd backend && npm install && npm run dev:mock
```

**Terminal 2 - Frontend:**
```bash
npm install && npm run dev
```

Then open: **http://localhost:3000**

Login: `admin` / `admin123`

---

## Option 2: Real Backend (Requires PostgreSQL)

**Terminal 1 - Backend:**
```bash
cd backend && npm install && npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm install && npm run dev
```

---

## What You Get

✅ Full POS Dashboard
✅ Product Management
✅ Inventory Tracking
✅ Customer Management
✅ Sales Reports
✅ AI Assistant (mock)
✅ Professional UI

---

## Troubleshooting

**Port 3000 already in use?**
```bash
npm run dev -- -p 3001
```

**Port 5000 already in use?**
```bash
PORT=5001 npm run dev:mock
```

**Dependencies missing?**
```bash
npm install
cd backend && npm install
```

---

## System Status

- Frontend: React/Next.js 14
- Backend: Express.js (Mock or Real)
- Database: PostgreSQL (optional)
- UI: Tailwind CSS
- Auth: JWT

Ready to go! 🎉
