const TelegramBot = require('node-telegram-bot-api');
const http = require('http');

const token = '8408610478:AAFYlXwQI7bzraVLjJRPFOvfMTOiAsWqcUM';
const bot = new TelegramBot(token, { polling: true });

// Data storage
let listings = []; 
let userState = {}; 

// 1. MAIN MENU
bot.onText(/\/start/, (msg) => {
    const opts = {
        reply_markup: {
            keyboard: [
                [{ text: "📢 List My Channel" }, { text: "🛒 Browse Ads" }],
                [{ text: "⚖️ Active Escrow Deals" }]
            ],
            resize_keyboard: true
        }
    };
    bot.sendMessage(msg.chat.id, "Welcome to Myadmarket.\nThe secure marketplace for Telegram advertising.", { parse_mode: 'Markdown', ...opts });
});

// 2. MESSAGE LOGIC
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Handle Buttons
    if (text === "📢 List My Channel") {
        userState[chatId] = { step: 'awaiting_forward' };
        bot.sendMessage(chatId, "To verify ownership, please FORWARD any message from your channel to this bot.");
        return;
    }

    if (text === "🛒 Browse Ads") {
        if (listings.length === 0) {
            bot.sendMessage(chatId, "The marketplace is currently empty.");
        } else {
            let menu = "📂 **Verified Marketplace Listings:**\n\n";
            listings.forEach((l, i) => {
                menu += ${i + 1}. **${l.title}** (@${l.handle})\n📊 Subs: ${l.subs} | 💰 Price: ${l.price}\n\n;
            });
            bot.sendMessage(chatId, menu, { parse_mode: 'Markdown' });
        }
        return;
    }

    if (text === "⚖️ Active Escrow Deals") {
        bot.sendMessage(chatId, "🔒 **Escrow Protection**\nStatus: Monitoring network...\n\nNo active deals found.");
        return;
    }

    // Handle Logic Steps
    if (userState[chatId]) {
        // Step 1: Verification via Forward
        if (userState[chatId].step === 'awaiting_forward' && msg.forward_from_chat) {
            const channel = msg.forward_from_chat;
            try {
                const count = await bot.getChatMemberCount(channel.id);
                userState[chatId] = { 
                    step: 'awaiting_price', 
                    tempData: { id: channel.id, title: channel.title, handle: channel.username, subs: count } 
                };
                bot.sendMessage(chatId, `✅ **Verified: ${channel.title}**\n\nType your price (e.g., 50 TON):`);
            } catch (e) {
                bot.sendMessage(chatId, "❌ Please make sure the bot is an admin in the channel first.");
            }
        } 
        // Step 2: Setting the Price
        else if (userState[chatId].step === 'awaiting_price' && text && !text.startsWith('/')) {
            const finalData = { ...userState[chatId].tempData, price: text, owner: chatId };
            listings.push(finalData);
            delete userState[chatId];
            bot.sendMessage(chatId, `🚀 Success! Your channel is now live in the marketplace.`);
        }
    }
});

// 3. HEALTH CHECK FOR RENDER (Keep this to avoid 409/Port errors)
http.createServer((req, res) => {
    res.writeHead(200);
    res.end("Bot is Alive");
}).listen(process.env.PORT || 3000, "0.0.0.0");

console.log("Status: ONLINE 🚀");
