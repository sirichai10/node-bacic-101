# Application Architecture Flows

This document details the main runtime flows of the backend application:
1. **Application Initialization Flow**
2. **Logger & Request Context Flow**
3. **API Request-Response Lifecycle Flow (with tracing and error handling)**

---

## 1. Application Initialization Flow

When the application boots up, it runs through connection checks and server configuration steps before listening to client traffic.

```mermaid
sequenceDiagram
    autonumber
    participant Process as Node.js Process
    participant index as src/index.ts (Entry)
    participant db as src/db.ts
    participant app as src/app.ts
    participant express as Express Engine

    Process->>index: Execute startServer()
    index->>db: testDbConnection()
    db->>db: pg.Pool.connect() (Check PostgreSQL)
    db->>db: prisma.$connect() (Initialize ORM client)
    db-->>index: Connection Success (logger.info)
    
    index->>app: Import and configure Express instance
    app->>express: Load global parser middlewares (json, urlencoded)
    app->>express: Register loggingMiddleware (AsyncLocalStorage context)
    app->>express: Bind router mappings (apiRouter routes)
    app->>express: Bind fallback 404 and global errorMiddleware
    
    app-->>index: Export configured app object
    index->>index: app.listen(PORT)
    index-->>Process: Server Running (logger.info)
```

---

## 2. Logger & Request Context Flow

The logger system manages environment-based formatting and relies on Node.js's native `AsyncLocalStorage` to implicitly link logs to their triggering requests.

```mermaid
graph TD
    A[HTTP Request Client] -->|GET /products/1| B(loggingMiddleware)
    B -->|Check headers or Generate UUID| C{RequestId}
    C -->|Assign Correlation ID| D[loggerStore.run context]
    D -->|Exec Downstream Route| E[Controller / DB Service]
    E -->|Call logger.info / logger.warn| F[logger.service.ts]
    F -->|Fetch Context Store| G{Store Active?}
    G -->|Yes| H[Retrieve requestId]
    G -->|No| I[Proceed without requestId]
    H --> J[Combine formatters]
    I --> J
    J -->|ENV = development| K[Formatted Colorized Text]
    J -->|ENV = production| L[Structured JSON Log]
    K --> M[Stdout / Stderr Streams]
    L --> M
```

### Context Isolation
Using `AsyncLocalStorage` avoids having to pass a `req` or `requestId` parameter manually across the controller, database service, or helper libraries. Any log statement run within the asynchronous execution path initiated by the middleware automatically outputs the associated request context.

---

## 3. API Request-Response Lifecycle Flow

Below is the end-to-end lifecycle of an HTTP call, illustrating normal response execution, exception recovery, and tracing propagation:

```mermaid
sequenceDiagram
    autonumber
    actor Client
    participant MW as loggingMiddleware (AsyncLocalStorage)
    participant Controller as Product Controller
    participant Service as Product Service
    participant DB as Prisma / PG
    participant ErrMW as errorMiddleware
    participant Log as Winston Logger

    Client->>MW: Inbound Request (e.g. GET /products/1)
    MW->>MW: Generate or Extract requestId
    MW->>MW: Set Response Header X-Request-Id
    MW->>Log: debug: "Inbound HTTP Request..." (with requestId)
    MW->>Controller: next()
    Controller->>Service: getProductById(1)
    Service->>DB: prisma.product.findUnique()
    
    alt Product Found (Success Case)
        DB-->>Service: Product Record
        Service-->>Controller: Product Record
        Controller-->>MW: res.status(200).json(...)
    else Product Not Found (Operational Error)
        DB-->>Service: null
        Service-->>Controller: Throw NotFoundError("Product with ID 1 not found")
        Controller-->>ErrMW: next(error)
        ErrMW->>Log: warn: "API Error 404: GET /products/1 - Product with ID 1 not found" (with requestId)
        ErrMW-->>MW: res.status(404).json(...)
    end

    MW-->>Client: Outbound Response (containing X-Request-Id)
    MW->>Log: info: "Outbound HTTP Response: GET /products/1 - Status: ... (duration)" (with requestId)
```
