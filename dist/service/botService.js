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
function startBot(supabase) {
    const bot = new telegraf_1.Telegraf(process.env.BOT_TOKEN);
    bot.start((ctx) => __awaiter(this, void 0, void 0, function* () {
        yield ctx.reply("እንኳን ወደ ፍሬ ሃይማኖት ሰንበት ት/ቤት መጽሐፍት በሰላም መጡ🎉🎉............እባክዎን ያሉትን የክፍል ዝርዝር እስክናቀርብ በትእግስት ይጠብቁን!!! ", { parse_mode: "Markdown" });
        yield showGrades(ctx);
    }));
    bot.command("grade", (ctx) => __awaiter(this, void 0, void 0, function* () {
        yield showGrades(ctx);
    }));
    function showGrades(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // await ctx.reply('*Loading grades...* ⏳', { parse_mode: 'Markdown' });
                const grades = yield (0, supabaseService_1.fetchGrades)(supabase);
                console.log("Fetched grades:", grades);
                if (grades.length === 0) {
                    yield ctx.reply("ምንም ክፍል ማግኘት አልተቻለም!! ይቅርታ እንደገና ይሞክሩ!!");
                    return;
                }
                yield ctx.reply("እባክዎን የሚፈልጉትን ክፍል ይምረጡ!!📚", {
                    parse_mode: "Markdown",
                    reply_markup: {
                        inline_keyboard: grades.map((grade) => [
                            { text: grade, callback_data: `grade_${grade}` },
                        ]),
                    },
                });
            }
            catch (err) {
                console.error("Error fetching grades:", err);
                yield ctx.reply("An error occurred while fetching grades. Please try again later. ❌");
            }
        });
    }
    bot.action(/grade_(.+)/, (ctx) => __awaiter(this, void 0, void 0, function* () {
        const grade = ctx.match[1];
        console.log("Selected grade:", grade);
        try {
            // await ctx.reply(`*Fetching subjects for grade ${grade}...* ⏳`, { parse_mode: 'Markdown' });
            const subjects = yield (0, supabaseService_1.fetchSubjects)(supabase, grade);
            console.log("Fetched subjects:", subjects);
            if (subjects.length === 0) {
                yield ctx.reply("ምንም የትምህርት አይነት ማግኘት አልተቻለም!! ይቅርታ እንደገና ይሞክሩ!!");
                return;
            }
            yield ctx.reply("እባክዎን የሚፈልጉትን የትምህርት አይነት ይምረጡ!!📖", {
                parse_mode: "Markdown",
                reply_markup: {
                    inline_keyboard: subjects.map((subject) => [
                        { text: subject, callback_data: `subject_${subject}` },
                    ]),
                },
            });
        }
        catch (err) {
            console.error("Error fetching subjects:", err);
            yield ctx.reply("ችግር ስለተፈጠረ የትምህርት አይነት ማግኘት አልተቻለም!! ይቅርታ እንደገና ይሞክሩ!");
        }
    }));
    bot.action(/subject_(.+)/, (ctx) => __awaiter(this, void 0, void 0, function* () {
        const subject = ctx.match[1];
        console.log("Fetching books for subject:", subject);
        try {
            // await ctx.reply(`*Fetching books for subject ${subject}...* ⏳`, { parse_mode: 'Markdown' });
            const books = yield (0, supabaseService_1.fetchBooks)(supabase, subject);
            console.log("Fetched books:", books);
            if (books.length === 0) {
                yield ctx.reply("ምንም መጽሐፍ ማግኘት አልተቻለም!! ይቅርታ እንደገና ይሞክሩ!!");
                return;
            }
            yield ctx.reply("እባክዎን የሚፈልጉትን መጽሐፉን ይምረጡ!!📖", {
                parse_mode: "Markdown",
                reply_markup: {
                    inline_keyboard: books.map((book) => [
                        { text: book.name, callback_data: `book_${book.name}` },
                    ]),
                },
            });
        }
        catch (err) {
            console.error("Error fetching books:", err);
            yield ctx.reply("ችግር ስለተፈጠረ መጽሐፉን ማግኘት አልተቻለም!! ይቅርታ እንደገና ይሞክሩ!!");
        }
    }));
    bot.action(/book_(.+)/, (ctx) => __awaiter(this, void 0, void 0, function* () {
        const fileName = ctx.match[1];
        console.log("Selected book name:", fileName);
        try {
            const { data, error } = yield supabase
                .from("books")
                .select("file_path")
                .eq("name", fileName)
                .single();
            if (error || !data) {
                yield ctx.reply("ምንም መጽሐፉን ማግኘት አልተቻለም!! ይቅርታ እንደገና ይሞክሩ!!");
                return;
            }
            const filePath = data.file_path;
            console.log("Found file path:", filePath);
            yield (0, supabaseService_1.downloadFile)(supabase, filePath, ctx);
        }
        catch (err) {
            console.error("Error fetching or downloading the book:", err);
            yield ctx.reply("ችግር ስለተፈጠረ መጽሐፉን ማግኘት አልተቻለም!! ይቅርታ እንደገና ይሞክሩ!!");
        }
    }));
    bot.launch();
}
