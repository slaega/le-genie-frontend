'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
    // No ring, no ring-offset — clean transitions only
    'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-150 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.97] select-none cursor-pointer',
    {
        variants: {
            variant: {
                default:
                    'rounded-lg bg-foreground text-background hover:bg-foreground/85',
                destructive:
                    'rounded-lg bg-destructive text-white hover:bg-destructive/90',
                outline:
                    'rounded-lg border border-border bg-transparent text-foreground hover:bg-muted hover:border-foreground/20',
                secondary:
                    'rounded-lg bg-muted text-foreground hover:bg-muted/60',
                ghost: 'rounded-lg text-foreground/70 hover:text-foreground hover:bg-muted',
                link: 'text-foreground underline-offset-4 hover:underline p-0 h-auto active:scale-100',
            },
            size: {
                default: 'h-9 px-4 py-2',
                sm: 'h-8 px-3 text-xs',
                lg: 'h-11 px-6 text-base',
                icon: 'h-9 w-9',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : 'button';
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
