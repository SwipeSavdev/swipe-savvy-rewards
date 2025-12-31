import { useEffect, type RefObject } from 'react'

export function useOutsideClick(ref: RefObject<HTMLElement>, onOutside: () => void, enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return

    const handler = (event: MouseEvent) => {
      const el = ref.current
      if (!el) return
      if (event.target instanceof Node && !el.contains(event.target)) {
        onOutside()
      }
    }

    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [ref, onOutside, enabled])
}
