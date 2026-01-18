import { getQuestions } from '@/lib/db';
import { notFound } from 'next/navigation';
import QuestionView from '@/components/QuestionView';
import Modal from '@/components/Modal';

export default async function QuestionModal({ params }: { params: Promise<{ category: string; question: string }> }) {
    const { category: categorySlug, question: questionSlug } = await params;
    const questions = await getQuestions(categorySlug);
    const question = questions.find(q => q.slug === questionSlug.toLowerCase());

    if (!question) notFound();

    return (
        <Modal>
            <QuestionView question={question} />
        </Modal>
    );
}
