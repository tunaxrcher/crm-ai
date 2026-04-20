/**
 * Resolves the logo path based on NEXT_PUBLIC_LOGO env variable.
 * Usage: set NEXT_PUBLIC_LOGO=evx in .env for /auto-import-evx-logo.png
 *        set NEXT_PUBLIC_LOGO=shop2 for /auto-import-shop2-logo.png
 *        supports any brand name (shop1..shop10, etc.)
 * Falls back to 'evx' if not set.
 */
const brand = process.env.NEXT_PUBLIC_LOGO || 'evx'

export const LOGO_PATH = `/${brand}-logo.png`
export const LOGO_ALT = `${brand.toUpperCase()} Logo`
