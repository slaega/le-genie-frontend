import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const Env = createEnv({
    // Pendant `next build` dans Docker, les variables serveur (ex. API_BASE_URL)
    // ne sont pas disponibles (elles sont injectées au runtime via environment:).
    // SKIP_ENV_VALIDATION=1 est positionné uniquement dans le Dockerfile builder.
    skipValidation: !!process.env.SKIP_ENV_VALIDATION,
    server: {
        LOGTAIL_SOURCE_TOKEN: z.string().optional(),
        API_BASE_URL: z.string(),
    },
    client: {
        NEXT_PUBLIC_APP_URL: z.string().optional(),
        NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
        NEXT_PUBLIC_POSTHOG_HOST: z.string().optional(),
        NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string().optional().default(''),
        NEXT_PUBLIC_GITHUB_CLIENT_ID: z.string().optional().default(''),
        NEXT_PUBLIC_MICROSOFT_CLIENT_ID: z.string().optional().default(''),
        NEXT_PUBLIC_REDIRECT_URI: z.string().optional().default(''),
    },
    shared: {
        NODE_ENV: z.enum(['test', 'development', 'production']).optional(),
    },
    // You need to destructure all the keys manually
    runtimeEnv: {
        LOGTAIL_SOURCE_TOKEN: process.env.LOGTAIL_SOURCE_TOKEN,
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
        NODE_ENV: process.env.NODE_ENV,
        NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
        NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        API_BASE_URL: process.env.API_BASE_URL,
        NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        NEXT_PUBLIC_GITHUB_CLIENT_ID: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
        NEXT_PUBLIC_MICROSOFT_CLIENT_ID:
            process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID,
        NEXT_PUBLIC_REDIRECT_URI: process.env.NEXT_PUBLIC_REDIRECT_URI,
    },
});
