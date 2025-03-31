# Telegram Book Bot

## Features
- Users can select their **grade**.
- Users can choose a **subject**.
- The bot fetches and sends the corresponding **PDF book**.
- Uses **Supabase** for cloud storage.
- Backend API built with **Hono.js**.

## Tech Stack
- **Node.js** (TypeScript)
- **Telegraf.js** (Telegram Bot Framework)
- **Hono.js** (Fast Web API)
- **Supabase** (Cloud storage for PDFs)
- **Multer** (File Uploads)

## Installation

### Clone the Repository
```sh
git clone https://github.com/yourusername/telegram-book-bot.git
cd telegram-book-bot
```

### Install Dependencies
```sh
npm install
```

### Setup Environment Variables
Create a `.env` file and add:
```env
BOT_TOKEN=your_telegram_bot_token
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_api_key
```

### Run the API Server
```sh
npx ts-node server.ts
```

### Start the Telegram Bot
```sh
npx ts-node bot.ts
```

## API Usage
Upload books using:
```sh
curl -X POST -F "grade=10" -F "subject=Math" -F "pdf=@book.pdf" http://localhost:3000/upload
```

## How It Works
1. Users start the bot and choose a **grade**.
2. They select a **subject**.
3. The bot retrieves the book from **Supabase** and sends the **PDF**.

## Deployment
- Deploy **Hono.js API** using Vercel.
- Deploy **Telegram Bot** using Railway or Render.

## License
MIT License.

## Contributions
Fork and improve the project!

## Contact
For issues, reach out via Telegram or GitHub Issues.
```

