import { getQuestions } from '@/lib/db';
import { notFound } from 'next/navigation';
import QuestionView from '@/components/QuestionView';
import SchemaJSON from '@/components/SchemaJSON';

export default async function QuestionPage({ params }: { params: Promise<{ category: string; question: string }> }) {
    const { category: categorySlug, question: questionSlug } = await params;
    const questions = await getQuestions(categorySlug);
    const question = questions.find(q => q.slug === questionSlug.toLowerCase());

    if (!question) notFound();

    return (
        <>
            <SchemaJSON question={question} />
            <QuestionView question={question} />
        </>
    );
}
