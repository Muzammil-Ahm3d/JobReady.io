import { getDB, getQuestions } from '@/lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

import { Metadata } from 'next';

type Props = {
    params: Promise<{ category: string }>;
    searchParams: Promise<{ q?: string }>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    const { category } = await params;
    const { q } = await searchParams;

    if (q) {
        return {
            title: `Search results for "${q}" in ${category} - JobReady.io`,
            robots: { index: false, follow: false },
        };
    }

    return {
        title: `${category.charAt(0).toUpperCase() + category.slice(1)} Interview Questions`,
        description: `Top interview questions for ${category}`,
    };
}

export default async function CategoryPage({ params, searchParams }: Props) {
    const { category: categorySlug } = await params;
    const { q } = await searchParams;

    const db = await getDB();
    const category = db.categories.find(c => c.slug === categorySlug.toLowerCase());

    if (!category) {
        notFound();
    }

    let catQuestions = await getQuestions(categorySlug);

    if (q) {
        catQuestions = catQuestions.filter(item =>
            item.title.toLowerCase().includes(q.toLowerCase()) ||
            item.answer.toLowerCase().includes(q.toLowerCase())
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Link href="/" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    marginBottom: '1rem',
                    color: '#64748b',
                    textDecoration: 'none',
                    fontWeight: 500,
                    fontSize: '0.9rem'
                }}>
                    ← Back to Home
                </Link>
                <h1 className={styles.title}>{category.name} Interview Questions</h1>
                <p className={styles.desc}>{category.description}</p>
                {q && <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Found {catQuestions.length} result(s) for "{q}"</p>}
            </div>

            <div className={styles.list}>
                {catQuestions.length > 0 ? (
                    catQuestions.map(qItem => (
                        <Link key={qItem.id} href={`/${categorySlug}/${qItem.slug}`} className={styles.questionLink}>
                            <h3 className={styles.qTitle}>{qItem.title}</h3>
                            <div className={styles.qMeta}>Click to view answer</div>
                        </Link>
                    ))
                ) : (
                    <div className={styles.empty}>
                        {q ? `No questions found for "${q}" in this category.` : "No questions found in this category yet."}
                    </div>
                )}
            </div>
            {q && (
                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <Link href={`/${categorySlug}`} style={{ color: 'var(--secondary)', textDecoration: 'underline' }}>Clear Search</Link>
                </div>
            )}
        </div>
    );
}
