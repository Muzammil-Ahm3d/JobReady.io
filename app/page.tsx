import Link from 'next/link';
import { getCategoriesWithCount, getQuestions } from '@/lib/db';

export const dynamic = 'force-dynamic';

import styles from './page.module.css';
import { Metadata } from 'next';

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string }> }): Promise<Metadata> {
    const { q } = await searchParams;
    if (q) {
        return {
            title: `Search results for "${q}" - JobReady.io`,
            robots: { index: false, follow: false },
        };
    }
    return {
        title: "JobReady.io | Master Your Interview",
        description: "The fastest way to prepare for tech interviews.",
    };
}

export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
    const { q } = await searchParams;

    if (q) {
        // Search Mode
        const allQuestions = await getQuestions();
        const results = allQuestions.filter(item =>
            item.title.toLowerCase().includes(q.toLowerCase()) ||
            item.answer.toLowerCase().includes(q.toLowerCase())
        );

        return (
            <div>
                <section className={styles.hero} style={{ padding: '2rem 1rem' }}>
                    <h1 className={styles.title} style={{ fontSize: '2rem' }}>Search Results</h1>
                    <p className={styles.subtitle}>Found {results.length} result(s) for "{q}"</p>
                </section>
                <div className={styles.grid}>
                    {results.map((qItem) => (
                        <Link key={qItem.id} href={`/${qItem.categorySlug}/${qItem.slug}`} className={styles.card}>
                            <h2 className={styles.cardTitle}>{qItem.title}</h2>
                            <p className={styles.cardDesc}>Category: {qItem.categorySlug}</p>
                            <div className={styles.cardCount}>View Answer</div>
                        </Link>
                    ))}
                    {results.length === 0 && (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-muted)' }}>
                            No questions found matching your query.
                        </div>
                    )}
                </div>
                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <Link href="/" style={{ color: 'var(--secondary)', textDecoration: 'underline' }}>Back to Home</Link>
                </div>
            </div>
        );
    }

    // Default Home Mode
    const categories = await getCategoriesWithCount();
    const visibleCategories = categories;

    return (
        <div>
            <section className={styles.hero}>
                <h1 className={styles.title}>Master Your Technical Interview</h1>
                <p className={styles.subtitle}>
                    Precise questions, modal-based browsing, and optimized for speed.
                    Select a category to start learning.
                </p>
            </section>

            <section className={styles.grid}>
                {visibleCategories.map((cat) => (
                    <Link href={`/${cat.slug}`} key={cat.id} className={styles.card}>
                        <h2 className={styles.cardTitle}>{cat.name}</h2>
                        <p className={styles.cardDesc}>{cat.description}</p>
                        <div className={styles.cardCount}>{cat.count} questions</div>
                    </Link>
                ))}
            </section>
        </div>
    );
}
