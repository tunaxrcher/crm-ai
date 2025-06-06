import type { Metadata } from 'next'
import { Kanit } from 'next/font/google'

import './globals.css'

const kanit = Kanit({
  variable: '--font-kanit',
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin', 'thai'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'KPI & AI',
  description: 'ทดลอง',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="th" className={`${kanit.variable} dark`}>
      <body suppressHydrationWarning className="antialiased">
        {children}
      </body>
    </html>
  )
}
