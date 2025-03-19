import { Telegraf } from 'telegraf';
import { fetchGrades, fetchSubjects, fetchBooks, downloadFile } from './supabaseService';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

const bot = new Telegraf(process.env.BOT_TOKEN!);

bot.start(async (ctx) => {
    await ctx.reply('*Welcome!* 🎉 Please wait while I fetch the available grades...', { parse_mode: 'Markdown' });
    await showGrades(ctx);
});

bot.command('grade', async (ctx) => {
    await showGrades(ctx);
});

async function showGrades(ctx: any) {
    try {
        await ctx.reply('*Loading grades...* ⏳', { parse_mode: 'Markdown' });

        const grades = await fetchGrades();
        console.log('Fetched grades:', grades); 

        if (grades.length === 0) {
            await ctx.reply('No grades found. 😕');
            return;
        }

        await ctx.reply('*Please select a grade:* 📚', {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: grades.map((grade: string) => [{ text: grade, callback_data: `grade_${grade}` }]),
            },
        });
    } catch (err) {
        console.error('Error fetching grades:', err);
        await ctx.reply('An error occurred while fetching grades. Please try again later. ❌');
    }
}

bot.action(/grade_(.+)/, async (ctx) => {
    const grade = ctx.match[1];
    console.log('Selected grade:', grade); 

    try {
        await ctx.reply(`*Fetching subjects for grade ${grade}...* ⏳`, { parse_mode: 'Markdown' });

        const subjects = await fetchSubjects(grade);
        console.log('Fetched subjects:', subjects);

        if (subjects.length === 0) {
            await ctx.reply('No subjects found for this grade. 😕');
            return;
        }

        await ctx.reply('*Please select a subject:* 📖', {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: subjects.map((subject: string) => [{ text: subject, callback_data: `subject_${subject}` }]),
            },
        });
    } catch (err) {
        console.error('Error fetching subjects:', err);
        await ctx.reply('An error occurred while fetching subjects. Please try again later. ❌');
    }
});

bot.action(/subject_(.+)/, async (ctx) => {
    const subject = ctx.match[1];
    console.log('Fetching books for subject:', subject); 

    try {
        await ctx.reply(`*Fetching books for subject ${subject}...* ⏳`, { parse_mode: 'Markdown' });

        const books = await fetchBooks(subject);
        console.log('Fetched books:', books); 

        if (books.length === 0) {
            await ctx.reply('No books found for this subject. 😕');
            return;
        }

        await ctx.reply('*Please select a book:* 📘', {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: books.map((book) => [{ text: book.name, callback_data: `book_${book.name}` }]),
            },
        });
    } catch (err) {
        console.error('Error fetching books:', err);
        await ctx.reply('An error occurred while fetching books. Please try again later. ❌');
    }
});

bot.action(/book_(.+)/, async (ctx) => {
    const fileName = ctx.match[1];
    console.log('Selected file name:', fileName); 

    try {
        await ctx.reply('*Fetching the book...* ⏳', { parse_mode: 'Markdown' });

        const { data, error } = await supabase
            .from('books')
            .select('file_path')
            .eq('name', fileName);

        if (error || !data || data.length === 0) {
            await ctx.reply('No file found for this book. 😕');
            return;
        }

        const filePath = data[0].file_path;
        console.log('Downloading file:', filePath); 

        await downloadFile(filePath, ctx);
    } catch (err) {
        console.error('Error downloading file:', err);
        await ctx.reply('An error occurred while downloading the file. Please try again later. ❌');
    }
});

export function startBot() {
    bot.launch();
    console.log('Bot started successfully.'); 
}