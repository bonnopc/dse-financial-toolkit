import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DSE Dividend Viewer',
  description: 'View and analyze DSE dividend data with financial health scoring',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
