export function safeJsonParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

export function storageGet<T>(key: string, fallback: T): T {
  return safeJsonParse<T>(localStorage.getItem(key), fallback)
}

export function storageSet<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function storageRemove(key: string) {
  localStorage.removeItem(key)
}
