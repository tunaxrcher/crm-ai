import type { Metadata } from 'next'
import { Kanit } from 'next/font/google'

import { ErrorProvider } from '@src/components/shared/ErrorProvider'
import { ToastProvider } from '@src/components/shared/SimpleToast'
import { NotificationProvider } from '@src/components/ui/notification-system'
import { CharacterProvider } from '@src/contexts/CharacterContext'
import { AuthProvider } from '@src/providers/AuthProvider'
import ReactQueryProvider from '@src/providers/ReactQueryProvider'

import ClientBody from './ClientBody'
import { DevAutoLogin } from './DevAutoLogin'
import './globals.css'

const kanit = Kanit({
  variable: '--font-kanit',
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin', 'thai'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'เอไอ & CRM',
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
        <ToastProvider>
          <ReactQueryProvider>
            <ErrorProvider>
              <NotificationProvider>
                <CharacterProvider>
                  <ClientBody>{children}</ClientBody>
                </CharacterProvider>
              </NotificationProvider>
            </ErrorProvider>
          </ReactQueryProvider>
        </ToastProvider>
      </body>
    </html>
  )
}
