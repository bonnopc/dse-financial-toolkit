# DSE Financial Toolkit

A comprehensive financial toolkit for Dhaka Stock Exchange (DSE) analysis featuring automated data scraping, dividend tracking, financial health scoring, and interactive dashboards.

## 🏗️ Project Structure

This is a monorepo containing three main applications:

```
dse-financial-toolkit/
├── dse-scraper/              # Node.js web scraper
│   ├── src/
│   │   ├── scraper.ts        # Main scraper logic
│   │   ├── scrapers/         # Individual scrapers
│   │   └── types/            # TypeScript interfaces
│   ├── package.json
│   └── tsconfig.json
├── dse-api/                  # NestJS REST API
│   ├── src/
│   │   ├── companies/        # Companies module
│   │   ├── dividends/        # Dividends module
│   │   ├── database/         # Database configuration
│   │   └── types/            # TypeScript interfaces
│   ├── package.json
│   └── tsconfig.json
├── nextjs-dividend-viewer/   # Next.js web application
│   ├── src/
│   │   ├── app/              # App router pages
│   │   ├── components/       # React components
│   │   ├── types/            # TypeScript interfaces
│   │   └── utils/            # Utility functions
│   ├── package.json
│   └── next.config.js
└── package.json              # Root package.json
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20.18.0+
- Bun (latest version)

### Installation

1. **Clone the repository:**

   ```bash
   git clone <your-repo-url>
   cd dse-financial-toolkit
   ```

2. **Install all dependencies:**
   ```bash
   bun run install:all
   ```

### Running Applications

#### **Data Scraper (Node.js)**

```bash
# Development mode
bun run scraper:dev

# Production build
bun run scraper:build
bun run scraper:start

# Run scraping
bun run scraper:scrape
```

#### **DSE API (NestJS)**

```bash
# Development mode
bun run api:dev

# Production build
bun run api:build
bun run api:start

# Run tests
bun run api:test
bun run api:test:e2e
```

#### **Next.js Web App**

```bash
# Development mode
bun run nextjs:dev

# Production build
bun run nextjs:build
bun run nextjs:start
```

### Build All Projects

```bash
bun run build:all
```

### Test All Projects

```bash
bun run test:all
```

## 📊 Applications Overview

### 1. **DSE Scraper** (`/dse-scraper`)

- **Technology**: Node.js + TypeScript + Bun
- **Purpose**: Automated web scraping of DSE data
- **Features**:
  - Company dividend history scraping
  - Financial data extraction
  - Price information collection

### 2. **DSE API** (`/dse-api`)

- **Technology**: NestJS + PostgreSQL + Kysely + TypeScript
- **Purpose**: RESTful API for financial data management
- **Features**:
  - Companies management with CRUD operations
  - Dividend tracking and analytics
  - Financial health scoring algorithms
  - Auto-generated Swagger documentation
  - Type-safe database queries with Kysely

### 3. **DSE Dividend Viewer** (`/nextjs-dividend-viewer`)

- **Technology**: Next.js 14 + TypeScript + CSS3
- **Purpose**: Interactive web dashboard for dividend analysis
- **Features**:
  - Real-time dividend data visualization
  - Advanced filtering and search capabilities
  - 8-component financial health scoring system
  - Responsive design for all devices
  - Comprehensive dividend history tooltips

## 🧮 Financial Scoring Algorithm

The application uses a sophisticated **8-component scoring system** optimized for DSE market conditions:

- **Financial Performance** (25% weight) - EPS consistency & growth
- **Dividend Consistency** (15% weight) - Payment reliability & trends
- **Debt Management** (10% weight) - Debt-to-capital ratios
- **Reserve Strength** (10% weight) - Financial buffer assessment
- **Dividend Yield** (10% weight) - Actual market-based yields
- **Price Valuation** (10% weight) - Position in 52-week range
- **PE Ratio** (10% weight) - Earnings-based valuation
- **Shareholding Quality** (10% weight) - Ownership structure analysis

**Grading System**: A (85-100), B (70-84), C (55-69), D (40-54), F (<40)

## 🛠️ Development

### Adding New Features

Each application can be developed independently:

```bash
# Work on scraper
cd dse-scraper
bun run dev

# Work on API
cd dse-api
bun run start:dev

# Work on Next.js app
cd nextjs-dividend-viewer
bun run dev
```

### Data Flow

1. **Scraper** collects data from DSE websites
2. **API** stores and manages data in PostgreSQL database
3. **Next.js App** consumes API data for visualization
4. **Users** interact with real-time financial insights

## 📈 Data Sources

The scraper collects comprehensive DSE data including:

- Company metadata (sector, capital structure)
- Historical dividend payments (cash and stock)
- Financial information (loans, reserves, EPS)
- Current trading prices and 52-week ranges
- Shareholding patterns and ownership structure

## 🔧 Technology Stack

| Component           | Technologies                                 |
| ------------------- | -------------------------------------------- |
| **Scraper**         | Node.js, TypeScript, Cheerio, Axios, Bun     |
| **API**             | NestJS, PostgreSQL, Kysely, TypeScript, Bun  |
| **Next.js App**     | Next.js 14, TypeScript, React, CSS3, Bun     |
| **Data Processing** | Custom algorithms, Financial scoring         |
| **Development**     | ESLint, Jest, Prettier, TypeScript, Git, Bun |

## 🚀 Deployment

### API

- **Database**: PostgreSQL on cloud providers (AWS RDS, Railway, etc.)
- **API Hosting**: Node.js hosting (Vercel, Railway, AWS)
- **Environment**: Configure database URLs and API keys

### Next.js App

- **Vercel**: `cd nextjs-dividend-viewer && vercel`
- **Netlify**: Build command: `bun run nextjs:build`
- **Docker**: Use Next.js Docker configuration
- **Static Export**: Can be deployed to any static hosting

### Scraper

- **VPS/Cloud**: Node.js hosting
- **Cron Jobs**: Schedule regular scraping
- **GitHub Actions**: Automated data updates

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Make changes in the relevant application folder
4. Test your changes locally
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙋‍♂️ Support

For questions and support:

- Create an issue in this repository
- Check individual application READMEs for specific documentation
- Review the financial scoring algorithm documentation

---

**Made with ❤️ for the Bangladesh financial community**
