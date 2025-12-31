import { useState } from 'react'
import Input, { type InputProps } from './Input'
import Button from './Button'

export default function PasswordInput(props: Omit<InputProps, 'type' | 'rightSlot'>) {
  const [show, setShow] = useState(false)

  return (
    <Input
      {...props}
      type={show ? 'text' : 'password'}
      rightSlot={
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShow((v) => !v)}
          className="h-7 px-2 text-xs"
        >
          {show ? 'Hide' : 'Show'}
        </Button>
      }
    />
  )
}
