'use server';

import { getDB, saveDB, Category, Question } from './db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// --- Categories ---

export async function createCategory(formData: FormData) {
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');

    const db = await getDB();
    const newCat: Category = {
        id: Date.now(),
        name,
        slug,
        description,
        order: db.categories.length + 1
    };

    db.categories.push(newCat);
    await saveDB(db);
    revalidatePath('/');
    redirect('/admin/categories');
}

export async function deleteCategory(id: number) {
    const db = await getDB();
    db.categories = db.categories.filter(c => c.id !== id);
    db.questions = db.questions.filter(q => q.categoryId !== id);
    await saveDB(db);
    revalidatePath('/');
}

// --- Questions ---

export async function createQuestion(formData: FormData) {
    const title = formData.get('title') as string;
    const answer = formData.get('answer') as string;
    const categoryId = parseInt(formData.get('categoryId') as string);
    const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');

    const db = await getDB();
    const newQ: Question = {
        id: Date.now(),
        title,
        slug,
        answer,
        categoryId,
        displayOrder: db.questions.length + 1,
        useCases: formData.get('useCases') as string || undefined,
        realTimeUseCases: formData.get('realTimeUseCases') as string || undefined,
        imageUrl: formData.get('imageUrl') as string || undefined,
        codeSnippet: formData.get('codeSnippet') as string || undefined,
    };

    db.questions.push(newQ);
    await saveDB(db);
    // Revalidate category page
    const cat = db.categories.find(c => c.id === categoryId);
    if (cat) revalidatePath(`/${cat.slug}`);

    redirect('/admin/questions');
}

export async function deleteQuestion(id: number) {
    const db = await getDB();
    db.questions = db.questions.filter(q => q.id !== id);
    await saveDB(db);
    // Revalidate all?
    revalidatePath('/');
}
