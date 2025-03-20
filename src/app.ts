import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import express from 'express';
import { startBot } from './service/botService';

// Load environment variables
dotenv.config();

// Validate environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const botToken = process.env.BOT_TOKEN;

if (!supabaseUrl || !supabaseKey || !botToken) {
    throw new Error('Supabase URL, Key, and BOT_TOKEN are required. Check your .env file.');
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);
console.log('Supabase client initialized successfully.', supabase);

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Start the Express server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Start the bot
try {
    startBot(supabase); // Pass the supabase client to the bot
    console.log('Bot started successfully.');
} catch (err) {
    console.error('Error starting bot:', err);
    process.exit(1); // Exit with an error code
}