import { create } from 'zustand'
import { randomId } from '@/utils/misc'

export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

export interface ToastItem {
  id: string
  title?: string
  message: string
  variant: ToastVariant
  durationMs?: number
}

interface ToastState {
  toasts: ToastItem[]
  push: (toast: Omit<ToastItem, 'id'> & { id?: string } & { durationMs?: number }) => void
  remove: (id: string) => void
  clear: () => void
}

export const useToastStore = create<ToastState>()((set, get) => ({
  toasts: [],
  push: (toast) => {
    const id = toast.id ?? randomId('toast')
    const item: ToastItem = {
      id,
      title: toast.title,
      message: toast.message,
      variant: toast.variant ?? 'info',
      durationMs: toast.durationMs ?? 3500,
    }

    set({ toasts: [item, ...get().toasts].slice(0, 5) })

    window.setTimeout(() => {
      get().remove(id)
    }, item.durationMs)
  },
  remove: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
  clear: () => set({ toasts: [] }),
}))
