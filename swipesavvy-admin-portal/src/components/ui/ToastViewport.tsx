import { useToastStore } from '@/store/toastStore'
import Toast from './Toast'

export default function ToastViewport() {
  const toasts = useToastStore((s) => s.toasts)
  const remove = useToastStore((s) => s.remove)

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-full max-w-[420px] flex-col gap-3">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onClose={() => remove(t.id)} />
      ))}
    </div>
  )
}
