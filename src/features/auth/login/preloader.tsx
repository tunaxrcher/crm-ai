'use client'

import Image from 'next/image'

import { LOGO_ALT, LOGO_PATH } from '@src/lib/logo'

export function Preloader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="w-64 h-auto mb-8">
          <Image
            src={LOGO_PATH}
            alt={LOGO_ALT}
            width={320}
            height={120}
            priority
          />
        </div>
      </div>
    </div>
  )
}
