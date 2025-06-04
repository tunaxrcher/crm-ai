import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Handle image loading errors by providing a fallback
 */
export function handleImageError(
  event: React.SyntheticEvent<HTMLImageElement, Event>,
  fallbackSrc: string = '/placeholder-image.png'
) {
  const img = event.target as HTMLImageElement
  if (img.src !== fallbackSrc) {
    console.warn(`Image failed to load: ${img.src}, using fallback`)
    img.src = fallbackSrc
  }
}

export function getStoragePublicUrl(): string {
  const bucket = process.env.DO_SPACES_BUCKET || ''
  const region = process.env.DO_SPACES_REGION || 'sgp1'

  return `https://${bucket}.${region}.digitaloceanspaces.com`
}
