'use client'

import Image from 'next/image'

export function Preloader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="w-64 h-auto mb-8">
          <Image
            src="/auto-import-evx-logo.png"
            alt="Auto Import EV Logo"
            width={320}
            height={120}
            priority
          />
        </div>
      </div>
    </div>
  )
}
