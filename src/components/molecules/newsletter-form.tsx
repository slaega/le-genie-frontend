'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api/client';
import { ApiError } from '@/lib/api/types';

export function NewsletterForm() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [subscribed, setSubscribed] = useState(false);
    const [alreadySubscribed, setAlreadySubscribed] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!email || loading) return;

        setLoading(true);
        setError(null);
        setAlreadySubscribed(false);

        try {
            await api.post('/newsletter/subscribe', { email });
            setSubscribed(true);
        } catch (err) {
            if (err instanceof ApiError && err.status === 409) {
                setAlreadySubscribed(true);
            } else {
                setError('Une erreur est survenue. Réessayez.');
            }
        } finally {
            setLoading(false);
        }
    }

    if (subscribed) {
        return (
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
                Vous êtes abonné !
            </p>
        );
    }

    if (alreadySubscribed) {
        return <p className="text-sm text-muted-foreground">Déjà inscrit !</p>;
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <Input
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-sm h-9"
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
            <Button
                type="submit"
                size="sm"
                disabled={loading}
                className="w-full text-xs"
            >
                {loading ? 'Inscription…' : "S'abonner"}
            </Button>
        </form>
    );
}
