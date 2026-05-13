'use client';

import { Toaster as Sonner, toast } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

/**
 * Toast notifications — Dribbble "Daily UI 011" inspired:
 *   • White card with subtle shadow
 *   • Colored circular icon on the left (success/warning/error/info)
 *   • Bold colored title word (Réussite / Attention / Désolé / Pour info)
 *   • Plain description text, underlined action when provided
 *   • Position: bottom-right, slides up
 *
 * The colored type accents are the ONE chromatic exception to the
 * monochrome design system — semantic feedback only, never decorative.
 */
const Toaster = ({ ...props }: ToasterProps) => {
    return (
        <Sonner
            theme="light"
            position="bottom-right"
            gap={10}
            offset={20}
            toastOptions={{
                duration: 4500,
                classNames: {
                    /* Card — white, generous padding, soft shadow */
                    toast: [
                        '!font-sans !rounded-2xl !border !border-border',
                        '!bg-background !text-foreground',
                        '!shadow-[0_8px_30px_-8px_rgba(15,15,25,0.18)]',
                        '!gap-3 !p-4 !pr-10 !min-h-[68px]',
                        'group',
                    ].join(' '),

                    /* Title (the colored bold word + the rest of the message) */
                    title: '!text-foreground !font-medium !text-[13.5px] !leading-relaxed',

                    /* Description — secondary line if provided */
                    description:
                        '!text-muted-foreground !text-[12.5px] !leading-relaxed !mt-0.5',

                    /* Icon container — circular, larger, colored per type */
                    icon: [
                        '!h-9 !w-9 !rounded-full !flex !items-center !justify-center',
                        '!shrink-0',
                        '[&>svg]:!h-5 [&>svg]:!w-5',
                    ].join(' '),

                    /* Type accents — apply to the icon background + the leading
                     * pseudo-element so the colored word in the title can be
                     * styled via the surrounding markup. Keeps sonner default
                     * iconography. */
                    success: [
                        '[&_[data-icon]]:!bg-emerald-50',
                        '[&_[data-icon]>svg]:!text-emerald-500',
                    ].join(' '),
                    error: [
                        '[&_[data-icon]]:!bg-red-50',
                        '[&_[data-icon]>svg]:!text-red-500',
                    ].join(' '),
                    warning: [
                        '[&_[data-icon]]:!bg-amber-50',
                        '[&_[data-icon]>svg]:!text-amber-500',
                    ].join(' '),
                    info: [
                        '[&_[data-icon]]:!bg-blue-50',
                        '[&_[data-icon]>svg]:!text-blue-500',
                    ].join(' '),

                    /* Close button — top-right corner, subtle */
                    closeButton: [
                        '!bg-transparent !border-0 !text-muted-foreground/70',
                        'hover:!text-foreground hover:!bg-muted',
                        '!top-3 !right-3 !left-auto',
                        '!h-6 !w-6 !rounded-full',
                    ].join(' '),

                    /* Action button — primary pill */
                    actionButton: [
                        '!bg-foreground !text-background !rounded-full',
                        '!text-[11.5px] !font-semibold !px-3 !py-1.5',
                    ].join(' '),
                    cancelButton: [
                        '!bg-muted !text-foreground !rounded-full',
                        '!text-[11.5px] !font-medium !px-3 !py-1.5',
                    ].join(' '),
                },
            }}
            {...props}
        />
    );
};

export { Toaster, toast };
