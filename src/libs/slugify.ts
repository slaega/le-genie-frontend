export function slugify(str: string): string {
    return str
        .toLowerCase()
        .normalize('NFD') // Remove accents
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/[^a-z0-9 ]/g, '') // Remove invalid chars
        .trim()
        .replace(/\s+/g, '-'); // Replace spaces with -
}
