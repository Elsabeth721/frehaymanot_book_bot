"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const botService_1 = require("./service/botService");
dotenv_1.default.config();
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const botToken = process.env.BOT_TOKEN;
if (!supabaseUrl || !supabaseKey || !botToken) {
    throw new Error('Supabase URL, Key, and BOT_TOKEN are required. Check your .env file.');
}
const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
console.log('Supabase client initialized successfully.', supabase);
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 3000;
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
try {
    (0, botService_1.startBot)(supabase);
    console.log('Bot started successfully.');
}
catch (err) {
    console.error('Error starting bot:', err);
    process.exit(1);
}
