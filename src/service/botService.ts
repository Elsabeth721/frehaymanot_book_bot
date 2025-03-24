import { Telegraf } from "telegraf";
import {
  fetchGrades,
  fetchSubjects,
  fetchBooks,
  downloadFile,
} from "./supabaseService";
import { SupabaseClient } from "@supabase/supabase-js";

export function startBot(supabase: SupabaseClient) {
  const bot = new Telegraf(process.env.BOT_TOKEN!);

  bot.start(async (ctx) => {
    await ctx.reply(
      "እንኳን ወደ ፍሬ ሃይማኖት ሰንበት ት/ቤት መጽሐፍት በሰላም መጡ🎉🎉............እባክዎን ያሉትን የክፍል ዝርዝር እስክናቀርብ በትእግስት ይጠብቁን!!! ",
      { parse_mode: "Markdown" }
    );
    await showGrades(ctx);
  });

  bot.command("grade", async (ctx) => {
    await showGrades(ctx);
  });

  async function showGrades(ctx: any) {
    try {
      // await ctx.reply('*Loading grades...* ⏳', { parse_mode: 'Markdown' });

      const grades = await fetchGrades(supabase);
      console.log("Fetched grades:", grades);

      if (grades.length === 0) {
        await ctx.reply("ምንም ክፍል ማግኘት አልተቻለም!! ይቅርታ እንደገና ይሞክሩ!!");
        return;
      }

      await ctx.reply("እባክዎን የሚፈልጉትን ክፍል ይምረጡ!!📚", {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: grades.map((grade: string) => [
            { text: grade, callback_data: `grade_${grade}` },
          ]),
        },
      });
    } catch (err) {
      console.error("Error fetching grades:", err);
      await ctx.reply(
        "An error occurred while fetching grades. Please try again later. ❌"
      );
    }
  }

  bot.action(/grade_(.+)/, async (ctx) => {
    const grade = ctx.match[1];
    console.log("Selected grade:", grade);

    try {
      // await ctx.reply(`*Fetching subjects for grade ${grade}...* ⏳`, { parse_mode: 'Markdown' });

      const subjects = await fetchSubjects(supabase, grade);
      console.log("Fetched subjects:", subjects);

      if (subjects.length === 0) {
        await ctx.reply("ምንም የትምህርት አይነት ማግኘት አልተቻለም!! ይቅርታ እንደገና ይሞክሩ!!");
        return;
      }

      await ctx.reply("እባክዎን የሚፈልጉትን የትምህርት አይነት ይምረጡ!!📖", {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: subjects.map((subject: string) => [
            { text: subject, callback_data: `subject_${subject}` },
          ]),
        },
      });
    } catch (err) {
      console.error("Error fetching subjects:", err);
      await ctx.reply("ችግር ስለተፈጠረ የትምህርት አይነት ማግኘት አልተቻለም!! ይቅርታ እንደገና ይሞክሩ!");
    }
  });

  bot.action(/subject_(.+)/, async (ctx) => {
    const subject = ctx.match[1];
    console.log("Fetching books for subject:", subject);

    try {
      // await ctx.reply(`*Fetching books for subject ${subject}...* ⏳`, { parse_mode: 'Markdown' });
      const books = await fetchBooks(supabase, subject);
      console.log("Fetched books:", books);

      if (books.length === 0) {
        await ctx.reply("ምንም መጽሐፍ ማግኘት አልተቻለም!! ይቅርታ እንደገና ይሞክሩ!!");
        return;
      }

      await ctx.reply("እባክዎን የሚፈልጉትን መጽሐፉን ይምረጡ!!📖", {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: books.map((book) => [
            { text: book.name, callback_data: `book_${book.name}` },
          ]),
        },
      });
    } catch (err) {
      console.error("Error fetching books:", err);
      await ctx.reply("ችግር ስለተፈጠረ መጽሐፉን ማግኘት አልተቻለም!! ይቅርታ እንደገና ይሞክሩ!!");
    }
  });

  bot.action(/book_(.+)/, async (ctx) => {
    const fileName = ctx.match[1];
    console.log("Selected book name:", fileName);

    try {
      const { data, error } = await supabase
        .from("books")
        .select("file_path")
        .eq("name", fileName)
        .single();

      if (error || !data) {
        await ctx.reply("ምንም መጽሐፉን ማግኘት አልተቻለም!! ይቅርታ እንደገና ይሞክሩ!!");
        return;
      }

      const filePath = data.file_path;
      console.log("Found file path:", filePath);
      await downloadFile(supabase, filePath, ctx);
    } catch (err) {
      console.error("Error fetching or downloading the book:", err);
      await ctx.reply("ችግር ስለተፈጠረ መጽሐፉን ማግኘት አልተቻለም!! ይቅርታ እንደገና ይሞክሩ!!");
    }
  });

  bot.launch();
}
