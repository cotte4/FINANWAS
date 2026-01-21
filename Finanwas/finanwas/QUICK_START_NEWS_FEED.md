# Quick Start: Financial News Feed

## 5-Minute Setup

### Step 1: Get API Key (2 minutes)
1. Go to https://newsapi.org/
2. Click "Get API Key"
3. Sign up (free)
4. Copy your API key

### Step 2: Configure (1 minute)
1. Open `.env.local` in your project root
2. Add this line:
   ```
   NEWS_API_KEY=paste_your_api_key_here
   ```
3. Save the file

### Step 3: Start Server (1 minute)
```bash
npm run dev
```

### Step 4: View (1 minute)
1. Open http://localhost:3000
2. Login to your account
3. Go to Dashboard
4. Scroll to "Noticias Financieras" widget
5. Browse news by tabs:
   - **Portfolio** (if you have stocks)
   - **Mercado** (Argentina business news)
   - **Crypto** (Bitcoin, Ethereum news)
   - **Economía** (General economic news)

## That's It!

The news feed is now working and will:
- ✅ Show personalized news based on your portfolio
- ✅ Update every 30 minutes automatically
- ✅ Cache news to save API calls
- ✅ Work on mobile and desktop

## Optional: Add Portfolio Assets

To see personalized portfolio news:
1. Go to Portfolio page
2. Add an asset with a ticker (e.g., "AAPL", "TSLA", "GOOGL")
3. Return to Dashboard
4. Click "Portfolio" tab in news widget
5. See news about your stocks

## Need Help?

- **Full Setup Guide**: See `NEWS_FEED_SETUP.md`
- **Testing Guide**: See `TEST_NEWS_FEED.md`
- **Implementation Details**: See `NEWS_FEED_SUMMARY.md`

## Troubleshooting

**"No hay noticias disponibles"**
→ Check if NEWS_API_KEY is in .env.local

**Widget not showing**
→ Check browser console for errors

**API errors**
→ Verify API key is valid at newsapi.org

## Free Tier Limits

- 100 requests per day
- Perfect for development and testing
- Upgrade to paid plan for production

Enjoy your financial news feed! 📰
