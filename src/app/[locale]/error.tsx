'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface ErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
    useEffect(() => {
        Sentry.captureException(error);
    }, [error]);

    return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-6 p-8 text-center">
            <div className="flex flex-col items-center gap-3">
                <AlertCircle className="h-12 w-12 text-destructive" />
                <h1 className="text-2xl font-semibold tracking-tight">
                    Une erreur est survenue
                </h1>
                <p className="text-muted-foreground max-w-sm text-sm">
                    Quelque chose s&apos;est mal passé. Réessayez ou contactez
                    le support si le problème persiste.
                </p>
            </div>
            <Button onClick={reset} variant="outline">
                Réessayer
            </Button>
        </div>
    );
}
