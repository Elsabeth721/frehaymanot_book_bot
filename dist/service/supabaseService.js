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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchGrades = fetchGrades;
exports.fetchSubjects = fetchSubjects;
exports.fetchBooks = fetchBooks;
exports.downloadFile = downloadFile;
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
function fetchGrades() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Fetching grades...');
        const { data, error } = yield supabase
            .from('books')
            .select('grade');
        if (error) {
            console.error('Error fetching grades:', error);
            return [];
        }
        const uniqueGrades = [...new Set(data.map((item) => item.grade.replace(/"/g, '').trim()))];
        console.log('Unique grades:', uniqueGrades);
        return uniqueGrades;
    });
}
function fetchSubjects(grade) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Fetching subjects for grade:', grade);
        const { data, error } = yield supabase
            .from('books')
            .select('subject')
            .eq('grade', grade);
        if (error) {
            console.error('Error fetching subjects:', error);
            throw error;
        }
        console.log('Fetched subjects data:', data);
        const uniqueSubjects = [...new Set(data.map((item) => item.subject))];
        console.log('Unique subjects:', uniqueSubjects);
        return uniqueSubjects;
    });
}
function fetchBooks(subject) {
    return __awaiter(this, void 0, void 0, function* () {
        const { data, error } = yield supabase
            .from('books')
            .select('name, file_path')
            .eq('subject', subject);
        if (error) {
            console.error('Error fetching books:', error);
            throw error;
        }
        console.log('Fetched books data:', data);
        return data;
    });
}
const fileCache = new Map();
function downloadFile(filePath, ctx) {
    return __awaiter(this, void 0, void 0, function* () {
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
            const { data, error } = yield supabase.storage
                .from('book')
                .download(relativePath);
            if (error) {
                console.error('Error downloading file:', error);
                throw error;
            }
            console.log('File downloaded successfully:', relativePath);
            const fileBuffer = Buffer.from(yield data.arrayBuffer());
            fileCache.set(filePath, fileBuffer);
            ctx.replyWithDocument({ source: fileBuffer, filename: relativePath.split('/').pop() });
        }
        catch (err) {
            console.error('Error in downloadFile:', err);
            throw err;
        }
    });
}
