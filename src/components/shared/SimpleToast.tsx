'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

import { Button } from '@src/components/ui/button'
import { cn } from '@src/lib/utils'
import { AlertTriangle, Check, Info, X } from 'lucide-react'

// Toast notification type
export type ToastType = 'success' | 'error' | 'info' | 'warning'

// Interface for toast data
interface ToastData {
  id: string
  type: ToastType
  title: string
  message: string
  duration?: number
}

// Context for the toast system
interface ToastContextType {
  toasts: ToastData[]
  addToast: (toast: Omit<ToastData, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

// Custom hook to use toast
export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// Simple wrapper function for notifications with same API as old system
export const useSimpleNotification = () => {
  const { addToast } = useToast()

  const addNotification = (notification: {
    type: ToastType
    title: string
    message: string
    duration?: number
  }) => {
    addToast(notification)
  }

  return { addNotification }
}

// The main Toast Provider component
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastData[]>([])

  // Add a new toast
  const addToast = (toast: Omit<ToastData, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast = { ...toast, id }
    setToasts((prev) => [newToast, ...prev])

    // Auto remove toast after duration
    if (toast.duration) {
      setTimeout(() => {
        removeToast(id)
      }, toast.duration)
    }
  }

  // Remove a toast by ID
  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

// Get the appropriate color for each toast type
const getToastColor = (type: ToastType) => {
  switch (type) {
    case 'success':
      return 'bg-green-500/20 border-green-500/50 text-green-500'
    case 'error':
      return 'bg-red-500/20 border-red-500/50 text-red-500'
    case 'warning':
      return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-500'
    case 'info':
      return 'bg-blue-500/20 border-blue-500/50 text-blue-500'
    default:
      return 'bg-secondary/20 border-secondary/50'
  }
}

// Get the appropriate icon for each toast type
const getToastIcon = (type: ToastType) => {
  switch (type) {
    case 'success':
      return <Check className="h-5 w-5" />
    case 'error':
      return <X className="h-5 w-5" />
    case 'warning':
      return <AlertTriangle className="h-5 w-5" />
    case 'info':
      return <Info className="h-5 w-5" />
    default:
      return <Info className="h-5 w-5" />
  }
}

// Container component for all toasts
const ToastContainer: React.FC<{
  toasts: ToastData[]
  removeToast: (id: string) => void
}> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col-reverse gap-2 w-80">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'pointer-events-auto relative rounded-lg border p-4 shadow-md transition-all duration-300 ease-in-out',
            getToastColor(toast.type)
          )}
          style={{
            animation: 'slideInFromBottom 0.3s forwards',
          }}>
          <div className="flex items-start gap-3">
            <div className="mt-0.5">{getToastIcon(toast.type)}</div>
            <div className="flex-1">
              <h4 className="font-medium">{toast.title}</h4>
              <p className="text-sm mt-1">{toast.message}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full"
              onClick={() => removeToast(toast.id)}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ))}
      <style jsx global>{`
        @keyframes slideInFromBottom {
          from {
            opacity: 0;
            transform: translateY(30px) translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0) translateX(0);
          }
        }
      `}</style>
    </div>
  )
}
