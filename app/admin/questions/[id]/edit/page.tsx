import { getQuestions, getCategories } from '@/lib/db';
import { updateQuestion } from '@/lib/actions';
import styles from '../../../admin.module.css';
import { redirect } from 'next/navigation';
import QuestionEditor from '../../../components/QuestionEditor';

export const dynamic = 'force-dynamic';

export default async function EditQuestion({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const allQuestions = await getQuestions();
    const question = allQuestions.find(q => q.id === parseInt(id));
    const categories = await getCategories();

    if (!question) {
        redirect('/admin/questions');
    }

    return (
        <div style={{ maxWidth: '900px' }}>
            <h1 className={styles.pageTitle} style={{ marginBottom: '2rem' }}>Edit Question</h1>
            <form action={updateQuestion.bind(null, question.id)} className={styles.card} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Category</label>
                        <select name="categoryId" defaultValue={question.categoryId} required style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px', backgroundColor: 'white' }}>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Display Order</label>
                        <input name="displayOrder" type="number" defaultValue={question.displayOrder} style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px' }} />
                    </div>
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Question Title</label>
                    <input name="title" type="text" defaultValue={question.title} required style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px' }} />
                </div>

                {/* Section-based Content Editor — handles answer, code snippets, and images */}
                <QuestionEditor
                    name="answer"
                    label="Answer Content"
                    defaultValue={question.answer}
                    required={true}
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Use Cases (Optional)</label>
                        <textarea
                            name="useCases"
                            rows={3}
                            defaultValue={Array.isArray(question.useCases) ? question.useCases.join('\n') : question.useCases}
                            style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Real Time Use Cases (Optional)</label>
                        <textarea
                            name="realTimeUseCases"
                            rows={3}
                            defaultValue={Array.isArray(question.realTimeUseCases) ? question.realTimeUseCases.join('\n') : question.realTimeUseCases}
                            style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                        />
                    </div>
                </div>
                <button type="submit" className={styles.button} style={{ alignSelf: 'flex-start' }}>Update Question</button>
            </form>
        </div>
    )
}
