const TelegramBot = require('node-telegram-bot-api');
const http = require('http');

const token = '8408610478:AAFYlXwQI7bzraVLjJRPFOvfMTOiAsWqcUM';
const bot = new TelegramBot(token, { polling: true });

let listings = []; 
let userState = {}; 

// 1. START COMMAND
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const opts = {
        reply_markup: {
            keyboard: [
                [{ text: "📢 List My Channel" }, { text: "🛒 Browse Ads" }],
                [{ text: "⚖️ Active Escrow Deals" }]
            ],
            resize_keyboard: true
        }
    };
    bot.sendMessage(chatId, "Welcome to Myadmarket.", { parse_mode: 'Markdown', ...opts });
});

// 2. CLEAN MESSAGE HANDLER (Prevents Syntax Errors)
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // A. Always handle the "Browse" menu first to keep it clean
    if (text === "🛒 Browse Ads") {
        if (listings.length === 0) {
            return bot.sendMessage(chatId, "The marketplace is empty.");
        }
        let menu = "📂 **Marketplace Listings:**\n\n";
        listings.forEach((l, i) => {
            menu += ${i + 1}. **${l.title}** (@${l.handle})\n📊 Subs: ${l.subs} | 💰 Price: ${l.price}\n\n;
        });
        return bot.sendMessage(chatId, menu, { parse_mode: 'Markdown' });
    }

    if (text === "⚖️ Active Escrow Deals") {
        return bot.sendMessage(chatId, "🔒 Escrow Protection: No active deals.");
    }

    // B. Handle the Listing Flow
    if (text === "📢 List My Channel") {
        userState[chatId] = { step: 'awaiting_forward' };
        return bot.sendMessage(chatId, "Please FORWARD a message from your channel now.");
    }

    // C. Step-by-Step Logic
    const state = userState[chatId]?.step;

    if (state === 'awaiting_forward' && msg.forward_from_chat) {
        const channel = msg.forward_from_chat;
        try {
            const count = await bot.getChatMemberCount(channel.id);
            userState[chatId] = { 
                step: 'awaiting_price', 
                tempData: { id: channel.id, title: channel.title, handle: channel.username, subs: count } 
            };
            return bot.sendMessage(chatId, `✅ **Verified!**\nNow, type your price (e.g. 100 TON):`);
        } catch (e) {
            return bot.sendMessage(chatId, "❌ Error: Bot must be admin in that channel.");
        }
    } 

    if (state === 'awaiting_price' && text && !text.startsWith('/')) {
        const finalData = { ...userState[chatId].tempData, price: text, owner: chatId };
        listings.push(finalData);
        delete userState[chatId];
        return bot.sendMessage(chatId, "🚀 Success! Your channel is listed.");
    }
});

// 3. RENDER PORT BINDING
http.createServer((req, res) => { res.writeHead(200); res.end("OK"); }).listen(process.env.PORT || 3000, "0.0.0.0");
