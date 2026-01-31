const TelegramBot = require('node-telegram-bot-api');

// Your Telegram Bot Token
const token = process.env.BOT_TOKEN;

const bot = new TelegramBot(token, {
    polling: true,
    request: { agentOptions: { keepAlive: true, family: 4 } }
});

// The verified production link from your successful deployment
const webAppUrl = "https://my-ad-market-bvo19ivoy-nichole-godams-projects.vercel.app";

console.log("--- MyAdMarket: Verified Mode ---");
console.log("Status: ONLINE 🚀");

// 1. Handle  the /start command
bot.onText(/\/start/, function(msg) {
    bot.sendMessage(msg.chat.id, "Welcome to MyAdMarket! Browse or list your channel below:", {
        reply_markup: {
            keyboard: [[{
                text: "🛒 Open Marketplace",
                web_app: { url: webAppUrl }
            }]],
            resize_keyboard: true
        }
    });
});

// 2. The Verification Listener (Handles data from your Mini App)
bot.on('message', function(msg) {
    if (msg.web_app_data) {
        var data = JSON.parse(msg.web_app_data.data);
        
        if (data.action === "new_submission") {
            var user = msg.from.username || msg.from.first_name;
            var handle = data.channel.indexOf('@') === 0 ? data.channel : '@' + data.channel;
            
            // This pulls the real-time data you saw in your screenshot
            bot.getChat(handle).then(function(chat) {
                bot.getChatMemberCount(handle).then(function(count) {
                    
                    bot.sendMessage(msg.chat.id, "✅ **VERIFIED LISTING**\n\nChannel: " + chat.title + "\nReal Subs: " + count + "\n\nThank you @" + user + ", your listing is now live!");
                    
                    console.log("\n--- VERIFIED SELLER ALERT ---");
                    console.log("Channel: " + chat.title + " (" + handle + ")");
                    console.log("Verified Subs: " + count);
                    console.log("----------------------------\n");

  }).catch(function(err) {
      bot.sendMessage(msg.chat.id, "❌ Error: Could not get subscriber count.");
    });
  }).catch(function(err) {
    bot.sendMessage(msg.chat.id, "❌ **Verification Failed**\n\nI couldn't find the channel.");
  });
});

// --- RENDER HEALTH CHECK SERVER ---
const http = require('http');
http.createServer((req, res) => {
  res.writeHead(200);
  res.end("Bot is Alive");
 }).listen(process.env.PORT || 3000, "0.0.0.0");
