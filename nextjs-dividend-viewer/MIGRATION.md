# Migration Guide: Create React App to Next.js

This document outlines the migration process from your Create React App to Next.js and the benefits gained.

## What Changed

### Project Structure

```diff
- src/
-   ├── App.tsx              # Main app component
-   ├── index.tsx            # React DOM render
-   ├── App.css              # App styles
-   └── index.css            # Global styles

+ src/
+   ├── app/
+   │   ├── layout.tsx       # Root layout (replaces index.tsx)
+   │   ├── page.tsx         # Home page (replaces App.tsx)
+   │   ├── globals.css      # Global styles (combines App.css + index.css)
+   │   └── api/             # Backend API routes (NEW!)
+   ├── components/          # Same structure, updated imports
+   ├── types/               # Same structure
+   ├── utils/               # Same structure
+   └── data/                # JSON data moved here
```

### Key Benefits Gained

#### 1. **Backend API Integration** ✨

- **Before**: Client-side only, no backend capabilities
- **After**: Built-in API routes at `/api/*` endpoints
- **Example**: `GET /api/companies?sector=Bank&limit=5`

#### 2. **Better Performance** 🚀

- **Before**: Client-side rendering only
- **After**: Server-side rendering, static generation, and optimized loading
- **Result**: Faster initial page loads and better SEO

#### 3. **Modern Development** 🔧

- **Before**: Create React App (deprecated)
- **After**: Next.js 14 with App Router (latest React patterns)
- **Benefits**: Better developer experience, automatic optimizations

#### 4. **File-based Routing** 📁

- **Before**: Manual routing setup required
- **After**: Automatic routing based on file structure
- **Example**: `src/app/about/page.tsx` → `/about` route

### Import Path Changes

All relative imports were updated to use the `@/` alias:

```diff
- import { Company } from '../types/Company';
- import { calculateFinancialScore } from '../utils/financialScoring';
+ import { Company } from '@/types/Company';
+ import { calculateFinancialScore } from '@/utils/financialScoring';
```

### Component Updates

#### App Component → Page Component

```diff
- // src/App.tsx
- function App() {
-   return <div>...</div>;
- }
- export default App;

+ // src/app/page.tsx
+ 'use client'  // Required for client-side state
+ export default function Home() {
+   return <div>...</div>;
+ }
```

#### Layout Component (NEW)

```tsx
// src/app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

## API Routes Added

### 1. Get All Companies

```
GET /api/companies
Query Parameters:
- sector: Filter by sector (optional)
- limit: Limit number of results (optional)
```

### 2. Get Specific Company

```
GET /api/companies/[companyCode]
Path Parameter:
- companyCode: Company code (e.g., "SQURPHARMA")
```

## Running Both Projects

### Old React App

```bash
cd react-dividend-viewer
npm start                    # Runs on http://localhost:3000
```

### New Next.js App

```bash
cd nextjs-dividend-viewer
npm run dev                  # Runs on http://localhost:3000
npm run build               # Create production build
npm run start               # Run production server
```

## Features Preserved

✅ All existing functionality maintained:

- Financial health scoring algorithm
- Dividend history tooltips
- Sector filtering and search
- Responsive design
- Sortable table columns
- Cash vs stock dividend weighting

✅ All styling and CSS preserved
✅ TypeScript support maintained
✅ All data and calculations identical

## Next Steps for Backend Integration

### 1. Database Integration

```typescript
// Example: Connect to PostgreSQL
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET() {
  const result = await pool.query("SELECT * FROM companies");
  return NextResponse.json(result.rows);
}
```

### 2. Real-time Data Updates

```typescript
// Example: Fetch live DSE data
export async function GET() {
  const response = await fetch("https://dse-api.com/companies");
  const liveData = await response.json();
  return NextResponse.json(liveData);
}
```

### 3. Authentication

```typescript
// Example: Add user authentication
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    // Add auth providers
  ],
};
```

### 4. Caching Strategy

```typescript
// Example: Cache API responses
export async function GET() {
  const data = await getCompanies();

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, max-age=3600", // Cache for 1 hour
    },
  });
}
```

## Migration Complete! 🎉

Your application is now running on Next.js with:

- ✅ Modern architecture
- ✅ Backend API capabilities
- ✅ Better performance
- ✅ All original features preserved
- ✅ Ready for future enhancements
