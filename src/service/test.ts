import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL and Key are required. Check your .env file.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchAndLogGrades() {
    try {
        const { data, error } = await supabase
            .from('books')
            .select('grade');

        if (error) {
            console.error('Error fetching grades:', error);
            return;
        }

        console.log('Fetched grades:', data);

        if (!data || data.length === 0) {
            console.warn('No grades found in the books table.');
            return;
        }

        const uniqueGrades = [...new Set(data.map((item) => item.grade))];
        console.log('Unique grades:', uniqueGrades);
    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

fetchAndLogGrades();