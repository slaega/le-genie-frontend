import { AppConfig } from '@/utils/AppConfig';
import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: AppConfig.locales,
  localePrefix: AppConfig.localePrefix,
  defaultLocale: AppConfig.defaultLocale,
  // Détecte automatiquement la langue via l'header Accept-Language du navigateur.
  // Si l'URL n'a pas de préfixe, next-intl lit le header et redirige si besoin.
  localeDetection: true,
});

export const { usePathname, useRouter, Link,redirect } = createNavigation(routing);
