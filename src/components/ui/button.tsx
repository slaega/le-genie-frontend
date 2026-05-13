'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

/**
 * Hashnode-inspired button system: rounded-full pills, semibold weight,
 * generous horizontal padding. Primary uses the brand --primary, outline
 * uses a clean white surface with a subtle border.
 */
const buttonVariants = cva(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap text-[13px] font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-[15px] [&_svg]:shrink-0 active:scale-[0.98] select-none cursor-pointer',
    {
        variants: {
            variant: {
                /* Primary CTA — solid khaki, white text, rounded-full pill */
                default:
                    'rounded-full bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md',
                /* Strong dark CTA (e.g. "Publier") — solid foreground */
                solid: 'rounded-full bg-foreground text-background shadow-sm hover:bg-foreground/90 hover:shadow-md',
                destructive:
                    'rounded-full bg-destructive text-white shadow-sm hover:bg-destructive/90',
                /* Outlined — white pill with thin border */
                outline:
                    'rounded-full border border-border bg-background text-foreground hover:bg-muted hover:border-foreground/25',
                secondary:
                    'rounded-full bg-muted text-foreground hover:bg-muted/70',
                ghost: 'rounded-full text-foreground/75 hover:text-foreground hover:bg-muted',
                link: 'text-primary underline-offset-4 hover:underline p-0 h-auto active:scale-100 font-semibold',
            },
            size: {
                default: 'h-9 px-4',
                sm: 'h-8 px-3.5 text-[12px]',
                lg: 'h-11 px-6 text-[14px]',
                icon: 'h-9 w-9 rounded-full',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
);

export interface ButtonProps
    extends
        React.ButtonHTMLAttributes<HTMLButtonElement>,
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
