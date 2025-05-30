import { ReactNode } from 'react'

import { ErrorProvider } from '@src/components/shared/ErrorProvider'
import { ToastProvider } from '@src/components/shared/SimpleToast'
import { NotificationProvider } from '@src/components/ui/notification-system'
import ReactQueryProvider from '@src/providers/ReactQueryProvider'

interface DefaultLayoutProps {
  children: ReactNode
}

export default function Layout({ children }: DefaultLayoutProps) {
  return (
    <ToastProvider>
      <ReactQueryProvider>
        <ErrorProvider>
          <NotificationProvider>{children}</NotificationProvider>
        </ErrorProvider>
      </ReactQueryProvider>
    </ToastProvider>
  )
}
