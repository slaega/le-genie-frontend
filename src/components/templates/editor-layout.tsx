import { cn } from '@/lib/utils';

interface EditorLayoutProps {
    children: React.ReactNode;
    className?: string;
}

export function EditorLayout({ children, className }: EditorLayoutProps) {
    return (
        <div
            className={cn(
                'min-h-screen flex flex-col bg-background',
                className
            )}
        >
            {children}
        </div>
    );
}
