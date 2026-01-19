import { createQuestion } from '@/lib/actions';
import { getCategories } from '@/lib/db';
import styles from '../../admin.module.css';

export default async function NewQuestion() {
    const categories = await getCategories();

    return (
        <div style={{ maxWidth: '800px' }}>
            <h1 className={styles.pageTitle} style={{ marginBottom: '2rem' }}>New Question</h1>
            <form action={createQuestion} className={styles.card} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Category</label>
                    <select name="categoryId" required style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px', backgroundColor: 'white' }}>
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Question Title</label>
                    <input name="title" type="text" required style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px' }} />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Image URL (Optional)</label>
                    <input name="imageUrl" type="text" placeholder="https://..." style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px' }} />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Answer (Markdown supported)</label>
                    <textarea name="answer" rows={8} required style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px', fontFamily: 'monospace' }} />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Code Snippet (Optional)</label>
                    <textarea name="codeSnippet" rows={6} style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px', fontFamily: 'monospace', backgroundColor: '#f8fafc' }} placeholder="// Paste your code here..." />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Use Cases (Optional)</label>
                    <textarea name="useCases" rows={3} style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px' }} />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Real Time Use Cases (Optional)</label>
                    <textarea name="realTimeUseCases" rows={3} style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px' }} />
                </div>
                <button type="submit" className={styles.button} style={{ alignSelf: 'flex-start' }}>Create Question</button>
            </form>
        </div>
    )
}
