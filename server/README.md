# DALA Technologies API Server

Authentication and user management API for DALA Technologies platform.

## Features

- ✅ User registration (Retailers & Brand Partners)
- ✅ Secure login with JWT tokens
- ✅ Password hashing with bcrypt
- ✅ SQLite database
- ✅ Profile management
- 🔜 Google OAuth (coming soon)
- 🔜 Password reset via email (coming soon)

## Setup

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and set your JWT secret:

```env
JWT_SECRET=your_super_secret_random_string_here
PORT=3000
```

### 3. Start the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new account |
| POST | `/api/auth/login` | Login to account |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |
| PUT | `/api/auth/password` | Change password |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/google` | Google Sign-In |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server status |

## User Types

### Brand Partner
- Supplies products to retailers
- Profile includes: company name, product category, business details

### Retailer
- Owns/runs physical stores
- Profile includes: store name, type, location, address

## Database Schema

### Users Table
- id, uuid, user_type, email, password_hash, first_name, last_name, phone
- is_active, is_verified, google_id, profile_image
- created_at, updated_at, last_login

### Brand Profiles
- Company information for brand partners

### Retailer Profiles
- Store information for retailers

## Frontend Integration

The login and signup pages are located at:
- Login: `/pages/login.html`
- Signup: `/pages/signup.html`

API URL in frontend: `http://localhost:3000/api`

## Security Notes

- JWT tokens expire after 7 days
- Passwords are hashed with bcrypt (10 rounds)
- CORS is configured for local development
- In production, update CORS origins and use HTTPS
