# DSE Dividend Viewer - Next.js

A modern web application for viewing and analyzing Dhaka Stock Exchange (DSE) dividend data with comprehensive financial health scoring.

## Features

- 📊 **Interactive Data Table**: Browse dividend data for DSE companies with sortable columns
- 🔍 **Advanced Filtering**: Filter by sector and search by company name
- 💰 **Comprehensive Financial Health Scoring**: 8-component scoring system based on:
  - Financial Performance - EPS consistency & growth (25% weight)
  - Dividend Consistency - payment reliability & trends (15% weight)
  - Debt Management - debt-to-capital ratios (10% weight)
  - Reserve Strength - financial buffer assessment (10% weight)
  - Dividend Yield - actual market-based yields (10% weight)
  - Price Valuation - position in 52-week range (10% weight)
  - PE Ratio - earnings-based valuation (10% weight)
  - Shareholding Quality - ownership structure analysis (10% weight)
- 📈 **Dividend History Tooltips**: Detailed year-by-year dividend breakdown
- 💲 **Real Market Data Integration**: Last trading prices with live dividend yield calculations
- 📱 **Responsive Design**: Optimized for desktop and mobile devices
- ⚡ **Fast Performance**: Built with Next.js for optimal loading speeds

## Technology Stack

- **Frontend**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: CSS3 with responsive design
- **Data Processing**: Client-side JSON processing with financial scoring algorithms

## Getting Started

### Prerequisites

- Node.js 20.18.0+
- Bun

### Installation

1. Clone the repository:

   ```bash
   git clone <your-repo-url>
   cd nextjs-dividend-viewer
   ```

2. Install dependencies:

   ```bash
   bun install
   ```

