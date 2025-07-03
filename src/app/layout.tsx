import type { Metadata } from 'next'
import { Kanit } from 'next/font/google'

import { AuthProvider } from '@src/providers/AuthProvider'
import ReactQueryProvider from '@src/providers/ReactQueryProvider'

import './globals.css'

const kanit = Kanit({
  variable: '--font-kanit',
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin', 'thai'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'KPI & AI',
  description: 'ระบบ KPI และ AI สำหรับองค์กร',
  manifest: '/manifest.json',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  themeColor: '#000000',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'KPI & AI',
  },
  icons: {
    icon: [
      { url: '/auto-import-evx-logo.png?v=1.0.0' },
      { url: '/icon-192x192.png?v=1.0.0', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png?v=1.0.0', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/auto-import-evx-logo.png?v=1.0.0' },
      {
        url: '/apple-touch-icon.png?v=1.0.0',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="th" className={`${kanit.variable} dark`}>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="KPI & AI" />
        <link rel="apple-touch-icon" href="/auto-import-evx-logo.png?v=1.0.0" />
        <link rel="manifest" href="/manifest.json?v=1.0.0" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning className="antialiased">
        <AuthProvider>
          <ReactQueryProvider>{children}</ReactQueryProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
