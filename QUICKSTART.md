# Valence - Quick Start Guide

## Setup (5 minutes)

### 1. Generate NextAuth Secret
```bash
openssl rand -base64 32
```
Copy this value - you'll need it in step 3.

### 2. Get an LLM API Key

You need **at least one** of these:

**Option A: DeepSeek (Cheapest - Recommended for MVP)**
- Go to https://platform.deepseek.com/
- Create account and get API key
- Cost: ~$0.10 per 100 agents

**Option B: OpenAI**
- Go to https://platform.openai.com/api-keys
- Create API key
- Cost: ~$0.20 per 100 agents

**Option C: Anthropic Claude**
- Go to https://console.anthropic.com/
- Get API key
- Cost: ~$0.15 per 100 agents

### 3. Configure Environment

Edit `.env` file and update:

```bash
# Required
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/valence"
NEXTAUTH_SECRET="<paste-the-secret-from-step-1>"
NEXTAUTH_URL="http://localhost:3000"

# Add at least ONE of these:
DEEPSEEK_API_KEY="sk-..."
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-..."

# Optional (for Google OAuth)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

### 4. Set Up PostgreSQL

**Option A: Local PostgreSQL**
```bash
# Install PostgreSQL
brew install postgresql  # macOS
# or
sudo apt-get install postgresql  # Linux

# Start PostgreSQL
brew services start postgresql  # macOS
# or
sudo service postgresql start  # Linux

# Create database
createdb valence
```

**Option B: Cloud PostgreSQL (Easier)**

Use Neon (free tier):
1. Go to https://neon.tech/
2. Create free account
3. Create a new project
4. Copy connection string
5. Paste into `.env` as `DATABASE_URL`

### 5. Initialize Database

```bash
npm run db:push
```

You should see: "Your database is now in sync with your schema."

### 6. Start Development Server

```bash
npm run dev
```

Open http://localhost:3000

## Your First Simulation

1. **Sign In**: Click "Get Started" on homepage
2. **Create Simulation**: Click "New Simulation" on dashboard
3. **Fill Form**:
   - Title: "Test my SaaS pricing"
   - Tribe: "Indie Creators"
   - Stimulus: "We're launching a productivity tool for $29/month with unlimited projects..."
   - Agent Count: 50 (start small)
   - Try "Hater Mode" for brutal honesty
4. **Run**: Click "Run Simulation"
5. **Wait**: ~2-3 minutes for 50 agents
6. **Review Results**: See MFI score, objections, recommendations

## Understanding Results

### Market Fit Index (MFI)
- **80-100**: Strong fit, ship it
- **60-79**: Good fit, minor tweaks needed
- **40-59**: Weak fit, major changes required
- **0-39**: Poor fit, rethink the approach

### Key Metrics
- **Purchase Intent**: Will they actually buy?
- **Sentiment**: How do they feel about it?
- **Virality**: Will they tell others?

### Objections
Top reasons people won't buy. Fix these first.

### Recommendations
AI-generated specific actions to improve your product.

## Cost Tracking

Every simulation shows cost in the report. Typical costs:
- 50 agents: $0.05 - $0.15
- 100 agents: $0.10 - $0.30

The Bayesian sampler often stops early, saving 40-70% on costs.

## Troubleshooting

### "Database connection failed"
- Check PostgreSQL is running: `pg_isready`
- Verify `DATABASE_URL` in `.env`
- Try running `npm run db:push` again

### "Unauthorized" error
- Make sure you're signed in
- Clear cookies and sign in again
- Check `NEXTAUTH_SECRET` is set

### "LLM API error"
- Verify API key is correct
- Check you have credits/quota
- Try a different LLM provider

### Simulation stuck on "RUNNING"
- Check server logs in terminal
- Verify LLM API key works
- Try with fewer agents (30 minimum)

## Next Steps

### Add More Tribes
Edit `src/data/tribes.json` to add custom tribes for your industry.

### Customize Chaos Modes
Edit `src/lib/simulation/engine.ts` to add new stress tests.

### Build Frontend Pages
The MVP includes core architecture. You can add:
- Full simulation creation form (`/simulate/new`)
- Results page with charts (`/simulate/[id]`)
- Agent profiles view
- Timeline visualization

See the project structure in README.md for where to add files.

### Deploy to Production
```bash
# Build for production
npm run build

# Test production build
npm run start

# Deploy to Vercel
# Just push to GitHub and import to Vercel
```

## Architecture Overview

```
User creates simulation
  ↓
tRPC API creates DB record (status: QUEUED)
  ↓
Simulation engine starts (status: RUNNING)
  ↓
Generate N agents from tribe library
  ↓
For each agent:
  - Call LLM with agent profile + stimulus
  - Parse reaction (sentiment, intent, virality, objections)
  - Save to database
  - Check Bayesian sampler (should we stop early?)
  ↓
Aggregate all reactions
  ↓
Calculate MFI score
  ↓
Call Claude for analysis summary
  ↓
Save report (status: COMPLETE)
  ↓
User views results on dashboard
```

## Tips for Better Results

1. **Be Specific**: "We're selling X for $Y to solve Z" works better than vague descriptions
2. **Use Hater Mode**: Get brutal honesty about flaws
3. **Try Multiple Tribes**: Test with different audiences
4. **Iterate**: Run multiple simulations with tweaks
5. **Start Small**: Use 50 agents first, then scale to 100-300

## Support

Questions? Check:
- README.md for full documentation
- Source code comments
- GitHub issues (if public repo)

Happy simulating!
