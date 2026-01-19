import { getQuestions, Question } from '@/lib/db';
import { notFound } from 'next/navigation';
import SchemaJSON from '@/components/SchemaJSON';
import CodeBlock from '@/components/CodeBlock';
import Link from 'next/link';

export default async function QuestionPage({ params }: { params: Promise<{ category: string; question: string }> }) {
    const { category: categorySlug, question: questionSlug } = await params;
    const questions = await getQuestions(categorySlug);
    const question = questions.find(q => q.slug === questionSlug.toLowerCase());

    if (!question) notFound();

    return (
        <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)', background: '#f8fafc' }}>
            {/* Sidebar */}
            <aside style={{
                width: '300px',
                background: 'white',
                borderRight: '1px solid #e2e8f0',
                height: 'calc(100vh - 64px)',
                position: 'sticky',
                top: '64px',
                overflowY: 'auto',
                padding: '1.5rem',
                display: 'none',
                // Responsive: show on desktop
            }} className="desktop-sidebar">
                <div style={{ marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    In this module
                </div>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {questions.map(q => (
                        <Link
                            key={q.id}
                            href={`/${categorySlug}/${q.slug}`}
                            style={{
                                display: 'block',
                                padding: '0.75rem 1rem',
                                borderRadius: '6px',
                                fontSize: '0.925rem',
                                color: q.slug === questionSlug ? '#2563eb' : '#334155',
                                background: q.slug === questionSlug ? '#eff6ff' : 'transparent',
                                fontWeight: q.slug === questionSlug ? 600 : 400,
                                textDecoration: 'none',
                                transition: 'all 0.2s'
                            }}
                        >
                            {q.title}
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '2rem', maxWidth: '100%', overflowX: 'hidden' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', background: 'white', padding: '3rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <SchemaJSON question={question} />

                    {/* Title */}
                    <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem', lineHeight: 1.2 }}>
                        {question.title}
                    </h1>
                    <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
                        Last Updated: {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>

                    {/* Answer */}
                    <article className="prose" style={{ fontSize: '1.125rem', lineHeight: 1.8, color: '#334155', marginBottom: '2.5rem' }}>
                        {question.answer.split('\n').map((line, i) => (
                            <p key={i} style={{ marginBottom: '1rem' }}>{line}</p>
                        ))}
                    </article>

                    {/* Image Section */}
                    {question.imageUrl && (
                        <div style={{ marginBottom: '2.5rem' }}>
                            <img
                                src={question.imageUrl}
                                alt={question.title}
                                style={{
                                    width: '100%',
                                    maxHeight: '500px',
                                    objectFit: 'contain',
                                    borderRadius: '8px',
                                    border: '1px solid #e2e8f0',
                                    background: '#f8fafc'
                                }}
                            />
                        </div>
                    )}

                    {/* Code Snippet Section */}
                    {question.codeSnippet && (
                        <div style={{ marginBottom: '2.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>
                                Implementation
                            </h3>
                            <CodeBlock code={question.codeSnippet} />
                        </div>
                    )}

                    {/* Use Cases Section */}
                    {(question.useCases || question.realTimeUseCases) && (
                        <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            {question.useCases && (
                                <div style={{ marginBottom: question.realTimeUseCases ? '2rem' : 0 }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        💡 Use Cases
                                    </h3>
                                    <p style={{ color: '#475569', whiteSpace: 'pre-line' }}>{question.useCases}</p>
                                </div>
                            )}

                            {question.realTimeUseCases && (
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        🚀 Real-Time Examples
                                    </h3>
                                    <p style={{ color: '#475569', whiteSpace: 'pre-line' }}>{question.realTimeUseCases}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* Global Styles for Sidebar responsiveness */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media (max-width: 1024px) {
                    .desktop-sidebar { display: none !important; }
                }
                @media (min-width: 1025px) {
                    .desktop-sidebar { display: block !important; }
                }
            `}} />
        </div>
    );
}
