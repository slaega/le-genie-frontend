import withBundleAnalyzer from '@next/bundle-analyzer';
import { withSentryConfig } from '@sentry/nextjs';
import createNextIntlPlugin from 'next-intl/plugin';
import './src/libs/Env';

const withNextIntl = createNextIntlPlugin('./src/libs/i18n.ts');

const bundleAnalyzer = withBundleAnalyzer({
    enabled: process.env.ANALYZE === 'true',
});

const securityHeaders = [
    { key: 'X-DNS-Prefetch-Control', value: 'on' },
    { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
    },
];

const nextConfig = bundleAnalyzer(
    withNextIntl({
        poweredByHeader: false,
        reactStrictMode: true,
        /**
         * Proxy natif Next.js — remplace tous les route handlers /api/*.
         * afterFiles = les route handlers existants (ex: /api/auth/refresh)
         * gardent la priorité ; tout le reste est forwardé à NestJS.
         */
        async rewrites() {
            const nestUrl = (
                process.env.API_BASE_URL ?? 'http://localhost:3030/api/'
            ).replace(/\/$/, '');
            return {
                /**
                 * beforeFiles — run before filesystem routing, after middleware.
                 * Maps /@username/slug → /p/username/slug (internal route) while
                 * keeping the browser URL unchanged (transparent rewrite).
                 * Duplicate entries for each locale prefix (fr is default / no prefix).
                 */
                beforeFiles: [
                    { source: '/@:username/:slug*', destination: '/p/:username/:slug*' },
                    { source: '/en/@:username/:slug*', destination: '/en/p/:username/:slug*' },
                    { source: '/fr/@:username/:slug*', destination: '/fr/p/:username/:slug*' },
                ],
                afterFiles: [
                    {
                        source: '/api/:path*',
                        destination: `${nestUrl}/:path*`,
                    },
                ],
            };
        },
        async headers() {
            return [
                {
                    source: '/(.*)',
                    headers: securityHeaders,
                },
            ];
        },
        images: {
            remotePatterns: [
                {
                    protocol: 'https',
                    hostname: 'images.unsplash.com',
                    port: '',
                    pathname: '/**',
                },
                {
                    protocol: 'https',
                    hostname: 'play.min.io',
                    port: '',
                    pathname: '/**',
                },
                {
                    protocol: 'https',
                    hostname: '*',
                    port: '',
                    pathname: '/**',
                },
            ],
        },
    })
);

// Sentry is only applied in production builds to avoid slowing down dev compilation.
// withSentryConfig instruments every file (source maps, component annotations)
// which can add 10× overhead in watch mode with no benefit locally.
export default process.env.NODE_ENV === 'production'
    ? withSentryConfig(nextConfig, {
          org: 'nextjs-boilerplate-org',
          project: 'nextjs-boilerplate',
          silent: !process.env.CI,
          widenClientFileUpload: true,
          reactComponentAnnotation: { enabled: true },
          tunnelRoute: '/monitoring',
          disableLogger: true,
          automaticVercelMonitors: true,
          telemetry: false,
      })
    : nextConfig;
