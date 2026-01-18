import styles from './QuestionView.module.css';

interface QuestionProps {
    question: {
        title: string;
        answer: string;
        useCases?: string | null;
        realTimeUseCases?: string | null;
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
                        <p>{question.useCases}</p>
                    </div>
                </div>
            )}
            {question.realTimeUseCases && (
                <div className={styles.section}>
                    <div className={styles.label}>Real Time Use Cases</div>
                    <div className={styles.content}>
                        <p>{question.realTimeUseCases}</p>
                    </div>
                </div>
            )}
        </article>
    );
}
