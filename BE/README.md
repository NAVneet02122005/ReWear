# ReWear Backend API

Backend API for the ReWear clothing exchange platform built with Node.js, Express, and MongoDB.

## Features

- User authentication (JWT + Google OAuth)
- Listing management (CRUD operations)
- Swap system with points
- Purchase tracking
- Messaging system
- Admin panel
- Image upload with Cloudinary

## Tech Stack

- Node.js & Express
- MongoDB with Mongoose
- JWT Authentication
- Passport.js (Google OAuth)
- Cloudinary (Image hosting)
- Bcrypt (Password hashing)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (use `.env.example` as template):
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`

4. Start the server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/google/callback` - Google OAuth callback

### Listings
- `GET /api/products` - Get all listings
- `GET /api/products/:id` - Get listing by ID
- `POST /api/products` - Create new listing (protected)

### Swaps
- `GET /api/swaps` - Get user swaps (protected)
- `POST /api/swaps` - Create swap request (protected)
- `PUT /api/swaps/:id/accept` - Accept swap (protected)
- `PUT /api/swaps/:id/reject` - Reject swap (protected)
- `PUT /api/swaps/:id/cancel` - Cancel swap (protected)
- `PUT /api/swaps/:id/complete` - Complete swap (protected)

### Purchases
- `GET /api/purchases` - Get user purchases (protected)
- `GET /api/purchases/:id` - Get purchase by ID (protected)
- `POST /api/purchases` - Create purchase (protected)
- `POST /api/purchases/bulk` - Create bulk purchases (protected)
- `PUT /api/purchases/:id/cancel` - Cancel purchase (protected)

### Messages
- `GET /api/messages` - Get user messages (protected)
- `GET /api/messages/unread-count` - Get unread count (protected)
- `PUT /api/messages/:id/read` - Mark as read (protected)

### Admin
- `POST /api/admin/login` - Admin login
- `GET /api/admin/stats` - Get admin stats (admin only)
- `GET /api/admin/activity` - Get recent activity (admin only)

### Users (Admin)
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID (admin only)
- `PUT /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

## Project Structure

```
BE/
├── config/
│   ├── db.js              # MongoDB connection
│   └── passport.js        # Passport configuration
├── controllers/           # Route controllers
├── middleware/            # Custom middleware
├── models/               # Mongoose models
├── routes/               # API routes
├── scripts/              # Utility scripts
├── uploads/              # File uploads directory
├── utils/                # Helper functions
├── app.js                # Express app setup
├── server.js             # Server entry point
└── package.json          # Dependencies
```

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `node scripts/createAdmin.js` - Create admin user

## Environment Variables

See `.env.example` for required environment variables.
