const TelegramBot = require('node-telegram-bot-api');
const http = require('http');
const fs = require('fs');
const path = require('path');

// 1. INITIALIZATION
// Your unique Bot Token
const token = '8408610478:AAFYlXwQI7bzraVLjJRPFOvfMTOiAsWqcUM';
const bot = new TelegramBot(token, { polling: true });

// Your official Render URL
const WEB_APP_URL = "https://my-ad-market-bot.onrender.com";

// 2. POLLING ERROR HANDLER
// Prevents the bot from crashing during "409 Conflict" (VS Code vs Render)
bot.on('polling_error', (error) => {
    if (error.code === 'ETELEGRAM' && error.message.includes('409 Conflict')) {
        console.log("⚠️ Conflict: Bot is likely running on both Render and VS Code. Stop one!");
    } else {
        console.error(`[Polling Error] ${error.code}: ${error.message}`);
    }
});

// 3. MAIN MENU (START COMMAND)
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "✨ **Welcome to Myadmarket**\n\nVerified marketplace with Secure Escrow protection.", {
        parse_mode: 'Markdown',
        reply_markup: {
            keyboard: [
                [{ text: "🛒 Open Marketplace", web_app: { url: WEB_APP_URL } }],
                [{ text: "📢 List My Channel" }, { text: "⚖️ Active Escrow" }]
            ],
            resize_keyboard: true
        }
    });
});

// 4. BOT LOGIC
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    // Simple text response handling
    if (msg.text === "📢 List My Channel") {
        bot.sendMessage(chatId, "Please forward a message from your channel to verify ownership.");
    } else if (msg.text === "⚖️ Active Escrow") {
        bot.sendMessage(chatId, "🔒 Escrow Status: No active disputes. Funds are held securely.");
    }
});

// 5. WEB SERVER (Corrected for Render)
// This serves your index.html file to the Telegram Mini App
const server = http.createServer((req, res) => {
    const filePath = path.join(__dirname, 'index.html');

    fs.readFile(filePath, (err, content) => {
        if (err) {
            // If the file is missing, Render logs will tell us exactly where it looked
            console.error(`❌ Server Error: Could not find index.html at ${filePath}`);
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Error: index.html not found. Check folder structure.');
        } else {
            // Success: Serve the file
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content);
        }
    });
});

// Listen on Render's required port
const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
    console.log(`
🚀 Full-Stack Marketplace Bot: ONLINE
🌍 Web Server: Running on port ${PORT}
📂 Serving file: ${path.join(__dirname, 'index.html')}
    `);
});