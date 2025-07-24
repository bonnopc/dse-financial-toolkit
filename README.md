# DSE Financial Toolkit

A comprehensive financial toolkit for Dhaka Stock Exchange (DSE) analysis featuring automated data scraping, dividend tracking, financial health scoring, and interactive dashboards.

## 🏗️ Project Structure

This is a monorepo containing two main applications:

```
dse-financial-toolkit/
├── dse-scraper/ # Node.js web scraper
│ ├── src/
│ │ ├── scraper.ts # Main scraper logic
│ │ ├── scrapers/ # Individual scrapers
│ │ └── types/ # TypeScript interfaces
│ ├── package.json
│ └── tsconfig.json
├── nextjs-dividend-viewer/ # Next.js web application
│ ├── src/
│ │ ├── app/ # App router pages
│ │ ├── components/ # React components
│ │ ├── types/ # TypeScript interfaces
│ │ └── utils/ # Utility functions
│ ├── package.json
│ └── next.config.js
├── dividends.json # Shared data file
└── package.json # Root package.json
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

## �️ Build Commands

Build all projects:

```bash
bun run build:all
```

## �📊 Applications Overview

### 1. **DSE Scraper** (`/dse-scraper`)

- **Technology**: Node.js + TypeScript + Bun
- **Purpose**: Automated web scraping of DSE data
- **Features**:
  - Company dividend history scraping
  - Financial data extraction
  - Price information collection
  - Data processing and JSON export

### 2. **Next.js Dividend Viewer** (`/nextjs-dividend-viewer`)

- **Technology**: Next.js 14 + TypeScript + Bun
- **Purpose**: Modern web application for dividend analysis
- **Features**:
  - 📊 Interactive data tables with sorting
  - 🔍 Advanced filtering by sector and search
  - 💰 8-component financial health scoring system
  - 📈 Dividend history tooltips
  - 📱 Responsive design
  - ⚡ Server-side rendering

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

# Work on Next.js app
cd nextjs-dividend-viewer
bun run dev
```

### Data Flow

1. **Scraper** collects data from DSE websites
2. **Data** is processed and saved to `dividends.json`
3. **Applications** read and analyze the JSON data
4. **Users** interact with visualized financial insights

## 📈 Data Sources

The scraper collects comprehensive DSE data including:

- Company metadata (sector, capital structure)
- Historical dividend payments (cash and stock)
- Financial information (loans, reserves, EPS)
- Current trading prices and 52-week ranges
- Shareholding patterns and ownership structure

## 🔧 Technology Stack

| Component           | Technologies                             |
| ------------------- | ---------------------------------------- |
| **Scraper**         | Node.js, TypeScript, Cheerio, Axios, Bun |
| **Next.js App**     | Next.js 14, TypeScript, React, CSS3, Bun |
| **Data Processing** | JSON, Custom algorithms                  |
| **Development**     | ESLint, TypeScript, Git, Bun             |

## 🚀 Deployment

### Next.js App

- **Vercel**: `cd nextjs-dividend-viewer && vercel`
- **Netlify**: Build command: `bun run nextjs:build`
- **Docker**: Use Next.js Docker configuration
- **Vercel**: Static site deployment
- **GitHub Pages**: Deploy from `build/` folder

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
