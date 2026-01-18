export default function SchemaJSON({ question }: { question: any }) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "QAPage",
        "mainEntity": {
            "@type": "Question",
            "name": question.title,
            "text": question.title,
            "answerCount": 1,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": question.answer,
                "upvoteCount": 0
            }
        }
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}
