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
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL and Key are required. Check your .env file.');
}
const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
function fetchAndLogGrades() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { data, error } = yield supabase
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
        }
        catch (err) {
            console.error('Unexpected error:', err);
        }
    });
}
fetchAndLogGrades();
