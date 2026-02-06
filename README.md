# Lab 2 — Multi-Service Docker Development Environment

This lab demonstrates how to build a complete development environment with **multi-stage Docker builds**, **live code reloading**, and **Docker Compose orchestration** for a Node.js application with database and cache services.

## Objectives
- Create a multi-stage Dockerfile for Node.js 24 with optimized image size
- Write docker-compose.yml with app, database, and cache services
- Set up volumes for live code reloading and data persistence
- Enable hot reload with nodemon for seamless development
- Test services and verify setup
- Access and interact with database and cache

---

# Step 1 — Create a Multi-Stage Dockerfile

Build an optimized Docker image for Node.js 24 application.

## Steps

### 1. Create Dockerfile with two stages
```dockerfile
FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

FROM node:24-alpine

WORKDIR /app

COPY --from=builder /app .

EXPOSE 3000

CMD ["npm", "start"]
```

### 2. What does multi-stage do?
- **Builder Stage**: Installs dependencies and builds
- **Production Stage**: Fresh image with only runtime essentials
- **Result**: Smaller final image (excludes build tools, cache, node_modules leftovers)

---

# Step 2 — Write docker-compose.yml with App, Database & Cache

Create a compose file that orchestrates three services.

## Steps

### 1. Create docker-compose.yml
```yaml
version: "3.8"

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:password@db:5432/postgres
      - REDIS_URL=redis://cache:6379
    volumes:
      - ./src:/app/src
      - ./package.json:/app/package.json
      - ./package-lock.json:/app/package-lock.json
      - node_modules:/app/node_modules
    depends_on:
      - db
      - cache
    command: npx nodemon src/index.js

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_PASSWORD: password
      POSTGRES_DB: postgres
    volumes:
      - db_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  cache:
    image: redis:7-alpine

volumes:
  db_data:
  node_modules:
```

### 2. What does this do?
- **app**: Node.js service building from your Dockerfile
- **db**: PostgreSQL 16 for data persistence
- **cache**: Redis 7 for caching
- **depends_on**: Ensures database starts before app
- **environment**: Connection strings and settings

---

# Step 3 — Set Up Volumes for Development & Data Persistence

Volumes enable live code reloading and protect important data.

## Steps

### 1. Understand the three volume types

**Source Code Mounting** (Live Reload)
```yaml
- ./src:/app/src
- ./package.json:/app/package.json
- ./package-lock.json:/app/package-lock.json
```
- Changes in `src/` instantly reflect in container
- Perfect for active development

**Node Modules Protection** (Named Volume)
```yaml
- node_modules:/app/node_modules
```
- Preserves `node_modules` installed in Docker build
- Prevents local `node_modules` from overwriting container's version
- Named volume appears in `volumes:` section

**Data Persistence** (Database Volume)
```yaml
volumes:
  db_data:
```
- PostgreSQL data survives container restarts
- Defined at top-level `volumes:` section

### 2. Why protect node_modules?
Your machine might have different OS/architecture than Docker container. By using a named volume, you ensure the correct precompiled binaries are used.

---

# Step 4 — Enable Hot Reload with Nodemon

Automatically restart the app when you modify code.

## Steps

### 1. Create nodemon.json
```bash
touch nodemon.json
```

### 2. Add configuration
```json
{
  "watch": ["src"],
  "ext": "js,json",
  "ignore": ["node_modules"],
  "delay": 500,
  "env": {
    "NODE_ENV": "development"
  }
}
```

### 3. Update docker-compose command
```yaml
command: npx nodemon src/index.js
```

### How it works
Nodemon watches the `src/` folder and restarts the app within 500ms when files change.

---

# Step 5 — Test the Setup

Spin up all three services and verify they're running.

## Steps

### 1. Build and start services
```bash
docker-compose up -d --build
```

### 2. Verify all services are running
```bash
docker-compose ps
```

Expected output:
```
NAME                     STATUS
docker-app-1            running
docker-db-1             running
docker-cache-1          running
```

### 3. Check the app
Open browser: `http://localhost:3000`

---

# Step 6 — Make Code Changes & See Live Reload

Test the hot reload in action.

## Steps

### 1. Edit your src/index.js
```bash
nano src/index.js
```

Change something (e.g., response message).

### 2. Save the file

### 3. Observe instant restart
Check logs:
```bash
docker-compose logs -f app
```

You'll see nodemon detect the change and restart within 500ms.

### 4. Refresh your browser
Changes are live!

### No container restart needed! 🎉

---

# Step 7 — Check Logs & Access Services

Verify everything is connected and working.

## Logs
```bash
docker-compose logs -f
```

Stream all service logs in real-time.

---

## Access PostgreSQL
```bash
docker-compose exec db psql -U postgres
```

Inside psql:
```sql
\l              -- List databases
\dt             -- List tables
SELECT * FROM your_table;
```

---

## Access Redis
```bash
docker-compose exec cache redis-cli
```

Inside redis-cli:
```
PING            -- Test connection
GET visits      -- Retrieve cached data
INCR counter    -- Increment counter
```

---

# Method Comparison

| Aspect | Without Compose | With Compose |
|--------|-----------------|--------------|
| Start services | Manual docker run for each | One `docker-compose up` |
| Networking | Configure ports/networks manually | Automatic |
| Volumes | Set up individually | Declarative in YAML |
| Dependencies | Manual sequencing | `depends_on` handles it |
| Development | Manual restart for changes | Hot reload with nodemon |
| Cleanup | Remove containers one by one | One `docker-compose down` |

---

# Useful Commands

```bash
# Start services
docker-compose up -d --build

# Stop services
docker-compose down

# View logs (all services)
docker-compose logs -f

# View logs (specific service)
docker-compose logs -f app

# Access service shell
docker-compose exec app sh

# Restart service
docker-compose restart app

# Remove volumes
docker-compose down -v

# List volumes
docker volume ls

# Execute command in service
docker-compose exec db psql -U postgres -c "SELECT NOW();"
```

---

# Cleanup (Optional)

Stop and remove all containers and networks:

```bash
docker-compose down
```

Remove volumes as well (warning: deletes database data):

```bash
docker-compose down -v
```

Remove the image:

```bash
docker rmi docker-app
```

---

# Key Takeaways

✅ Multi-stage builds reduce image size significantly  
✅ Volume mounts enable fast, iterative development  
✅ Docker Compose simplifies multi-service orchestration  
✅ Named volumes protect important data and dependencies  
✅ Nodemon enables seamless hot reload  
✅ Service names work as hostnames in Docker network  
✅ Dependencies ensure correct startup order  
✅ Live reload requires proper volume mounting strategy
