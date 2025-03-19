"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
const botService_1 = require("./service/botService");
// Load environment variables
dotenv_1.default.config();
// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL and Key are required. Check your .env file.');
}
const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
console.log('Supabase client initialized successfully.', supabase);
(0, botService_1.startBot)();
