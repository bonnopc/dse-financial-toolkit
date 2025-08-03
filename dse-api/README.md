# DSE API

A RESTful API for Dhaka Stock Exchange financial data built with Nest.js, Kysely, and PostgreSQL.

## Features

- 🏢 **Companies Management**: Create, read, and manage company data
- 💰 **Dividend Tracking**: Historical dividend data and analytics
- 📊 **Financial Performance**: Company financial metrics and ratios
- 🔍 **Smart Filtering**: Filter by sector, performance metrics, etc.
- 📚 **API Documentation**: Auto-generated Swagger documentation
- 🚀 **High Performance**: Built with Kysely for optimal database queries

## Tech Stack

- **Framework**: Nest.js
- **Database**: PostgreSQL
- **Query Builder**: Kysely (Type-safe SQL)
- **Package Manager**: Bun
- **Documentation**: Swagger/OpenAPI
- **Validation**: class-validator & class-transformer

## Prerequisites

- Node.js 20.18.0+
- Bun package manager
- PostgreSQL 14+

## Setup Instructions

### 1. Install Dependencies

```bash
cd dse-api
bun install
```

### 2. Database Setup

First, create a PostgreSQL database:

```sql
CREATE DATABASE dse_financial_db;
CREATE USER your_username WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE dse_financial_db TO your_username;
```

### 3. Environment Configuration

Copy the environment example file:

```bash
cp .env.example .env
```

Update `.env` with your database credentials:

```env
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL=postgresql://your_username:your_password@localhost:5432/dse_financial_db
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_NAME=dse_financial_db

# API Configuration
API_PREFIX=api/v1
CORS_ORIGIN=http://localhost:3000
```

### 4. Run Database Migrations

```bash
bun run db:migrate
```

### 5. Start the Development Server

```bash
bun run start:dev
```

The API will be available at:

- **API**: `http://localhost:3001/api/v1`
- **Swagger Docs**: `http://localhost:3001/docs`

## API Endpoints

### Companies

- `GET /api/v1/companies` - Get all companies (with pagination and filtering)
- `GET /api/v1/companies/:code` - Get company by trading code
- `POST /api/v1/companies` - Create new company
- `GET /api/v1/companies/sectors` - Get all sectors

### Dividends

- `GET /api/v1/dividends/company/:code` - Get dividends for a company
- `GET /api/v1/dividends/top-payers` - Get top dividend paying companies
- `GET /api/v1/dividends/stats` - Get dividend statistics
- `GET /api/v1/dividends/trends` - Get dividend trends over years

## Database Schema

The API uses the following main tables:

- `companies` - Company basic information
- `dividends` - Historical dividend data
- `company_loans` - Company loan information
- `company_reserves` - Reserve and income data
- `company_metadata` - Capital and share information
- `financial_performance` - Annual financial metrics
- `price_info` - Current trading information

## Development Commands

```bash
# Development
bun run start:dev          # Start with hot reload
bun run start:debug        # Start with debug mode

# Building
bun run build              # Build for production
bun run start:prod         # Start production build

# Database
bun run db:migrate         # Run migrations
bun run db:seed           # Seed sample data

# Testing
bun run test              # Run unit tests
bun run test:watch        # Run tests in watch mode
bun run test:e2e          # Run end-to-end tests

# Code Quality
bun run lint              # Run ESLint
bun run format            # Format code with Prettier
```

## Next Steps

1. **Install dependencies**: `bun install`
2. **Setup PostgreSQL** and update `.env`
3. **Run migrations**: `bun run db:migrate`
4. **Start development**: `bun run start:dev`
5. **Visit Swagger docs**: `http://localhost:3001/docs`

## Integration with Scraper

Once the API is running, update your scraper to send data to the API instead of writing to JSON files. The scraper should POST to `/api/v1/companies` with the scraped company data.

## Production Deployment

For production deployment:

1. Use environment variables for all configuration
2. Enable SSL/TLS for database connections
3. Set up proper logging and monitoring
4. Consider using a connection pooler like PgBouncer
5. Deploy to cloud services like Railway, Render, or AWS

## Documentation

- Visit `/docs` endpoint for interactive Swagger documentation
- All endpoints are fully documented with request/response schemas
- Examples included for all API operations

# TypeScript version fix
