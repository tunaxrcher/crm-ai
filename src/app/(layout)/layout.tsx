import { ReactNode } from 'react'

import type { Metadata } from 'next'
import { Kanit } from 'next/font/google'

import { ErrorProvider } from '@src/components/shared/ErrorProvider'
import { ToastProvider } from '@src/components/shared/SimpleToast'
import { NotificationProvider } from '@src/components/ui/notification-system'
import { CharacterProvider } from '@src/contexts/CharacterContext'
import { AuthProvider } from '@src/providers/AuthProvider'
import ReactQueryProvider from '@src/providers/ReactQueryProvider'

import ClientBody from './ClientBody'
import './globals.css'

interface DefaultLayoutProps {
  children: ReactNode
}

export default function Layout({ children }: DefaultLayoutProps) {
  return (
    <AuthProvider>
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
    </AuthProvider>
  )
}
