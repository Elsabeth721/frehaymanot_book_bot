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
exports.fetchGrades = fetchGrades;
exports.fetchSubjects = fetchSubjects;
exports.fetchBooks = fetchBooks;
exports.downloadFile = downloadFile;
function fetchGrades(supabase) {
    return __awaiter(this, void 0, void 0, function* () {
        const { data, error } = yield supabase.from("books").select("grade");
        if (error) {
            console.error("Error fetching grades:", error);
            return [];
        }
        const uniqueGrades = [
            ...new Set(data.map((item) => item.grade.replace(/"/g, "").trim())),
        ];
        return uniqueGrades;
    });
}
function fetchSubjects(supabase, grade) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Fetching subjects for grade:", grade);
        const { data, error } = yield supabase
            .from("books")
            .select("subject")
            .eq("grade", grade);
        if (error) {
            console.error("Error fetching subjects:", error);
            throw error;
        }
        console.log("Fetched subjects data:", data);
        const uniqueSubjects = [
            ...new Set(data.map((item) => item.subject)),
        ];
        console.log("Unique subjects:", uniqueSubjects);
        return uniqueSubjects;
    });
}
function fetchBooks(supabase, subject) {
    return __awaiter(this, void 0, void 0, function* () {
        const { data, error } = yield supabase
            .from("books")
            .select("name, file_path")
            .eq("subject", subject);
        if (error) {
            console.error("Error fetching books:", error);
            throw error;
        }
        console.log("Fetched books data:", data);
        return data;
    });
}
const fileCache = new Map();
function downloadFile(supabase, filePath, ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield ctx.replyWithDocument(filePath);
        }
        catch (err) {
            console.error("Error in downloadFile:", err);
            yield ctx.reply("An error occurred while downloading the file. Please try again later. ❌");
        }
    });
}
