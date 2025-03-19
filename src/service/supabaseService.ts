import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

export async function fetchGrades(): Promise<string[]> {
    console.log('Fetching grades...'); 
    const { data, error } = await supabase
        .from('books')
        .select('grade');

    if (error) {
        console.error('Error fetching grades:', error);
        return [];
    }

    const uniqueGrades = [...new Set(data.map((item) => item.grade.replace(/"/g, '').trim()))];
    console.log('Unique grades:', uniqueGrades); 
    return uniqueGrades;
}

export async function fetchSubjects(grade: string): Promise<string[]> {
    console.log('Fetching subjects for grade:', grade); 

    const { data, error } = await supabase
        .from('books')
        .select('subject')
        .eq('grade', grade);

    if (error) {
        console.error('Error fetching subjects:', error);
        throw error;
    }

    console.log('Fetched subjects data:', data); 
    const uniqueSubjects = [...new Set(data.map((item: { subject: string }) => item.subject))];
    console.log('Unique subjects:', uniqueSubjects); 

    return uniqueSubjects;
}

export async function fetchBooks(subject: string): Promise<{ name: string; file_path: string }[]> {
    const { data, error } = await supabase
        .from('books')
        .select('name, file_path')
        .eq('subject', subject);

    if (error) {
        console.error('Error fetching books:', error);
        throw error;
    }

    console.log('Fetched books data:', data); 
    return data;
}

const fileCache = new Map();

export async function downloadFile(filePath: string, ctx: any): Promise<void> {
    try {
        // Check if the file is cached
        if (fileCache.has(filePath)) {
            console.log('Serving file from cache:', filePath); 
            const cachedFile = fileCache.get(filePath);
            ctx.replyWithDocument({ source: cachedFile, filename: filePath.split('/').pop() });
            return;
        }

        const url = new URL(filePath);
        const fullPath = url.pathname.split('/storage/v1/object/public/')[1];

        if (!fullPath) {
            throw new Error('Invalid file path. Could not extract relative path.');
        }

        const relativePath = fullPath.split('/').slice(1).join('/');

        console.log('Downloading file with relative path:', relativePath); 

        const { data, error } = await supabase.storage
            .from('book') 
            .download(relativePath);

        if (error) {
            console.error('Error downloading file:', error);
            throw error;
        }

        console.log('File downloaded successfully:', relativePath);

        const fileBuffer = Buffer.from(await data.arrayBuffer());
        fileCache.set(filePath, fileBuffer);

        ctx.replyWithDocument({ source: fileBuffer, filename: relativePath.split('/').pop() });
    } catch (err) {
        console.error('Error in downloadFile:', err);
        throw err;
    }
}