const TelegramBot = require('node-telegram-bot-api');
const token = '8408610478:AAFYlXwQI7bzraVLjJRPFOvfMTOiAsWqcUM';
const bot = new TelegramBot(token, {polling: true});

// Handle the /start command or verification logic
bot.onText(/\/start/, (msg) => {
  const handle = "@TheNameOfYourMarketChannel"; // Make sure this is correct

  bot.getChat(handle).then(function(chat) {
    bot.getChatMemberCount(handle).then(function(count) {
      bot.sendMessage(msg.chat.id, "✅ **VERIFIED LISTING**\n\nChannel: " + chat.title + "\nSubs: " + count);
      
      console.log("\n--- VERIFIED SELLER ALERT ---");
      console.log("Channel: " + chat.title);
      console.log("Verified Subs: " + count);
      console.log("-----------------------------\n");
      
    }).catch(function(err) {
      bot.sendMessage(msg.chat.id, "❌ Error: Could not get subscriber count.");
    });
  }).catch(function(err) {
    bot.sendMessage(msg.chat.id, "❌ **Verification Failed**\n\nI couldn't find the channel.");
  });
});

// --- RENDER HEALTH CHECK SERVER ---
// This part is REQUIRED for Render to show "Live"
const http = require('http');
http.createServer((req, res) => {
  res.writeHead(200);
  res.end("Bot is Alive");
}).listen(process.env.PORT || 3000, "0.0.0.0");

console.log("Status: ONLINE 🚀");

