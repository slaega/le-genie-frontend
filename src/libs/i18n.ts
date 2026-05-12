import { getRequestConfig } from 'next-intl/server';
import { routing } from './i18nNavigation';

// NextJS Boilerplate uses Crowdin as the localization software.
// As a developer, you only need to take care of the English (or another default language) version.
// Other languages are automatically generated and handled by Crowdin.

// The localisation files are synced with Crowdin using GitHub Actions.
// By default, there are 3 ways to sync the message files:
// 1. Automatically sync on push to the `main` branch
// 2. Run manually the workflow on GitHub Actions
// 3. Every 24 hours at 5am, the workflow will run automatically

// Using internationalization in Server Components (next-intl v4)
export default getRequestConfig(async ({ locale }) => {
    // Validate that the incoming `locale` parameter is valid
    let validLocale = locale;
    if (!validLocale || !routing.locales.includes(validLocale)) {
        validLocale = routing.defaultLocale;
    }

    try {
        const messages = (await import(`../locales/${validLocale}.json`))
            .default;
        return {
            locale: validLocale,
            messages,
        };
    } catch (error) {
        console.error(
            `Failed to load messages for locale: ${validLocale}`,
            error
        );
        // Fallback to default locale if translation file not found
        const fallbackMessages = (
            await import(`../locales/${routing.defaultLocale}.json`)
        ).default;
        return {
            locale: routing.defaultLocale,
            messages: fallbackMessages,
        };
    }
});
