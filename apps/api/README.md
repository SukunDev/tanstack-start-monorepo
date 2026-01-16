# API Application

RESTful API server built with Express.js, TypeScript, and integrated with database and email services.

## 📦 Overview

This is the main API application that:

- Handles HTTP requests via Express.js
- Authenticates users with JWT
- Manages user accounts and profiles
- Sends transactional emails
- Communicates with PostgreSQL via Prisma

## 📁 Structure

```
apps/api/
├── src/
│   ├── index.ts              # Entry point
│   ├── controllers/          # Request handlers
│   │   ├── index.ts
│   │   ├── auth/
│   │   │   └── auth.controller.ts
│   │   └── user/
│   │       └── user.controller.ts
│   ├── routes/               # API routes
│   │   ├── index.ts
│   │   ├── auth/
│   │   │   └── auth.route.ts
│   │   └── user/
│   │       └── user.route.ts
│   ├── services/             # Business logic
│   │   ├── index.ts
│   │   ├── auth/
│   │   │   └── auth.service.ts
│   │   ├── user/
│   │   │   └── user.service.ts
│   │   └── service/          # Common services
│   │       └── index.ts
│   ├── middleware/           # Express middleware
│   │   ├── index.ts
│   │   ├── auth/
│   │   │   └── auth.middleware.ts
│   │   └── permission/
│   │       └── permission.middleware.ts
│   ├── interfaces/           # TypeScript interfaces
│   │   ├── index.ts
│   │   ├── auth.interface.ts
│   │   └── response.interface.ts
│   ├── utils/                # Utility functions
│   └── lib/                  # Libraries
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd apps/api
bun install
```

### 2. Configure Environment

Create `.env` in project root:

```bash
PORT=5000
NODE_ENV=development
CORS_ORIGIN=["http://localhost:3000"]

DATABASE_URL=postgresql://user:password@localhost:5432/monorepo_dev

JWT_SECRET=your-secret-key
JWT_EXPIRY=24h

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourdomain.com
```

### 3. Start Development Server

```bash
bun dev
```

Server runs on `http://localhost:5000`

## 🛣️ API Routes

### Authentication Routes

```
POST   /api/auth/register     # Register new user
POST   /api/auth/login        # Login user
POST   /api/auth/logout       # Logout user
POST   /api/auth/refresh      # Refresh JWT token
POST   /api/auth/otp/send     # Send OTP
POST   /api/auth/otp/verify   # Verify OTP
```

### User Routes

```
GET    /api/users/profile     # Get user profile (requires auth)
PATCH  /api/users/profile     # Update profile (requires auth)
DELETE /api/users/:id         # Delete user account (requires auth)
GET    /api/users             # List users (admin only)
```

## 🏗️ Architecture Pattern

### MVC-like Structure

```
Request
  ↓
Routes    → Validate route
  ↓
Middleware → Check auth, permissions
  ↓
Controllers → Handle request, call services
  ↓
Services → Business logic, database operations
  ↓
Database → Prisma ORM
  ↓
Response
```

### Example Flow: User Login

```typescript
// 1. Request comes to route
POST /api/auth/login

// 2. Middleware checks content-type
authMiddleware()

// 3. Controller handles it
authController.login(req, res) {
  // Validates request data
  const { email, password } = req.body;

  // Calls service for business logic
  const result = await authService.login(email, password);

  // Returns response
  res.json(result);
}

// 4. Service does the work
authService.login(email, password) {
  // Find user in database
  const user = await prisma.user.findUnique({ where: { email } });

  // Verify password
  const isValid = await bcrypt.compare(password, user.password);

  // Generate JWT
  const token = jwt.sign(user.id, JWT_SECRET);

  // Return user data + token
  return { user, token };
}
```

## 🔐 Authentication

### JWT Flow

```
1. User logs in
2. Server generates JWT
3. Client stores JWT (localStorage/cookie)
4. Client sends JWT in Authorization header
5. Middleware validates JWT
6. Route handler receives authenticated user
```

### Implementing Protected Routes

