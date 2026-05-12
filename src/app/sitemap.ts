import type { MetadataRoute } from 'next';
import { getBaseUrl } from '../utils/Helpers';

const base = getBaseUrl();

const staticRoutes: MetadataRoute.Sitemap = [
    {
        url: `${base}/`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
    },
    {
        url: `${base}/publications`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
    },
    {
        url: `${base}/about`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
    },
    {
        url: `${base}/contact`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.4,
    },
    {
        url: `${base}/search`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.6,
    },
];

async function fetchPublishedPosts(): Promise<
    Array<{ id: string; slug: string | null; updatedAt: string }>
> {
    try {
        const apiUrl = process.env.API_INTERNAL_URL ?? 'http://localhost:3030';
        const res = await fetch(`${apiUrl}/posts?status=PUBLISHED&limit=100`, {
            next: { revalidate: 3600 },
        });
        if (!res.ok) return [];
        const data: { items?: Array<{ id: string; slug: string | null; updatedAt: string }> } =
            await res.json();
        return data.items ?? [];
    } catch {
        return [];
    }
}

async function fetchAuthors(): Promise<
    Array<{ id: string; updatedAt: string }>
> {
    try {
        const apiUrl = process.env.API_INTERNAL_URL ?? 'http://localhost:3030';
        const res = await fetch(`${apiUrl}/cms/authors?limit=100`, {
            next: { revalidate: 3600 },
        });
        if (!res.ok) return [];
        const data: { items?: Array<{ id: string; updatedAt: string }> } =
            await res.json();
        return data.items ?? [];
    } catch {
        return [];
    }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const [posts, authors] = await Promise.all([
        fetchPublishedPosts(),
        fetchAuthors(),
    ]);

    const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
        url: `${base}/post/${post.slug ?? post.id}`,
        lastModified: new Date(post.updatedAt),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    const authorEntries: MetadataRoute.Sitemap = authors.map((author) => ({
        url: `${base}/authors/${author.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }));

    return [...staticRoutes, ...postEntries, ...authorEntries];
}
