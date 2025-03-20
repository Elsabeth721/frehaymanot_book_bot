"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startBot = startBot;
const telegraf_1 = require("telegraf");
const supabaseService_1 = require("./supabaseService");
const supabase_js_1 = require("@supabase/supabase-js");
const supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const bot = new telegraf_1.Telegraf(process.env.BOT_TOKEN);
bot.start((ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.reply('*Welcome!* 🎉 Please wait while I fetch the available grades...', { parse_mode: 'Markdown' });
    yield showGrades(ctx);
}));
bot.command('grade', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield showGrades(ctx);
}));
function showGrades(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield ctx.reply('*Loading grades...* ⏳', { parse_mode: 'Markdown' });
            const grades = yield (0, supabaseService_1.fetchGrades)();
            console.log('Fetched grades:', grades);
            if (grades.length === 0) {
                yield ctx.reply('No grades found. 😕');
                return;
            }
            yield ctx.reply('*Please select a grade:* 📚', {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: grades.map((grade) => [{ text: grade, callback_data: `grade_${grade}` }]),
                },
            });
        }
        catch (err) {
            console.error('Error fetching grades:', err);
            yield ctx.reply('An error occurred while fetching grades. Please try again later. ❌');
        }
    });
}
bot.action(/grade_(.+)/, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const grade = ctx.match[1];
    console.log('Selected grade:', grade);
    try {
        yield ctx.reply(`*Fetching subjects for grade ${grade}...* ⏳`, { parse_mode: 'Markdown' });
        const subjects = yield (0, supabaseService_1.fetchSubjects)(grade);
        console.log('Fetched subjects:', subjects);
        if (subjects.length === 0) {
            yield ctx.reply('No subjects found for this grade. 😕');
            return;
        }
        yield ctx.reply('*Please select a subject:* 📖', {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: subjects.map((subject) => [{ text: subject, callback_data: `subject_${subject}` }]),
            },
        });
    }
    catch (err) {
        console.error('Error fetching subjects:', err);
        yield ctx.reply('An error occurred while fetching subjects. Please try again later. ❌');
    }
}));
bot.action(/subject_(.+)/, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const subject = ctx.match[1];
    console.log('Fetching books for subject:', subject);
    try {
        yield ctx.reply(`*Fetching books for subject ${subject}...* ⏳`, { parse_mode: 'Markdown' });
        const books = yield (0, supabaseService_1.fetchBooks)(subject);
        console.log('Fetched books:', books);
        if (books.length === 0) {
            yield ctx.reply('No books found for this subject. 😕');
            return;
        }
        yield ctx.reply('*Please select a book:* 📘', {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: books.map((book) => [{ text: book.name, callback_data: `book_${book.name}` }]),
            },
        });
    }
    catch (err) {
        console.error('Error fetching books:', err);
        yield ctx.reply('An error occurred while fetching books. Please try again later. ❌');
    }
}));
bot.action(/book_(.+)/, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const fileName = ctx.match[1];
    console.log('Selected file name:', fileName);
    try {
        yield ctx.reply('*Fetching the book...* ⏳', { parse_mode: 'Markdown' });
        const { data, error } = yield supabase
            .from('books')
            .select('file_path')
            .eq('name', fileName);
        if (error || !data || data.length === 0) {
            yield ctx.reply('No file found for this book. 😕');
            return;
        }
        const filePath = data[0].file_path;
        console.log('Downloading file:', filePath);
        yield (0, supabaseService_1.downloadFile)(filePath, ctx);
    }
    catch (err) {
        console.error('Error downloading file:', err);
        yield ctx.reply('An error occurred while downloading the file. Please try again later. ❌');
    }
}));
function startBot() {
    bot.launch();
    console.log('Bot started successfully.');
}
