import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import '@/styles/globals.css';
import { routing } from '@/libs/i18nNavigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Providers } from '@/providers/providers';
import { PostHogProvider } from '@/components/analytics/PostHogProvider';

/* Inter — clean geometric sans, the editorial / SaaS standard */
const inter = Inter({
    variable: '--font-noto-sans',
    subsets: ['latin'],
    display: 'swap',
});
/* JetBrains Mono — sharp monospace for inline + block code */
const jetbrainsMono = JetBrains_Mono({
    variable: '--font-noto-sans-mono',
    subsets: ['latin'],
    display: 'swap',
});

export const metadata: Metadata = {
    icons: [
        { rel: 'apple-touch-icon', url: '/apple-touch-icon.png' },
        {
            rel: 'icon',
            type: 'image/png',
            sizes: '32x32',
            url: '/favicon-32x32.png',
        },
        {
            rel: 'icon',
            type: 'image/png',
            sizes: '16x16',
            url: '/favicon-16x16.png',
        },
        { rel: 'icon', url: '/favicon.ico' },
    ],
};

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout(
    props: Readonly<{
        children: React.ReactNode;
        params: Promise<{ locale: string }>;
    }>
) {
    const { locale } = await props.params;

    if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
        notFound();
    }

    setRequestLocale(locale);
    const messages = await getMessages();

    return (
        <html lang={locale} suppressHydrationWarning>
            <body
                suppressHydrationWarning
                className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
            >
                <PostHogProvider>
                    <NextIntlClientProvider locale={locale} messages={messages}>
                        <Providers>{props.children}</Providers>
                    </NextIntlClientProvider>
                </PostHogProvider>
            </body>
        </html>
    );
}
