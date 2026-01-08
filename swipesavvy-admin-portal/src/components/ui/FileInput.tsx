import { useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { cn } from '@/utils/cn'
import Button from './Button'
import Icon from './Icon'

export interface FileInputProps {
  label?: string
  hint?: string
  error?: string
  accept?: string
  onFileSelected?: (_file: File | null) => void
}

export default function FileInput({ label, hint, error, accept, onFileSelected }: FileInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const setSelected = (f: File | null) => {
    setFile(f)
    onFileSelected?.(f)
  }

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null
    setSelected(f)
  }

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const f = e.dataTransfer.files?.[0] ?? null
    setSelected(f)
  }

  return (
    <div className="w-full">
      {label ? <p className="mb-1 text-sm font-medium text-[var(--ss-text)]">{label}</p> : null}

      <div
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={cn(
          'rounded-lg border border-dashed p-4 transition-colors',
          error ? 'border-[var(--ss-danger)]' : 'border-[var(--ss-border)]',
          isDragging ? 'bg-[var(--ss-surface-alt)] border-[rgba(35,83,147,0.35)]' : 'bg-[var(--ss-surface)]',
        )}
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-md bg-[var(--ss-surface-alt)] p-2 text-[var(--ss-primary)]">
            <Icon name="export" className="h-5 w-5" title="Upload" />
          </div>

          <div className="flex-1">
            <p className="text-sm font-medium text-[var(--ss-text)]">Drag & drop a file, or browse</p>
            <p className="mt-0.5 text-xs text-[var(--ss-text-muted)]">{file ? `Selected: ${file.name}` : accept ? `Accepted: ${accept}` : 'Any file type'}</p>

            <div className="mt-3">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => inputRef.current?.click()}
              >
                Choose file
              </Button>
              {file ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="ml-2"
                  onClick={() => setSelected(null)}
                >
                  Clear
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        <input ref={inputRef} type="file" className="hidden" accept={accept} onChange={onChange} />
      </div>

      {error ? <p className="mt-1 text-xs text-[var(--ss-danger)]">{error}</p> : null}
      {!error && hint ? <p className="mt-1 text-xs text-[var(--ss-text-muted)]">{hint}</p> : null}
    </div>
  )
}
