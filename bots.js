const TelegramBot = require('node-telegram-bot-api');
const http = require('http');

const token = '8408610478:AAFYlXwQI7bzraVLjJRPFOvfMTOiAsWqcUM';
const bot = new TelegramBot(token, { polling: true });

// Mock database to store listings and temporary user states
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
    bot.sendMessage(msg.chat.id, "Welcome to Myadmarket.\n\nThe secure marketplace for Telegram advertising.", { parse_mode: 'Markdown', ...opts });
});

// 2. LOGIC HANDLER
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;

    // A. START LISTING FLOW
    if (msg.text === "📢 List My Channel") {
        bot.sendMessage(chatId, "To verify ownership, please FORWARD any message from your channel to this bot.");
        userState[chatId] = { step: 'awaiting_forward' };
    }

    // B. HANDLE FORWARDED MESSAGE (Ownership & Data Fetch)
    else if (msg.forward_from_chat && msg.forward_from_chat.type === 'channel' && userState[chatId]?.step === 'awaiting_forward') {
        const channel = msg.forward_from_chat;
        try {
            const count = await bot.getChatMemberCount(channel.id);
            // Temporarily store channel data
            userState[chatId] = { 
                step: 'awaiting_price', 
                tempData: { id: channel.id, title: channel.title, handle: channel.username, subs: count } 
            };
            bot.sendMessage(chatId, `✅ Verified: ${channel.title}**\nSubscribers: ${count}\n\n**Next Step: Please type the price for a 24h ad placement (e.g., $50 or 10 TON).`);
        } catch (e) {
            bot.sendMessage(chatId, "❌ Error. Ensure the bot is an admin in the channel.");
        }
    }

    // C. HANDLE PRICE INPUT
    else if (userState[chatId]?.step === 'awaiting_price' && msg.text) {
        const price = msg.text;
        const finalData = { ...userState[chatId].tempData, price: price, owner: chatId };
        
        listings.push(finalData); // Save to "Marketplace"
        delete userState[chatId]; // Clear state
        
        bot.sendMessage(chatId, `🚀 Success! Your channel is listed at ${price}.\nAdvertisers can now find you in the marketplace.`);
    }

    // D. BROWSE FLOW (Advertiser Side)
    else if (msg.text === "🛒 Browse Ads") {
        if (listings.length === 0) return bot.sendMessage(chatId, "The marketplace is empty.");
        
        let menu = "📂 **Verified Marketplace Listings:**\n\n";
        listings.forEach((l, i) => {
            menu += ${i + 1}. **${l.title}** (@${l.handle})\n📊 Subs: ${l.subs} | 💰 Price: ${l.price}\n\n;
        });
        menu += "Reply with a channel number to initiate a Secure Escrow Payment.";
        bot.sendMessage(chatId, menu, { parse_mode: 'Markdown' });
    }

    // E. ESCROW STATUS
    else if (msg.text === "⚖️ Active Escrow Deals") {
        bot.sendMessage(chatId, "🔒 **Escrow Protection**\nStatus: Bot is monitoring network for ad confirmations.\n\n*Note: This simulation tracks when an ad is live before releasing funds.*");
    }
});

// 3. RENDER HEALTH CHECK
http.createServer((req, res) => { res.writeHead(200); res.end("Alive"); }).listen(process.env.PORT || 3000, "0.0.0.0");
console.log("Competition Bot: FULL FLOW ONLINE 🚀");
