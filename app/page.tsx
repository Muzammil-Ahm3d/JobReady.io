import Link from 'next/link';
import Fuse from 'fuse.js';
import { getCategoriesWithCount, getQuestions, getCategories } from '@/lib/db';

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

/**
 * Industry-standard hybrid search:
 * 1. Tokenize the query into individual words
 * 2. Try to match token combinations against category names (handles "java script" → "JavaScript")
 * 3. If a category matches, pull questions from it that match remaining keywords
 * 4. If no within-category results found, FALL BACK to showing all category questions (with suggestion)
 * 5. If no category matches at all, run global Fuse.js fuzzy search
 * Returns { results, suggestion } where suggestion is a "Did you mean?" message
 */
async function performSearch(query: string) {
    const allQuestions = await getQuestions();
    const categories = await getCategories();

    const tokens = query.toLowerCase().split(/\s+/).filter(t => t.length > 0);
    const seen = new Set<number>();
    const results: typeof allQuestions = [];
    let suggestion: string | null = null;

    // --- Phase 1: Token-based Category Matching ---
    for (let i = 0; i < tokens.length; i++) {
        for (let j = i + 1; j <= tokens.length; j++) {
            const combo = tokens.slice(i, j).join('');
            const comboSpaced = tokens.slice(i, j).join(' ');

            const matchedCat = categories.find(cat => {
                const name = cat.name.toLowerCase().replace(/[\s\-_.\/]/g, '');
                const slug = cat.slug.toLowerCase().replace(/[\s\-_.\/]/g, '');
                return name === combo || slug === combo ||
                    name.includes(combo) || slug.includes(combo) ||
                    cat.name.toLowerCase() === comboSpaced;
            });

            if (matchedCat) {
                const remainingTokens = [...tokens.slice(0, i), ...tokens.slice(j)];
                const catQuestions = allQuestions.filter(q => q.categoryId === matchedCat.id);

                if (remainingTokens.length === 0) {
                    // Only category searched → return all questions from it
                    for (const q of catQuestions) {
                        if (!seen.has(q.id)) {
                            seen.add(q.id);
                            results.push(q);
                        }
                    }
                } else {
                    // Category + keywords → fuzzy search within category
                    const keywordQuery = remainingTokens.join(' ');
                    const catFuse = new Fuse(catQuestions, {
                        keys: [
                            { name: 'title', weight: 0.7 },
                            { name: 'answer', weight: 0.3 },
                        ],
                        threshold: 0.5,
                        ignoreLocation: true,
                        includeScore: true,
                        minMatchCharLength: 2,
                    });
                    const catResults = catFuse.search(keywordQuery);

                    if (catResults.length > 0) {
                        for (const r of catResults) {
                            if (!seen.has(r.item.id)) {
                                seen.add(r.item.id);
                                results.push(r.item);
                            }
                        }
                    } else {
                        // FALLBACK: Keywords didn't match any titles within the category
                        // Show ALL category questions with a "Did you mean?" suggestion
                        suggestion = matchedCat.name;
                        for (const q of catQuestions) {
                            if (!seen.has(q.id)) {
                                seen.add(q.id);
                                results.push(q);
                            }
                        }
                    }
                }
            }
        }
    }

    // --- Phase 2: Global Fuse.js Fuzzy Search ---
    // Only runs when no category was matched
    if (results.length === 0) {
        const globalFuse = new Fuse(allQuestions, {
            keys: [
                { name: 'title', weight: 0.5 },
                { name: 'categoryName', weight: 0.3 },
                { name: 'categorySlug', weight: 0.2 },
                { name: 'answer', weight: 0.1 },
            ],
            threshold: 0.4,
            ignoreLocation: true,
            includeScore: true,
            minMatchCharLength: 2,
            findAllMatches: true,
        });

        const globalResults = globalFuse.search(query, { limit: 50 });
        for (const r of globalResults) {
            if (!seen.has(r.item.id)) {
                seen.add(r.item.id);
                results.push(r.item);
            }
        }
    }

    return { results, suggestion };
}

export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
    const { q } = await searchParams;

    if (q) {
        const { results, suggestion } = await performSearch(q);

        return (
            <div>
                <section className={styles.hero} style={{ padding: '2rem 1rem' }}>
                    <h1 className={styles.title} style={{ fontSize: '2rem' }}>Search Results</h1>
                    <p className={styles.subtitle}>Found {results.length} result(s) for &quot;{q}&quot;</p>
                    {suggestion && (
                        <p style={{ color: 'var(--secondary)', marginTop: '0.5rem', fontSize: '0.95rem' }}>
                            Showing all <strong>{suggestion}</strong> questions
                        </p>
                    )}
                </section>
                <div className={styles.grid}>
                    {results.map((qItem) => (
                        <Link key={qItem.id} href={`/${qItem.categorySlug}/${qItem.slug}`} className={styles.card}>
                            <h2 className={styles.cardTitle}>{qItem.title}</h2>
                            <p className={styles.cardDesc}>Category: {qItem.categoryName}</p>
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
