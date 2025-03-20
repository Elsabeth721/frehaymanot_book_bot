import { SupabaseClient } from '@supabase/supabase-js';

export async function fetchGrades(supabase: SupabaseClient): Promise<string[]> {
    const { data, error } = await supabase
        .from('books')
        .select('grade');

    if (error) {
        console.error('Error fetching grades:', error);
        return [];
    }

    // Clean up the grades by removing double quotes and trimming spaces
    const uniqueGrades = [...new Set(data.map((item: { grade: string }) => item.grade.replace(/"/g, '').trim()))];
    return uniqueGrades;
}

export async function fetchSubjects(supabase: SupabaseClient, grade: string): Promise<string[]> {
    const { data, error } = await supabase
        .from('books')
        .select('subject')
        .eq('grade', grade);

    if (error) {
        console.error('Error fetching subjects:', error);
        throw error;
    }

    // Extract unique subjects
    const uniqueSubjects = [...new Set(data.map((item: { subject: string }) => item.subject))];
    return uniqueSubjects;
}

export async function fetchBooks(supabase: SupabaseClient, subject: string): Promise<{ name: string; file_path: string }[]> {
    const { data, error } = await supabase
        .from('books')
        .select('name, file_path')
        .eq('subject', subject);

    if (error) {
        console.error('Error fetching books:', error);
        throw error;
    }

    return data;
}

export async function downloadFile(supabase: SupabaseClient, filePath: string, ctx: any): Promise<void> {
    try {
        const { data, error } = await supabase.storage
            .from('book')
            .download(filePath);

        if (error) {
            console.error('Error downloading file:', error);
            throw error;
        }

        const fileStream = data.stream();
        await ctx.replyWithDocument({ source: fileStream, filename: filePath.split('/').pop() });
    } catch (err) {
        console.error('Error downloading file:', err);
        throw err;
    }
}