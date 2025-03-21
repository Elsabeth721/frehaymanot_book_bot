import { Telegraf } from 'telegraf';
import { fetchGrades, fetchSubjects, fetchBooks, downloadFile } from './supabaseService';
import { SupabaseClient } from '@supabase/supabase-js';

export function startBot(supabase: SupabaseClient) {
    const bot = new Telegraf(process.env.BOT_TOKEN!);

    bot.start(async (ctx) => {
        await ctx.reply('*Welcome!* 🎉 Please wait while I fetch the available grades...እንኳን ወደ በሰላም መጡ🎉🎉............እባክዎን ያሉትን የክፍል ዝርዝር እስክናቀርብ በትእግስት ይጠብቁን!!! ', { parse_mode: 'Markdown' });
        await showGrades(ctx);
    });

    bot.command('grade', async (ctx) => {
        await showGrades(ctx);
    });

    async function showGrades(ctx: any) {
        try {
            const grades = await fetchGrades(supabase);
            console.log('Fetched grades:', grades);

            if (grades.length === 0) {
                await ctx.reply('ምንም ክፍል ማግኘት አልተቻለም!! ይቅርታ እንደገና ይሞክሩ!!');
                return;
            }

            await ctx.reply('እባክዎን የሚፈልጉትን ክፍል ይምረጡ!!📚', {
                parse_mode: 'Markdown',
                reply_markup: {
                    keyboard: grades.map((grade: string) => [{ text: grade }]),
                    resize_keyboard: true,
                    one_time_keyboard: true,
                    input_field_placeholder: "ክፍል ይምረጡ......"
                },
            });
        } catch (err) {
            console.error('Error fetching grades:', err);
            await ctx.reply('An error occurred while fetching grades. Please try again later. ❌ችግር ስለተፈጠረ ክፍል ማግኘት አልተቻለም!! ይቅርታ እንደገና ይሞክሩ');
        }
    }

    bot.hears(/^(Grade\s\d+)$/, async (ctx) => {
        const grade = ctx.match[1];
        console.log('Selected grade:', grade);

        try {
            // await ctx.reply(`*Fetching subjects for ${grade}...* ⏳`, { parse_mode: 'Markdown' });

            const subjects = await fetchSubjects(supabase, grade);
            console.log('Fetched subjects: ', subjects);

            if (subjects.length === 0) {
                await ctx.reply('ምንም የትምህርት አይነት ማግኘት አልተቻለም!! ይቅርታ እንደገና ይሞክሩ!!');
                return;
            }

            await ctx.reply('እባክዎን የሚፈልጉትን የትምህርት አይነት ይምረጡ!!📖', {
                parse_mode: 'Markdown',
                reply_markup: {
                    keyboard: subjects.map((subject: string) => [{ text: subject }]),
                    resize_keyboard: true,
                    one_time_keyboard: true,
                    input_field_placeholder: "የትምህርት አይነት ይምረጡ.......📖"
                },
            });
        } catch (err) {
            console.error('Error fetching subjects:', err);
            await ctx.reply(' ችግር ስለተፈጠረ የትምህርት አይነት ማግኘት አልተቻለም!! ይቅርታ እንደገና ይሞክሩ');
        }
    });

    bot.hears(/^(.*)$/, async (ctx) => {
        const subject = ctx.match[1];
        console.log('Fetching books for subject:', subject);

        try {
            // await ctx.reply(`*Fetching books for ${subject}...* ⏳`, { parse_mode: 'Markdown' });

            const books = await fetchBooks(supabase, subject);
            console.log('Fetched books:', books);

            if (books.length === 0) {
                await ctx.reply('ይቅርታ ምንም መጽሐፍ ማግኘት አልተቻለም!!');
                return;
            }

            await ctx.reply('እባክዎን የሚፈልጉትን መጽሐፍ ይምረጡ!!📖', {
                parse_mode: 'Markdown',
                reply_markup: {
                    keyboard: books.map((book) => [{ text: book.name }]),
                    resize_keyboard: true,
                    one_time_keyboard: true,
                    input_field_placeholder: "መጽሐፍ ይምረጡ......."
                },
            });
        } catch (err) {
            console.error('Error fetching books:', err);
            await ctx.reply(' ችግር ስለተፈጠረ መጽሐፍ ማግኘት አልተቻለም!! ይቅርታ እንደገና ይሞክሩ');
        
        }
    });

    bot.hears(/^(.*)$/, async (ctx) => {
        const fileName = ctx.match[1];
        console.log('Selected file name:', fileName);

        try {
            await ctx.reply('መጽሐፉን በማቅረብ ላይ ስለሆንን እባክዎን በትግስት ይጠብቁን.........', { parse_mode: 'Markdown' });

            const { data, error } = await supabase
                .from('books')
                .select('file_path')
                .eq('name', fileName);

            if (error || !data || data.length === 0) {
                await ctx.reply('መጽሐፉን ማግኘት አልተቻለም!!');
                return;
            }

            const filePath = data[0].file_path;
            console.log('Downloading file:', filePath);

            await downloadFile(supabase, filePath, ctx);
        } catch (err) {
            console.error('Error downloading file:', err);
            await ctx.reply('ችግር ስለተፈጠረ መጽሐፉን ማውረድ አልተቻለም!! ይቅርታ እንደገና ይሞክሩ!');
        }
    });

    bot.launch();
}
