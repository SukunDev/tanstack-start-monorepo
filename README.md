# TanStack Start Monorepo

This repository is a full-stack monorepo boilerplate built with the TanStack ecosystem, featuring a complete authentication system. It includes a Vite-powered React frontend, an Express.js backend, and uses Bun as the package manager and runtime.

## Key Features

- **Full-Stack Authentication:** Complete flow for user registration, email verification, login with OTP, password reset, and JWT-based session management.
- **Monorepo Architecture:** Organized with Turborepo and Bun Workspaces for efficient code sharing and management.
- **Role-Based Access Control (RBAC):** Backend includes a database schema for Users, Roles, and Permissions.
- **Type-Safe:** End-to-end type safety with TypeScript, shared Zod schemas, and Prisma for database interactions.
- **Modern Tech Stack:** Utilizes Vite, React, TanStack Start, Express, PostgreSQL, and Tailwind CSS.
- **Shared UI Library:** A dedicated `ui` package built with `shadcn/ui` for a consistent design system.
- **Transactional Emails:** Integrated email service (`@packages/email`) for sending auth-related emails like verification links and OTPs.

## Tech Stack

- **Frameworks:** TanStack Start (React), Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Frontend:** Vite, TanStack Router, Tailwind CSS
- **Backend:** Node.js (via Bun)
- **Monorepo Tooling:** Turborepo, Bun Workspaces
- **Validation:** Zod for schema validation
- **UI Components:** `shadcn/ui`

## Repository Structure

The monorepo is organized into `apps` and `packages`:

```
/
├── apps/
│   ├── api/      # Express.js backend API
│   └── web/      # Vite + React frontend (TanStack Start)
│
└── packages/
    ├── database/ # Prisma schema, client, and migrations
    ├── email/    # Nodemailer email service
    ├── shared/   # Zod schemas and shared constants
    ├── tsconfig/ # Shared TypeScript configurations
    └── ui/       # Shared React components (shadcn/ui)
```

## Getting Started

Follow these steps to get the project running locally.

### Prerequisites

- [Bun](https://bun.sh/) (v1.1.0 or later)
- [PostgreSQL](https://www.postgresql.org/) database instance

### 1. Installation

Clone the repository and install the dependencies using Bun:

```bash
git clone https://github.com/sukunDev/tanstack-start-monorepo.git
cd tanstack-start-monorepo
bun install
```

### 2. Environment Variables

Create a `.env` file in the root of the project by copying the example below. Update the values to match your local environment.

```env
# Application
PORT=5000
NODE_ENV=development
APP_URL="http://localhost:3000"
CORS_ORIGIN='["http://localhost:3000"]'

# Database (PostgreSQL)
DATABASE_URL="postgresql://your_db_user:your_db_password@localhost:5432/monorepo_dev"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRY="24h"

# Email (SMTP) - Example for Gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
```

### 3. Database Setup

Run the following command to apply the database schema, migrations, and seed initial data (roles and permissions).

```bash
# Push schema changes to the database
bun db:push

# (Optional) To run migrations from scratch and seed data
bun db:migrate
```

### 4. Run Development Servers

Start both the frontend and backend applications in parallel:

```bash
bun dev
```

- **Web App**: `http://localhost:3000`
- **API Server**: `http://localhost:5000`

## Available Scripts

The following scripts are available in the root `package.json`:

| Script           | Description                                                     |
| ---------------- | --------------------------------------------------------------- |
| `bun dev`        | Starts all applications (`web` and `api`) in development mode.  |
| `bun build`      | Builds all packages and applications for production.            |
| `bun dev:web`    | Starts only the `web` application.                              |
| `bun dev:api`    | Starts only the `api` application.                              |
| `bun db:push`    | Pushes the current Prisma schema state to the database.         |
| `bun db:migrate` | Creates and applies a new migration based on schema changes.    |
| `bun db:studio`  | Opens the Prisma Studio to view and edit data in your database. |
| `bun lint`       | Lints all packages and apps.                                    |

## Core Concepts

### Authentication Flow

This boilerplate implements a robust authentication system:

1.  **Registration (`/register`):** A new user signs up. The API creates a user record and sends a verification email.
2.  **Email Verification (`/verify-email`):** The user clicks the link in the email. The API verifies the token and marks the user's email as verified.
3.  **Login (`/login`):** The user enters their credentials.
4.  **OTP Verification:** The API sends a One-Time Password (OTP) to the user's email.
5.  **OTP Entry (`/verify-otp`):** The user enters the received OTP.
6.  **Session Creation:** Upon successful OTP verification, the API generates and returns a JWT `access_token` and `refresh_token`.
7.  **Authenticated Access:** The frontend stores the tokens and uses the `access_token` in the `Authorization` header for all subsequent protected API requests. The `ProtectedRoute` component in the frontend ensures pages are only accessible to logged-in users.

### Monorepo & Code Sharing

- **Turbo:** Manages the build and development process, caching artifacts to speed up builds.
- **Bun Workspaces:** Links local packages (`database`, `ui`, `shared`, etc.), allowing them to be imported directly into the `web` and `api` applications.
- **`@packages/shared`:** Contains Zod schemas for request validation and shared constants, ensuring consistency between the frontend and backend.
- **`@packages/ui`:** Provides a library of reusable React components, ensuring a consistent look and feel across the `web` application.

## License

This project is licensed under the MIT License.
