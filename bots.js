const TelegramBot = require('node-telegram-bot-api');
const http = require('http');
const fs = require('fs');
const path = require('path');

// 1. INITIALIZATION
const token = '8408610478:AAFYlXwQI7bzraVLjJRPFOvfMTOiAsWqcUM';
const bot = new TelegramBot(token, { polling: true });
const WEB_APP_URL = "https://my-ad-market-bot.onrender.com";

// 2. POLLING ERROR HANDLER
bot.on('polling_error', (error) => {
    if (error.code === 'ETELEGRAM' && error.message.includes('409 Conflict')) {
        console.log("⚠️ Conflict: Bot is running in two places. Stop one!");
    } else {
        console.error("Polling Error: " + error.code);
    }
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

// 4. COMPETITION BACKEND LOGIC
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;

    // Requirement: Verified channel data from Telegram
    if (msg.forward_from_chat && msg.forward_from_chat.type === 'channel') {
        try {
            const count = await bot.getChatMemberCount(msg.forward_from_chat.id);
            return bot.sendMessage(chatId, "✅ **Channel Verified!**\n\nName: " + msg.forward_from_chat.title + "\nSubscribers: " + count, { parse_mode: 'Markdown' });
        } catch (e) {
            return bot.sendMessage(chatId, "❌ Please add the bot as an admin in your channel first.");
        }
    }

    if (msg.text === "📢 List My Channel") {
        bot.sendMessage(chatId, "Please forward a message from your channel to verify ownership and subscriber data.");
    } else if (msg.text === "⚖️ Active Escrow") {
        bot.sendMessage(chatId, "🔒 Escrow Status: No active disputes. Funds are held in secure simulation.");
    }
});

// 5. ESCROW DATA LISTENER (Two-sided flow)
bot.on('web_app_data', (msg) => {
    const chatId = msg.chat.id;
    try {
        const data = JSON.parse(msg.web_app_data.data);
        if (data.action === "initiate_escrow") {
            bot.sendMessage(chatId, "⚖️ **Escrow Initiated**\n\nChannel: " + data.channel + "\nPrice: " + data.price + "\n\nNext: Send your ad creative for verification.");
        }
    } catch (e) {
        console.error("Data parse error");
    }
});

// 6. WEB SERVER
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
    console.log("SERVER ONLINE ON PORT " + PORT);
});