const TelegramBot = require('node-telegram-bot-api');
const http = require('http');
const fs = require('fs');
const path = require('path');

// 1. INITIALIZATION
const token = '8408610478:AAFYlXwQI7bzraVLjJRPFOvfMTOiAsWqcUM';
const bot = new TelegramBot(token, { polling: true });
const WEB_APP_URL = "https://my-ad-market-bot.onrender.com";

// 2. ERROR HANDLING
bot.on('polling_error', (error) => {
    console.log(`Polling error: ${error.message}`);
});

// 3. MAIN MENU
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

// 4. LOGIC
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    if (msg.text === "📢 List My Channel") {
        bot.sendMessage(chatId, "Please forward a message from your channel to verify ownership.");
    } else if (msg.text === "⚖️ Active Escrow") {
        bot.sendMessage(chatId, "🔒 Escrow Status: No active disputes. Funds are held securely.");
    }
});

// 5. SERVER
const server = http.createServer((req, res) => {
    const filePath = path.join(__dirname, 'index.html');
    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404);
            res.end('Error: index.html not found');
        } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
    console.log(`ONLINE on port ${PORT}`);
});