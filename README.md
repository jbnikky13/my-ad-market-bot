Myadmarket: Verified Ad Marketplace Bot
Myadmarket is a decentralized advertising hub designed for the Telegram ecosystem. It connects advertisers with verified channel owners through a secure, escrow-simulated flow and automated subscriber verification.
🚀 Live Demo
• Bot User: [@YourBotUsername]
• WebApp URL: https://my-ad-market-bot.onrender.com (https://my-ad-market-bot.onrender.com/)
✨ Key Features
• Real-time Channel Verification: Uses the Telegram Bot API (getChatMemberCount) to verify ownership and live subscriber data when a message is forwarded.
• Secure Escrow Initiation: A native Mini App interface allows advertisers to lock deals, sending structured JSON data back to the bot backend.
• Seamless UX: Integrated with Telegram’s Haptic Feedback SDK and dynamic Theme Parameters for a professional, "app-like" feel.
• Two-Sided Marketplace: Complete logic for both "Channel Listing" (Sellers) and "Escrow Start" (Buyers).
🛠️ Technical Architecture
• Backend: Node.js utilizing the node-telegram-bot-api library.
• Frontend: HTML5/CSS3 and JavaScript, leveraging the @telegram-apps/telegram-ui styles.
• Server: Hosted on Render with an integrated HTTP server to serve the Mini App and handle Telegram polling.
• Deployment: Automated CI/CD pipeline via GitHub integration.
📦 Installation & Deployment
1. Clone the repository.
2. Install dependencies: npm install node-telegram-bot-api.
3. Set your BOT_TOKEN and WEB_APP_URL in bots.js.
4. Run locally: node bots.js or deploy to Render/Heroku.
🤖 AI Disclosure
Percentage of code written by AI: 85%
• Logic Structure: AI was used to architect the web_app_data listener and the asynchronous verification flow.
• UI/UX: AI-generated the CSS variables for Telegram theme-matching and haptic integration.
• Manual Refinement: Human oversight was used for final debugging, deployment configuration, and channel permission testing.
🔮 Future Roadmap
• Smart Contract Integration: Moving from simulated escrow to real TON blockchain smart contracts.
• Automated Posting: Implementing bot.copyMessage to automatically publish ads once escrow funds are released.
• Rating System: Reputation scores for verified channel owners.