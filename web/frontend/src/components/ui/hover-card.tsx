import type { ComponentProps } from 'react';
import { HoverCard as HoverCardPrimitive } from 'radix-ui';
import { cn } from '@/lib/utils';

export const HoverCard = HoverCardPrimitive.Root;
export const HoverCardTrigger = HoverCardPrimitive.Trigger;

export function HoverCardContent({ className, align = 'start', sideOffset = 8, ...props }: ComponentProps<typeof HoverCardPrimitive.Content>) {
  return <HoverCardPrimitive.Portal><HoverCardPrimitive.Content
    data-slot="hover-card-content"
    align={align}
    sideOffset={sideOffset}
    collisionPadding={16}
    className={cn('resource-preview z-40 w-[min(28rem,calc(100vw-2rem))] rounded-lg border bg-popover text-popover-foreground shadow-xl', className)}
    {...props}
  /></HoverCardPrimitive.Portal>;
}
