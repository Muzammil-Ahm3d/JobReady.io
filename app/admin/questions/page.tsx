import { getQuestions } from '@/lib/db';
import { deleteQuestion } from '@/lib/actions';
import Link from 'next/link';
import styles from '../admin.module.css';
import SearchInput from '../components/SearchInput';

export const dynamic = 'force-dynamic';

export default async function QuestionsAdmin({
    searchParams,
}: {
    searchParams?: {
        q?: string;
    };
}) {
    const q = searchParams?.q?.toLowerCase() || '';
    const allQuestions = await getQuestions();
    const questions = allQuestions.filter(quest =>
        quest.title.toLowerCase().includes(q) || quest.slug.toLowerCase().includes(q)
    );

    return (
        <div>
            <div className={styles.header}>
                <h1 className={styles.pageTitle}>Questions</h1>
                <Link href="/admin/questions/new" className={styles.button}>+ Add New</Link>
            </div>
            <SearchInput placeholder="Search questions..." />
            <div className={styles.card}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.875rem' }}>
                            <th style={{ padding: '1rem' }}>Title</th>
                            <th style={{ padding: '1rem' }}>Category</th>
                            <th style={{ padding: '1rem' }}>Slug</th>
                            <th style={{ padding: '1rem' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {questions.map(q => (
                            <tr key={q.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '1rem', fontWeight: 500 }}>{q.title}</td>
                                <td style={{ padding: '1rem' }}>{q.categorySlug || 'Uncategorized'}</td>
                                <td style={{ padding: '1rem', color: '#64748b' }}>{q.slug}</td>
                                <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                                    <Link href={`/admin/questions/${q.id}/edit`} style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 500 }}>
                                        Update
                                    </Link>
                                    <form action={deleteQuestion.bind(null, q.id)}>
                                        <button type="submit" style={{ cursor: 'pointer', color: '#ef4444', background: 'transparent', border: 'none', fontWeight: 500 }}>Delete</button>
                                    </form>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
