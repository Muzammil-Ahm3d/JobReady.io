import { createQuestion } from '@/lib/actions';
import { getCategories } from '@/lib/db';
import styles from '../../admin.module.css';
import QuestionEditor from '../../components/QuestionEditor';

export default async function NewQuestion() {
    const categories = await getCategories();

    return (
        <div style={{ maxWidth: '900px' }}>
            <h1 className={styles.pageTitle} style={{ marginBottom: '2rem' }}>New Question</h1>
            <form action={createQuestion} className={styles.card} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Category</label>
                        <select name="categoryId" required style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px', backgroundColor: 'white' }}>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Display Order</label>
                        <input name="displayOrder" type="number" placeholder="Auto" style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px' }} />
                    </div>
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Question Title</label>
                    <input name="title" type="text" required style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px' }} />
                </div>

                {/* Section-based Content Editor — handles answer, code snippets, and images */}
                <QuestionEditor
                    name="answer"
                    label="Answer Content"
                    required={true}
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Use Cases (Optional)</label>
                        <textarea name="useCases" rows={3} style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px' }} placeholder="• Use case 1&#10;• Use case 2" />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Real Time Use Cases (Optional)</label>
                        <textarea name="realTimeUseCases" rows={3} style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px' }} placeholder="• Real example 1&#10;• Real example 2" />
                    </div>
                </div>
                <button type="submit" className={styles.button} style={{ alignSelf: 'flex-start' }}>Create Question</button>
            </form>
        </div>
    )
}
