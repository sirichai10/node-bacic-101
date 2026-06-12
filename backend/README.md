# Node Learn 101 - Backend Service

A modular and robust backend API built with **Node.js**, **Express**, **TypeScript**, and **Prisma ORM** connecting to a **PostgreSQL** database. The codebase uses **Zod** for schema validation and supports modern ES Modules (`"type": "module"`).

---

## 🏗️ Project Structure

Below is an overview of the codebase organization:

```backend/
├── prisma/
│   ├── schema.prisma       # Prisma Database Schema definitions
│   └── seed.ts             # Script to seed initial database records
│ ├── src/
│   ├── index.ts            # Application entry point & Graceful Shutdown handler
│   ├── app.ts              # Express application configuration and middleware piping
│   ├── db.ts               # Prisma Client instantiation and connection checks
│   ├── controllers/        # Request handling and controller layer
│   │   ├── dashboard.controller.ts
│   │   ├── health.controller.ts
│   │   ├── product.controller.ts
│   │   └── profile.controller.ts
│   ├── middlewares/        # Custom Express middlewares
│   │   ├── error.middleware.ts
│   │   └── logging.middleware.ts # HTTP request ID correlation & auditing middleware
│   ├── models/             # Zod validation schemas and type interfaces
│   │   └── product.model.ts
│   ├── routes/             # Route groups and router setup
│   │   ├── index.ts        # Aggregated main API router
│   │   ├── dashboard.routes.ts
│   │   ├── health.routes.ts
│   │   ├── product.routes.ts
│   │   └── profile.routes.ts
│   ├── services/           # Business logic layer
│   │   ├── logger.service.ts  # Winston logging service with AsyncLocalStorage context
│   │   └── product.service.ts
│   └── utils/              # Custom helper classes and utility components
│       └── errors.ts       # Custom HTTP/API operational error classes
├── .env.example            # Template for environment configuration
├── Dockerfile              # Multi-stage production build configuration
├── docker-compose.yml      # Multi-container orchestration (Backend + PostgreSQL)
├── package.json            # Scripts, metadata, and dependencies
├── prisma.config.ts        # Global Prisma config schema definitions
└── tsconfig.json           # TypeScript compilation configuration
```

---

## 🛠️ Codebase Component Roles

### 📦 Entry Points & Config

- **[src/index.ts](file:///Users/sirichaiprasopphon/Documents/2026-practice/node-learn-101/backend/src/index.ts)**: Configures the HTTP server instance and manages standard graceful shutdowns on `SIGINT` / `SIGTERM` signals. Uses the logger for system states.
- **[src/app.ts](file:///Users/sirichaiprasopphon/Documents/2026-practice/node-learn-101/backend/src/app.ts)**: Initiates Express, hooks middleware (parsers, logging middleware), attaches the router under `/`, handles unmatched endpoints (404), and binds the global error handling middleware.
- **[src/db.ts](file:///Users/sirichaiprasopphon/Documents/2026-practice/node-learn-101/backend/src/db.ts)**: Connects standard `pg` pool client with `@prisma/adapter-pg` to initialize the `PrismaClient`. Provides a helper `testDbConnection()` to check backend connectivity to PostgreSQL.

### 🎮 MVC Layer

- **Controllers (`src/controllers/`)**: Parse requests, execute validation checks, call the service layer, and send JSON responses back to clients.
- **Routes (`src/routes/`)**: Map incoming HTTP verbs and path resources to controllers.
- **Services (`src/services/`)**: Enclose pure business operations, queries, database transactional queries, and state mutations. Directly interface with `Prisma`.

### 🛡️ Utilities, Schemas & Observability

- **Models (`src/models/`)**: House schema schemas using Zod for payload sanitization (e.g., `createProductSchema`) and interface representations for payload payloads.
- **Middlewares (`src/middlewares/`)**: Apply standard cross-cutting logic:
  - `error.middleware.ts`: Maps validation exceptions (`ZodError`) or custom operational exceptions (`AppError`) into neat JSON responses, logging internal failures using the logging service.
  - `logging.middleware.ts`: Core request tracing middleware. Extracts/generates request correlation IDs and handles audit logs.
- **Logging Service (`src/services/logger.service.ts`)**: Production-grade structured logger powered by `winston` and Node.js's native `AsyncLocalStorage`.
  - _Development:_ Human-readable, colorized output with timestamps and contextual `requestId`.
  - _Production:_ Single-line JSON format containing details (level, environment, timestamp, correlation IDs), matching Twelve-Factor app logging standards.
- **Utils (`src/utils/`)**: Includes the custom `AppError` framework (`BadRequestError`, `NotFoundError`, `UnauthorizedError`, `ValidationError`) for handling operational exceptions gracefully.

---

## 🗄️ Database Schema ([schema.prisma](file:///Users/sirichaiprasopphon/Documents/2026-practice/node-learn-101/backend/prisma/schema.prisma))

The application defines three main database tables (under mapping directives):

1.  **`User`** (`users`): Represents authenticated users. Includes roles (`USER`, `ADMIN`), emails, avatars, and registration metadata.
2.  **`Category`** (`categories`): Organizes items by name and links to multiple products.
3.  **`Product`** (`products`): Keeps inventory records including names, descriptions, prices, stocks, and category associations.

---

## 🚀 Getting Started

### 📋 Prerequisites

- Node.js v22 or newer
- NPM v10 or newer
- PostgreSQL instance or Docker Desktop

### 🔌 Environment Setup

Copy the template configuration file to configure your local context:

```bash
cp .env.example .env
```

Ensure you update the `DATABASE_URL` line inside `.env` to reference your database instance:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/postgres?schema=public"
```

### ⚙️ Installation & Running Database

1. Install project dependencies:

   ```bash
   npm install
   ```

2. Generate the local Prisma Client definitions:

   ```bash
   npx prisma generate
   ```

3. Run migrations or sync schema to database (and seed default data):

   ```bash
   # Push schema layout changes directly to target PostgreSQL DB
   npx prisma db push

   # Run db seeding logic (instantiates users and categories defined in prisma/seed.ts)
   npx prisma db seed
   ```

### 🏃 Running Application

- **Development Mode** (Runs with hot-reloading using `tsx`):

  ```bash
  npm run dev
  ```

- **Production Build & Start**:

  ```bash
  # Transpile code into ES6 JS inside the dist/ folder
  npm run build

  # Run the production transpiled JS using Node's env loader
  npm run start
  ```

---

## 🐳 Running with Docker

Orchestrate the app container alongside a fresh PostgreSQL container using:

```bash
docker compose up --build
```

This maps the API server onto port `8080` and starts a persistent PostgreSQL db service on `5432`.

---

## 🔌 API Endpoints Summary

### 💓 System

- `GET /health`: Checks service status and PostgreSQL connectivity.

### 📦 Product Resources

- `GET /products`: Returns list of products. Supports filtering by query parameters:
  - `search`: Text search matches product name and description (case-insensitive).
  - `category`: Matches category name.
  - `minPrice` / `maxPrice`: Filter by price range boundaries.
  - `inStock`: Set `"true"` to filter products with stock > 0, otherwise `"false"`.
- `GET /products/:id`: Retrieves individual product metadata.
- `POST /products`: Registers a new product. (Requires: `name`, `price`, `category`, `stock` inside JSON body).
- `PUT /products/:id`: Updates an existing product.
- `DELETE /products/:id`: Deletes a product record.

### 👤 Mock / Dashboard Endpoints

- `GET /profile`: Returns a mock user profile.
- `GET /dashboard`: Returns simulated analytics, monthly revenue charts, and traffic metrics.