3. Start the development server:

   ```bash
   bun run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Available Scripts

- `bun run dev` - Start development server
- `bun run build` - Create production build
- `bun run start` - Start production server
- `bun run lint` - Run ESLint

## Financial Scoring Algorithm

The application uses a sophisticated **8-component scoring system** optimized for DSE market conditions:

### 1. Debt Score (10% weight)

Evaluates debt management relative to paid-up capital:

- **Excellent (100pts)**: Debt-to-capital ratio ≤ 20%
- **Good (80pts)**: Debt-to-capital ratio ≤ 50%
- **Average (60pts)**: Debt-to-capital ratio ≤ 100%
- **Poor (40pts)**: Debt-to-capital ratio ≤ 200%
- **Very Poor (20pts)**: Debt-to-capital ratio > 200%

### 2. Reserve Score (10% weight)

Assesses financial reserves relative to paid-up capital:

- **Excellent (100pts)**: Reserve-to-capital ratio ≥ 200%
- **Good (80pts)**: Reserve-to-capital ratio ≥ 100%
- **Average (60pts)**: Reserve-to-capital ratio ≥ 50%
- **Poor (40pts)**: Reserve-to-capital ratio ≥ 0%
- **Very Poor (20pts)**: Negative reserves

### 3. Dividend Consistency Score (15% weight)

**Highest weighted dividend component** - combines three factors:

- **Payment Frequency (40%)**: Percentage of years with dividends
- **Payment Stability (30%)**: Consistency of dividend amounts over time
- **Recent Trend (30%)**: Whether dividends are improving, stable, or declining
- **Bonus**: 10% boost for 4+ consecutive years of dividend payments

### 4. Dividend Yield Score (10% weight)

Based on **actual market price dividend yield** calculation:

- **Excellent (100pts)**: ≥8% dividend yield
- **Good (80pts)**: 5-8% dividend yield
- **Average (60pts)**: 3-5% dividend yield
- **Poor (40pts)**: 1-3% dividend yield
- **Very Poor (20pts)**: <1% dividend yield
- **No Yield (0pts)**: No cash dividends

### 5. Price Valuation Score (10% weight)

Evaluates current price position within 52-week trading range:

- **Excellent (100pts)**: ≤25% of 52-week range (near low - buying opportunity)
- **Good (80pts)**: 25-40% of range (below average - good value)
- **Average (60pts)**: 40-60% of range (fair value)
- **Poor (40pts)**: 60-75% of range (above average)
- **Very Poor (20pts)**: >75% of range (near high - potentially overvalued)

### 6. Financial Performance Score (25% weight)

**Highest weighted component** - based on Earnings Per Share (EPS):

- **Consistency (60%)**: Percentage of years with positive EPS
- **Growth Trend (40%)**: Recent 3-year vs older 3-year EPS comparison
  - Strong growth (>20% improvement): 100pts
  - Good growth (10-20% improvement): 80pts
  - Stable (±10%): 60pts
  - Declining (10-30% decline): 40pts
  - Significant decline (>30%): 20pts

### 7. Shareholding Quality Score (10% weight)

Evaluates ownership structure (higher institutional/sponsor ownership is better):

- **Sponsor/Director Holdings (40% of score)**: Optimal 50%+, diminishing returns above 75%
- **Institutional Holdings (35% of score)**: Excellent 50%+, good 30%+, average 15%+
- **Foreign Holdings (25% of score)**: Excellent 30%+, good 20%+, average 10%+

### 8. PE Ratio Score (10% weight)

Reasonable PE ratios indicate fair valuation:

- **Excellent (100pts)**: PE ≤ 8
- **Very Good (90pts)**: PE ≤ 12
- **Good (80pts)**: PE ≤ 15
- **Fair (70pts)**: PE ≤ 18
- **Average (60pts)**: PE ≤ 22
- **Poor (40pts)**: PE ≤ 28
- **Very Poor (20pts)**: PE ≤ 35
- **Overvalued (10pts)**: PE > 35

### Overall Grading System

- **Grade A (85-100pts)**: 🟢 Excellent investment quality
- **Grade B (70-84pts)**: 🟡 Good investment quality
- **Grade C (55-69pts)**: 🟠 Average investment quality
- **Grade D (40-54pts)**: 🔴 Poor investment quality
- **Grade F (<40pts)**: ⚪ Very poor investment quality

### Cash vs Stock Dividend Weighting

- **Cash dividends**: Full weight (100%)
- **Stock dividends**: Reduced weight (30%)

This prioritizes companies that provide actual cash returns to shareholders.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout component
│   ├── page.tsx            # Home page component
│   └── globals.css         # Global styles
├── components/
│   ├── common/
│   │   ├── InputLabel.tsx  # Reusable input label component
│   │   └── InputLabel.css  # Input label styles
│   ├── DividendTable/
│   │   ├── DividendTable.tsx  # Main data table component
│   │   └── DividendTable.css  # Table styles
│   ├── SectorFilter/
│   │   ├── SectorFilter.tsx   # Sector filtering component
│   │   └── SectorFilter.css   # Filter styles
│   ├── SearchBar/
│   │   ├── SearchBar.tsx      # Search functionality
│   │   └── SearchBar.css      # Search styles
│   ├── FinancialScoreCell/
│   │   ├── FinancialScoreCell.tsx # Financial health score display
│   │   └── FinancialScoreCell.css # Score cell styles
│   ├── DividendHistoryTooltip/
│   │   ├── DividendHistoryTooltip.tsx # Dividend history popup
│   │   └── DividendHistoryTooltip.css # Tooltip styles
│   ├── LoadingSpinner/
│   │   ├── LoadingSpinner.tsx  # Loading indicator
│   │   └── LoadingSpinner.css  # Spinner styles
│   └── SmartTooltip/
│       ├── SmartTooltip.tsx    # Smart positioning tooltip
│       └── SmartTooltip.css    # Tooltip styles
├── types/
│   └── Company.ts          # TypeScript interfaces
├── utils/
│   └── financialScoring.ts # Financial health algorithm
└── data/
    └── dividends.json      # DSE company data
```

## Data Source

The application processes data for DSE companies including:

- Company metadata (sector, capital structure)
- Historical dividend payments (cash and stock)
- Financial information (loans, reserves)
- Share count and capital information

## API Ready Architecture

This Next.js application is designed to easily integrate backend APIs:

- **API Routes**: Use `src/app/api/` directory for backend endpoints
- **Server Components**: Fetch data on the server for better performance
- **Database Integration**: Add databases like PostgreSQL, MongoDB, or MySQL
- **Authentication**: Integrate NextAuth.js or custom auth solutions
- **Caching**: Built-in Next.js caching for optimal performance

## Future Enhancements

- [ ] Real-time data integration via APIs
- [ ] User authentication and portfolios
- [ ] Data export functionality (CSV, PDF)
- [ ] Advanced charting and visualizations
- [ ] Email alerts for dividend announcements
- [ ] Company comparison tools

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
