'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MainLayout } from '@/components/templates/main-layout';

export default function ContactPage() {
    const [sending, setSending] = useState(false);
    const [form, setForm] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSending(true);
        await new Promise((r) => setTimeout(r, 1000));
        setSending(false);
        toast.success('Message envoyé !');
        setForm({ name: '', email: '', subject: '', message: '' });
    }

    return (
        <MainLayout>
            <div className="max-w-lg mx-auto py-16">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold tracking-tight mb-3">
                        Contactez-nous
                    </h1>
                    <p className="text-muted-foreground">
                        Une question, une suggestion ou un partenariat ?
                        Écrivez-nous, nous répondons sous 48 h.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="name">Nom</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="Jean Dupont"
                                value={form.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="email">Adresse e-mail</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="jean@exemple.fr"
                                value={form.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="subject">Sujet</Label>
                        <Input
                            id="subject"
                            name="subject"
                            placeholder="À propos de…"
                            value={form.subject}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                            id="message"
                            name="message"
                            placeholder="Votre message…"
                            rows={6}
                            value={form.message}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full gap-2"
                        disabled={sending}
                    >
                        <Send className="h-4 w-4" />
                        {sending ? 'Envoi en cours…' : 'Envoyer le message'}
                    </Button>
                </form>
            </div>
        </MainLayout>
    );
}
