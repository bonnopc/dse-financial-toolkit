# DSE Scraper

Node.js web scraper for collecting Dhaka Stock Exchange (DSE) financial data.

## Features

- 🕷️ **Web Scraping**: Automated data collection from DSE websites
- 📊 **Data Processing**: Clean and structure financial information
- 💾 **JSON Export**: Generate structured data files for analysis
- ⚡ **Concurrent Processing**: Efficient scraping with rate limiting
- 🔄 **Error Handling**: Robust error recovery and retry mechanisms

## Prerequisites

- Node.js 20.18.0+
- Bun (latest version)

## Installation

```bash
bun install
```

## Usage

### Development Mode

```bash
bun run dev
```

### Production

```bash
# Build TypeScript
bun run build

# Run compiled version
bun run start

# Direct scraping
bun run scrape
```

## Scripts

- `bun run dev` - Run in development mode with tsx
- `bun run build` - Compile TypeScript to JavaScript
- `bun run start` - Run compiled JavaScript
- `bun run scrape` - Execute scraping process

## Data Output

The scraper generates `dividends.json` with comprehensive company data:

```json
{
  "companyCode": "EXAMPLE",
  "companyName": "Example Company Limited",
  "sector": "Bank",
  "dividends": [...],
  "metadata": {...},
  "priceInfo": {...},
  "financialPerformance": [...]
}
```

## Configuration

Configure scraping parameters in `src/scraper.ts`:

- Rate limiting settings
- Target URLs and selectors
- Data processing rules
- Output formatting

## Dependencies

- **axios**: HTTP client for web requests
- **cheerio**: Server-side HTML parsing
- **p-limit**: Concurrency control
- **graphql/apollo-server**: API capabilities (optional)

## Development

The scraper is built with TypeScript and follows these principles:

- Type-safe data structures
- Error-first callback patterns
- Modular scraper functions
- Concurrent processing with limits

## Contributing

1. Add new scrapers in `src/scrapers/`
2. Update type definitions in `src/types/`
3. Test with development data first
4. Ensure proper error handling

## License

MIT License - see root LICENSE file.
