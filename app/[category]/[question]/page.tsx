import { getQuestions, Question } from '@/lib/db';
import { notFound } from 'next/navigation';
import SchemaJSON from '@/components/SchemaJSON';
import CodeBlock from '@/components/CodeBlock';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

export const dynamic = 'force-dynamic';


function getLanguage(categorySlug: string, title: string): string {
    const slug = categorySlug.toLowerCase();
    const t = title.toLowerCase();

    // Python
    if (['python', 'django', 'fast-api', 'flask-api', 'pyspark'].includes(slug) || t.includes('python')) return 'python';

    // Java
    if (['java', 'spring-framework', 'spring-data-jpa-hibernate', 'spring-boot', 'spring-cloud-microservices', 'core-java', 'java8-features'].includes(slug) || t.includes('java ')) return 'java';

    // C# / .NET
    if (['dotnet', 'asp-net', 'jpa-net', 'csharp'].includes(slug) || t.includes('c#') || t.includes('.net')) return 'csharp';

    // C++
    if (['cpp', 'c++'].includes(slug) || t.includes('c++') || t.includes('cpp')) return 'cpp';

    // C
    // We check for " c " with spaces or at start/end to avoid matching inside words like "react"
    if (slug === 'c' || t === 'c' || t.startsWith('c ') || t.endsWith(' c') || t.includes(' c ') || t.includes('c language') || t.includes('c programming')) return 'c';

    // SQL
    if (slug === 'sql' || t.includes('sql')) return 'sql';

    // HTML/CSS
    if (slug === 'html' || t.includes('html')) return 'html';
    if (slug === 'css' || t.includes('css')) return 'css';

    // DevOps / CLI (Bash)
    if (['git-github', 'jenkins', 'aws', 'azure', 'linux', 'ubuntu', 'shell'].includes(slug) || t.includes('git ') || t.includes('bash') || t.includes('cli') || t.includes('command')) return 'bash';

    // Infrastructure / Config (YAML/JSON)
    if (['kubernetes', 'docker', 'terraform', 'ansible'].includes(slug) || t.includes('yaml') || t.includes('yml')) return 'yaml';
    if (t.includes('json') || t.includes('config')) return 'json';

    // Data / PowerBI
    if (['power-bi', 'dax', 'tableau'].includes(slug) || t.includes('dax')) return 'dax'; // specific highlighter support might vary, fallbacks to text usually

    // Other Languages
    if (['go', 'golang'].includes(slug)) return 'go';
    if (['ruby', 'rails'].includes(slug)) return 'ruby';
    if (['php', 'laravel'].includes(slug)) return 'php';
    if (['swift', 'ios'].includes(slug)) return 'swift';
    if (['kotlin', 'android'].includes(slug)) return 'kotlin';
    if (['rust'].includes(slug)) return 'rust';
    if (['scala', 'spark'].includes(slug)) return 'scala';

    // JavaScript / TypeScript (default ecosystem)
    if (['javascript', 'react-js', 'redux', 'node-js', 'express-js', 'restful-api', 'microservices', 'jwt', 'axios', 'es6-features'].includes(slug) || t.includes('javascript') || t.includes('react') || t.includes('node') || t.includes('js')) return 'javascript';

    return 'javascript';
}

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
                    <article className="prose markdown-content" style={{ fontSize: '1.125rem', lineHeight: 1.8, color: '#334155', marginBottom: '2.5rem' }}>
                        <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                            {question.answer}
                        </ReactMarkdown>
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
                            <CodeBlock
                                code={question.codeSnippet}
                                language={getLanguage(categorySlug, question.title)}
                            />
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
