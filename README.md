# E-commerce Platform Backend

A RESTful API for managing users, products, and orders in an e-commerce platform. Built with **Node.js**, **Express**, and **MongoDB**.

---

## Features
- User registration & login with **JWT authentication**
- Password hashing with **bcrypt**
- Role-based authorization (`Admin`, `User`)
- Product CRUD (Create, Read, Update, Delete)
- Product listing with **pagination** & **search**
- Order placement with stock validation and transactional safety
- Order history retrieval for authenticated users
- Clean, consistent API responses

---

## Tech Stack
- Node.js, Express, MongoDB, Mongoose
- JWT for authentication
- bcrypt for password hashing
- dotenv for environment management
- Jest/Supertest (optional for tests)
- Redis (optional for caching)

---

## Setup
1. Clone: `git clone https://github.com/<username>/ecommerce-backend.git`
2. Install: `npm install`
3. Create `.env`:

PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_jwt_secret


4. Start server: `npm run dev`

---

## API Endpoints

**Auth**
- `POST /auth/register` – Register
- `POST /auth/login` – Login (JWT)

**Products**
- `POST /products` – Admin create
- `PUT /products/:id` – Admin update
- `DELETE /products/:id` – Admin delete
- `GET /products` – Public list (pagination + search)
- `GET /products/:id` – Public details

**Orders**
- `POST /orders` – User place order
- `GET /orders` – User order history

---

## Responses
- **Success:** `{ success: true, message, object, errors: null }`
- **Failure:** `{ success: false, message, object: null, errors: [ ... ] }`
- Common status codes: `200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`

---

## Notes
- Passwords never returned in API responses
- Admin-only routes protected by role-based middleware
- Pagination example: `/products?page=1&pageSize=10`
- Search example: `/products?search=phone`

---

- Caching product listing with Redis
- Product image upload (Cloudinary)
- Rate limiting and advanced filtering
