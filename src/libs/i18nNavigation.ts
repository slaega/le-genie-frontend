import { AppConfig } from '@/utils/AppConfig';
import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: AppConfig.locales,
  localePrefix: AppConfig.localePrefix,
  defaultLocale: AppConfig.defaultLocale,

  // Ordre de priorité de détection :
  //   1. Préfixe dans l'URL  (/en/posts → anglais)
  //   2. Cookie NEXT_LOCALE  (visite précédente ou choix utilisateur)
  //   3. Header Accept-Language  (préférence navigateur)
  //   4. defaultLocale (fr)
  localeDetection: true,

  // Persiste la langue choisie dans un cookie 1 an.
  // Le middleware next-intl lit ET écrit ce cookie automatiquement.
  localeCookie: {
    name: 'NEXT_LOCALE',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365, // 1 an
  },
});

export const { usePathname, useRouter, Link,redirect } = createNavigation(routing);
