export default function SchemaJSON({ question }: { question: any }) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {
                        "@type": "ListItem",
                        "position": 1,
                        "name": "Home",
                        "item": "https://jobready.io"
                    },
                    {
                        "@type": "ListItem",
                        "position": 2,
                        "name": question.categorySlug, // Should ideally be Name, but Slug is what we have handy in this prop without passing more. 
                        "item": `https://jobready.io/${question.categorySlug}`
                    },
                    {
                        "@type": "ListItem",
                        "position": 3,
                        "name": question.title,
                        "item": `https://jobready.io/${question.categorySlug}/${question.slug}`
                    }
                ]
            },
            {
                "@type": "QAPage",
                "mainEntity": {
                    "@type": "Question",
                    "name": question.title,
                    "text": question.title,
                    "answerCount": 1,
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": question.answer, // Note: This might need markdown stripping for pure text, but schema.org allows HTML in some contexts.
                        "upvoteCount": 0
                    }
                }
            }
        ]
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}
