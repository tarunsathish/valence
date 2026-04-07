<div align="center">

# Valence

**Preview the future before you ship.**

Test ideas against synthetic reality with AI-powered digital twins.

[Getting Started](#getting-started) &middot; [Features](#features) &middot; [How It Works](#how-it-works) &middot; [Tech Stack](#tech-stack) &middot; [Roadmap](#roadmap)

</div>

---

Valence is a decision-simulation platform that generates digital twins of markets and organizations. Run "what-if" experiments with AI agents to see what real people would do — before committing resources.

Replace expensive focus groups and slow surveys with instant, scalable synthetic feedback. 100x cheaper than traditional market research.

## Features

- **4D Agent System** — Skeleton (demographics), Soul (psychographics), Shadow (market awareness), Memory (longitudinal learning)
- **Emotional State Engine** — Agents carry fear, excitement, trust, and stress levels that evolve over time
- **Social Graph Simulation** — Influencers, early adopters, contrarians, skeptics, and followers interact within tribes
- **Bayesian Adaptive Sampling** — Stops early when confident, reducing LLM costs by 40–70%
- **Multi-Model LLM Support** — DeepSeek for reactions, Claude for analysis, GPT-4 for creative tests
- **Timeline Projections** — Predicted outcomes at Day 7, 30, 90, and 365
- **Chaos Modes** — Stress-test with Hater Mode (max skepticism), Recession Mode (tight budgets), and Echo Chamber Mode (social influence)

## How It Works

```
You describe a product/idea
  → Valence generates AI agents from a tribe (Gen Z Gamers, Biohackers, etc.)
    → Each agent reacts based on their unique 4D profile
      → Bayesian sampling aggregates reactions efficiently
        → You get an MFI score, objections, recommendations, and timeline projections
```

### Market Fit Index (MFI)

The MFI score (0–100) tells you how well your idea resonates:

| Score | Meaning |
|-------|---------|
| 80–100 | Strong fit — ship it |
| 60–79 | Good fit — minor tweaks needed |
| 40–59 | Weak fit — major changes required |
| 0–39 | Poor fit — rethink the approach |

### Pre-Built Tribes

| Tribe | Age Range | Focus |
|-------|-----------|-------|
| Gen Z Gamers | 16–26 | Authenticity, competitive, meme culture |
| Biohackers | 25–45 | Science-driven optimization |
| Climate Activists | 18–55 | Environmentally conscious action |
| Corporate HR Managers | 30–55 | Employee wellbeing & goals |
| Indie Creators | 20–40 | Audience building & autonomy |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict mode) |
| Database | PostgreSQL + Prisma ORM |
| API | tRPC (end-to-end type safety) |
| Auth | NextAuth.js (Google + Email) |
| Styling | Tailwind CSS + Framer Motion |
| LLMs | DeepSeek, Anthropic Claude, OpenAI |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL (local or cloud — [Neon](https://neon.tech) and [Supabase](https://supabase.com) offer free tiers)
- At least one LLM API key (DeepSeek, OpenAI, or Anthropic)

### Setup

```bash
# Clone the repo
git clone https://github.com/tarunsathish/valence.git
cd valence

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Push database schema
npm run db:push

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to get started.

### Environment Variables

Copy `.env.example` to `.env` and fill in:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Yes | Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Yes | `http://localhost:3000` for dev |
| `DEEPSEEK_API_KEY` | At least one | Cheapest option (~$0.10/100 agents) |
| `OPENAI_API_KEY` | At least one | OpenAI API key |
| `ANTHROPIC_API_KEY` | At least one | Anthropic API key |
| `GOOGLE_CLIENT_ID` | No | For Google OAuth |
| `GOOGLE_CLIENT_SECRET` | No | For Google OAuth |

## Project Structure

```
valence/
├── prisma/
│   └── schema.prisma              # Database models
├── src/
│   ├── app/                       # Next.js App Router pages
│   │   ├── api/                   # tRPC + NextAuth API routes
│   │   ├── auth/                  # Sign-in page
│   │   ├── dashboard/             # Simulation dashboard
│   │   └── simulate/              # Create & view simulations
│   ├── components/ui/             # Reusable UI components
│   ├── data/tribes.json           # Tribe definitions
│   ├── lib/
│   │   ├── simulation/engine.ts   # Core simulation orchestrator
│   │   ├── tribes/generator.ts    # 4D agent generator
│   │   └── llm/client.ts         # Multi-model LLM client
│   ├── server/
│   │   ├── api/routers/           # tRPC route handlers
│   │   ├── auth.ts                # NextAuth config
│   │   └── db.ts                  # Prisma client
│   └── trpc/                      # tRPC client setup
├── .env.example
├── tailwind.config.ts
└── tsconfig.json
```

## Development

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # Run ESLint
npm run db:push      # Sync database schema
npm run db:studio    # Open Prisma Studio
```

## Cost Optimization

Valence is designed to minimize LLM spend:

- **Bayesian Sampling** stops early at 85% confidence
- **DeepSeek** is the default model at $0.20/1M tokens
- **Batch processing** with rate limit management
- Every simulation tracks its cost

| Agents | Typical Cost |
|--------|-------------|
| 50 | $0.05–$0.15 |
| 100 | $0.10–$0.30 |
| 300 | $0.30–$0.90 |

## Roadmap

### Current (MVP)
- [x] 4D Agent system with emotional states
- [x] 5 pre-built tribes with psychographic data
- [x] Bayesian adaptive sampling
- [x] Multi-model LLM support
- [x] Timeline projections (7/30/90/365 days)
- [x] tRPC API with full type safety
- [x] Authentication (Google + Email)
- [x] Dashboard & landing page

### Next
- [ ] Valence Twin — clone your customers from CRM data
- [ ] Valence Org — clone your workforce from HRIS
- [ ] Rival Compare Mode — test your product vs competitors
- [ ] Synthetic Focus Group — watch agents debate in real-time
- [ ] Advanced analytics dashboard
- [ ] Simulation replay

### Future
- [ ] Live social media ingestion
- [ ] PDF/image stimulus support
- [ ] Persistent longitudinal memory across runs
- [ ] Enterprise data clean-room
- [ ] Tribe marketplace

