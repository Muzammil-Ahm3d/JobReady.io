import styles from './QuestionView.module.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

interface QuestionProps {
    question: {
        title: string;
        answer: string;
        useCases?: string | string[] | null;
        realTimeUseCases?: string | string[] | null;
    }
}

export default function QuestionView({ question }: QuestionProps) {
    return (
        <article className={styles.container}>
            <h1 className={styles.title}>{question.title}</h1>
            <div className={styles.section}>
                <div className={styles.label}>Answer</div>
                <div className={styles.content}>
                    <p>{question.answer}</p>
                </div>
            </div>
            {question.useCases && (
                <div className={styles.section}>
                    <div className={styles.label}>Use Cases</div>
                    <div className={styles.content}>
                        {Array.isArray(question.useCases) ? (
                            <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', margin: 0 }}>
                                {question.useCases.map((useCase, index) => (
                                    <li key={index} style={{ marginBottom: '0.5rem' }}>{useCase}</li>
                                ))}
                            </ul>
                        ) : (
                            <p style={{ whiteSpace: 'pre-line' }}>{question.useCases}</p>
                        )}
                    </div>
                </div>
            )}
            {question.realTimeUseCases && (
                <div className={styles.section}>
                    <div className={styles.label}>Real Time Use Cases</div>
                    <div className={styles.content}>
                        {Array.isArray(question.realTimeUseCases) ? (
                            <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', margin: 0 }}>
                                {question.realTimeUseCases.map((example, index) => (
                                    <li key={index} style={{ marginBottom: '0.5rem' }}>{example}</li>
                                ))}
                            </ul>
                        ) : (
                            <p style={{ whiteSpace: 'pre-line' }}>{question.realTimeUseCases}</p>
                        )}
                    </div>
                </div>
            )}
        </article>
    );
}
