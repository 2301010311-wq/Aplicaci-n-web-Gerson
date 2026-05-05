'use client'

import * as React from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'

import { cn } from '@/lib/utils'

function TooltipProvider({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return <TooltipPrimitive.Provider {...props} />
}

function Tooltip({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root {...props} />
}

function TooltipTrigger({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger {...props} />
}

function TooltipContent({
  className,
  sideOffset = 6,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          'rounded-md bg-slate-950 px-3 py-2 text-sm text-white shadow-lg data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=closed]:fade-out-0',
          className,
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  )
}

export { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent }
