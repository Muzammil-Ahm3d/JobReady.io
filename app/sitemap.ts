import { getCategories, getQuestions } from '@/lib/db';
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://jobready.io'; // Placeholder domain

    // Fetch all categories
    const categories = await getCategories();

    // Fetch all questions (this might be heavy, optimize in real app with pagination or chunks)
    const allQuestions = await getQuestions();

    const categoryUrls = categories.map((cat) => ({
        url: `${baseUrl}/${cat.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    const questionUrls = allQuestions.map((q) => ({
        url: `${baseUrl}/${q.categorySlug}/${q.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
    }));

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1.0,
        },
        ...categoryUrls,
        ...questionUrls,
    ];
}
