'use client';
import { Toaster as Sonner, toast } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
    return (
        <Sonner
            theme="dark"
            position="bottom-right"
            gap={8}
            toastOptions={{
                duration: 4000,
                classNames: {
                    toast: [
                        '!font-sans !rounded-2xl !border !border-white/[0.06]',
                        '!bg-zinc-950 !text-zinc-100',
                        '!shadow-[0_20px_60px_rgba(0,0,0,0.55)] !backdrop-blur-2xl',
                        'group',
                    ].join(' '),
                    title: '!text-zinc-50 !font-medium !text-[13px] !leading-snug',
                    description: '!text-zinc-400 !text-[12px] !leading-normal',
                    success: '!border-l-2 !border-l-emerald-400',
                    error: '!border-l-2 !border-l-red-400',
                    warning: '!border-l-2 !border-l-amber-400',
                    info: '!border-l-2 !border-l-blue-400',
                    closeButton:
                        '!bg-white/5 !border !border-white/10 !text-zinc-400 hover:!text-zinc-200',
                    actionButton:
                        '!bg-white !text-zinc-950 !rounded-xl !text-xs !font-semibold !px-3 !py-1.5',
                    cancelButton:
                        '!bg-white/10 !text-zinc-300 !rounded-xl !text-xs !px-3 !py-1.5',
                },
            }}
            {...props}
        />
    );
};

export { Toaster, toast };
