export function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

/**
 * Password requirements (enterprise-friendly default):
 * - 8+ chars
 * - at least one uppercase, one lowercase, one number
 */
export function isStrongPassword(value: string) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(value)
}

export function isPhone(value: string) {
  // Loose E.164-ish: +country and digits, allowing separators.
  return /^\+?[0-9\s\-().]{7,}$/.test(value.trim())
}

export function isUrl(value: string) {
  try {
     
    new URL(value)
    return true
  } catch {
    return false
  }
}
