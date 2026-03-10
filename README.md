# POS System

A modern Point of Sale (POS) system built with Next.js, React, and Tailwind CSS.

## Features

- Dashboard with sales overview
- Product inventory management
- Checkout and payment processing
- Transaction history
- Sales reports
- System settings

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file based on `.env.example`:
```bash
cp .env.example .env.local
```

3. Update environment variables in `.env.local` with your database URL and API configuration.

### Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

Build for production:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## Deployment to Vercel

### Prerequisites

- GitHub account with your code pushed
- Vercel account (free at https://vercel.com)

### Steps

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/pos-system.git
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to https://vercel.com/new
   - Click "Import Git Repository"
   - Select your GitHub repository
   - Click "Import"

3. **Configure Environment Variables**
   - In Vercel dashboard, go to Settings → Environment Variables
   - Add your environment variables (DATABASE_URL, etc.)
   - Click "Save"

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Your app will be live at `https://your-project.vercel.app`

### Automatic Deployments

Every push to the `main` branch will automatically trigger a new deployment on Vercel.

## Database Setup

This project is configured to work with any database. To connect a database:

1. Choose a database service (Supabase, MongoDB Atlas, PlanetScale, etc.)
2. Get your connection string
3. Add it to your `.env.local` as `DATABASE_URL`
4. Update the API routes in `app/api/` to use your database client

## Project Structure

```
pos-system/
├── app/
│   ├── api/              # API routes
│   ├── dashboard/        # Dashboard page
│   ├── products/         # Products page
│   ├── checkout/         # Checkout page
│   ├── transactions/     # Transactions page
│   ├── reports/          # Reports page
│   ├── settings/         # Settings page
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## Next Steps

1. Connect a database to store products, transactions, and settings
2. Implement authentication for user login
3. Add payment gateway integration (Stripe, PayPal, etc.)
4. Implement real-time inventory updates
5. Add more detailed reporting features
6. Implement user roles and permissions

## License

MIT