```typescript
// routes/user/user.route.ts
import express from "express";
import { authMiddleware } from "../../middleware/auth";
import { userController } from "../../controllers/user";

const router = express.Router();

// Protected route - requires valid JWT
router.get(
  "/profile",
  authMiddleware, // Validate JWT
  userController.getProfile
);

export default router;
```

### Authorization Example

```typescript
// middleware/permission/permission.middleware.ts
import { Request, Response, NextFunction } from "express";

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

// Usage
router.delete(
  "/users/:id",
  authMiddleware,
  requireAdmin, // Check if user is admin
  userController.deleteUser
);
```

## 📝 Scripts

```bash
cd apps/api

# Development with hot-reload
bun dev

# Build for production
bun run build

# Start production server
node dist/index.js

# Type checking
bun run type-check
```

## 🛠️ Adding a New Route

### 1. Create Controller

```typescript
// src/controllers/product/product.controller.ts
import { Request, Response } from "express";
import { productService } from "../../services/product";

export const productController = {
  async getProducts(req: Request, res: Response) {
    try {
      const products = await productService.findAll();
      res.json({ success: true, data: products });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async getProductById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const product = await productService.findById(Number(id));

      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      res.json({ success: true, data: product });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
};
```

### 2. Create Service

```typescript
// src/services/product/product.service.ts
import { prisma } from "@packages/database";

export const productService = {
  async findAll() {
    return await prisma.product.findMany();
  },

  async findById(id: number) {
    return await prisma.product.findUnique({
      where: { id },
    });
  },

  async create(data: { name: string; price: number }) {
    return await prisma.product.create({ data });
  },
};
```

### 3. Create Route

```typescript
// src/routes/product/product.route.ts
import express from "express";
import { authMiddleware } from "../../middleware/auth";
import { productController } from "../../controllers/product";

const router = express.Router();

router.get("/", productController.getProducts);
router.get("/:id", productController.getProductById);
router.post("/", authMiddleware, productController.create);

export default router;
```

### 4. Register Route

```typescript
// src/routes/index.ts
import productRoutes from "./product/product.route";

export default (app: express.Application) => {
  app.use("/api/products", productRoutes);
  // ... other routes
};
```

## 📋 Request/Response Format

### Standard Response

```typescript
// Success response
{
  success: true,
  data: { /* response data */ }
}

// Error response
{
  success: false,
  error: "Error message",
  statusCode: 400
}
```

### Request Headers

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## ⚠️ Error Handling

### Custom Error Handler

```typescript
// src/utils/error-handler.ts
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
  }
}

// Usage in service
async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  // ... more logic
}

// Usage in controller
try {
  const result = await authService.login(email, password);
  res.json(result);
} catch (error) {
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      success: false,
      error: error.message,
      details: error.details,
    });
  }

  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
}
```

## 🧪 Testing Example

```typescript
// src/routes/auth/auth.route.test.ts
import request from "supertest";
import express from "express";

describe("Auth Routes", () => {
  it("should register new user", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "test@example.com",
      password: "Password123!",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.user.email).toBe("test@example.com");
  });

  it("should login user", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "existing@example.com",
      password: "Password123!",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty("token");
  });
});
```

## 🚀 Deployment

### Build for Production

```bash
bun run build
```

### Environment Variables for Production

```bash
PORT=5000
NODE_ENV=production
CORS_ORIGIN=["https://yourdomain.com"]

DATABASE_URL=postgresql://prod_user:prod_pass@prod_host:5432/prod_db

JWT_SECRET=<long-random-secret-key>
JWT_EXPIRY=24h

SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.xxxxx
SMTP_FROM=noreply@yourdomain.com
```

### Run Production Server

```bash
# Using Node
node dist/index.js

# Using PM2 (process manager)
pm2 start dist/index.js --name "api"

# Using Docker
docker run -p 5000:5000 --env-file .env your-api-image
```

## 🔗 Related Documentation

- [Express.js Docs](https://expressjs.com/)
- [JWT Documentation](https://jwt.io/)
- [@packages/database README](../../packages/database/README.md)
- [@packages/email README](../../packages/email/README.md)
- [@packages/shared README](../../packages/shared/README.md)
- [Monorepo README](../../README.md)

## 📄 License

MIT
