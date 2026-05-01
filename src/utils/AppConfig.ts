import type { LocalePrefixMode } from 'next-intl/routing';

// 'as-needed' : le préfixe est omis pour la locale par défaut (fr).
// next-intl lit l'Accept-Language header et redirige automatiquement.
// /          → fr (défaut, pas de préfixe)
// /en/...    → en
// /posts     → fr ou en selon le header navigateur
const localePrefix: LocalePrefixMode = 'as-needed';

export const AppConfig = {
    name: 'Le Genie Pro',
    locales: ['fr', 'en'],
    defaultLocale: 'fr',
    localePrefix,
};
