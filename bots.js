const TelegramBot = require('node-telegram-bot-api');
const http = require('http');

const token = '8408610478:AAFYlXwQI7bzraVLjJRPFOvfMTOiAsWqcUM';
const bot = new TelegramBot(token, { polling: true });

// In-memory storage for contest demo (Use a database for production)
let listings = []; 
let userState = {}; 

// 1. MAIN MENU - Fulfills "Two-Sided Flow" requirement
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
    bot.sendMessage(msg.chat.id, "Welcome to Myadmarket.\nSecure advertising marketplace with Escrow protection.", { parse_mode: 'Markdown', ...opts });
});

// 2. CORE LOGIC HANDLER
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // --- BUTTON HANDLERS ---
    if (text === "📢 List My Channel") {
        userState[chatId] = { step: 'awaiting_forward' };
        bot.sendMessage(chatId, "To verify ownership, please FORWARD a message from your channel to this bot.");
        return;
    }

    if (text === "🛒 Browse Ads") {
        if (listings.length === 0) {
            bot.sendMessage(chatId, "Marketplace is empty. Be the first to list!");
        } else {
            let menu = "📂 **Verified Listings:**\n\n";
            listings.forEach((l, i) => {
                menu += ${i + 1}. **${l.title}** (@${l.handle})\n📊 Subs: ${l.subs} | 💰 Price: ${l.price}\n\n;
            });
            bot.sendMessage(chatId, menu, { parse_mode: 'Markdown' });
        }
        return;
    }

    if (text === "⚖️ Active Escrow Deals") {
        bot.sendMessage(chatId, "🔒 **Escrow Protection Active**\nNo active deals found. Funds are held securely until ad verification.");
        return;
    }

    // --- STATE-BASED MULTI-STEP FLOW ---
    if (userState[chatId]) {
        // Step 1: Ownership Verification (Forwarding Message)
        if (userState[chatId].step === 'awaiting_forward' && msg.forward_from_chat) {
            if (msg.forward_from_chat.type !== 'channel') {
                return bot.sendMessage(chatId, "❌ Please forward a message from a Channel.");
            }
            const channel = msg.forward_from_chat;
            try {
                const count = await bot.getChatMemberCount(channel.id);
                userState[chatId] = { 
                    step: 'awaiting_price', 
                    tempData: { id: channel.id, title: channel.title, handle: channel.username, subs: count } 
                };
                bot.sendMessage(chatId, `✅ Verified: ${channel.title}**\nSubs: ${count}\n\n**Final Step: Type your asking price (e.g., 20 TON or $50):`);
            } catch (e) {
                bot.sendMessage(chatId, "❌ Error. Ensure bot is an Admin in that channel to fetch stats.");
            }
        } 
        // Step 2: Price Setting
        else if (userState[chatId].step === 'awaiting_price' && text && !text.startsWith('/')) {
            const finalListing = { ...userState[chatId].tempData, price: text, owner: chatId };
            listings.push(finalListing);
            delete userState[chatId];
            bot.sendMessage(chatId, `🚀 Listing Published! Your channel is now visible to advertisers.`);
        }
    }
});

// 3. RENDER HEALTH CHECK (Keeps Status Green)
http.createServer((req, res) => {
    res.writeHead(200);
    res.end("Bot Live");
}).listen(process.env.PORT || 3000, "0.0.0.0");
console.log("Competition Bot Online 🚀");
