'use client'

import { useState } from 'react'

import Image, { ImageProps } from 'next/image'

interface ImageWithFallbackProps extends ImageProps {
  fallbackSrc?: string
}

export default function ImageWithFallback({
  fallbackSrc = '/placeholder-image.png',
  src,
  alt,
  ...props
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState<string>(src as string)

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      onError={() => {
        setImgSrc(fallbackSrc)
      }}
    />
  )
}
