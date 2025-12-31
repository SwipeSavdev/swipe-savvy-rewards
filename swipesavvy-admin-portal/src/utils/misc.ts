export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function randomId(prefix: string = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

export function debounce<T extends (...args: any[]) => void>(fn: T, delayMs: number) {
  let timer: number | undefined
  return (...args: Parameters<T>) => {
    if (timer) window.clearTimeout(timer)
    timer = window.setTimeout(() => fn(...args), delayMs)
  }
}

export async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text)
}
