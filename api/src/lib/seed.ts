import { getProjectsClient, getBacklogClient, getTombstones } from "./storage.js";

// Bump this whenever PROJECTS/BACKLOG below change — the API reseeds once per version.
export const SEED_VERSION = "2026-09-04-areas-v4";

interface ProjectSeed {
  name: string;
  area: string; // Trading | Learning | Productivity | Infrastructure | Personal & Faith
  url: string;
  github: string;
  purpose: string;
  stack: string;
  status: string; // live | paper | local | repo-only | archived
  cost: string;
  category: string;
  details: string; // newline-separated bullet points
}

const PROJECTS: ProjectSeed[] = [
  // ─── DAY TRADE ALGO (THE CURRENT FOCUS) ─────────────────────
  {
    name: "DTSWAI — Day Trading Stocks With Algo",
    url: "https://wonderful-stone-02fa9530f.7.azurestaticapps.net",
    github: "https://github.com/AzharM82/DTSWAI",
    purpose: "THE day-trade system, LIVE with real money since 2026-07-30. Hybrid model: DESKTOP1 chart-truth scanner emits alerts only; operator executes manually from the portal Orders page with optional 1:1 fan-out to ~23 live Alpaca subscribers.",
    stack: "Python Azure Functions, React 19 + Vite portal, Alpaca API (master + subscribers), Azure Table Storage + Queue, WhatsApp sidecar, Google Sign-In auth",
    status: "live",
    cost: "$0/mo",
    category: "Day Trade Algo",
    area: "Trading",
    details: [
      "Hybrid pivot deployed 2026-07-26 (PR #6): scanner never trades — 10-min timeframe + after-hours 1–5 PM PT session POSTs to /api/scanner-alert; operator places orders via /api/manual-order",
      "Master flipped to LIVE / real money 2026-07-30 (Alpaca account 7311 LLC, PAPER_MODE=false); paper subscriber keys stripped, ~23 subscribers self-onboarded live keys, fanout_enabled=true",
      "Fully automatic subscriber onboarding via one admin HTTP call (2026-08-03); order-lifecycle hardening closed 12 audit gaps (2026-08-04)",
      "Specific-lot identification for sells (2026-08-13→16, PRs #8–#14): sell ticket picks the lot, sell_lot_policy lowest_cost default",
      "Infra: dtswai-func + dtswaistore in rg-stockagenthub; portal SWA dtswai-portal; scanner code source of truth = dev/screening-machine",
      "DO NOT run setup_desktop1_automation.ps1 — it re-registers the retired 3-scan schedule and kills the live 10-min one",
    ].join("\n"),
  },

  // ─── AUTO-EXECUTION ──────────────────────────────────────────
  {
    name: "StockAgentHub — Options Alerts → Robinhood (repurposed)",
    url: "https://jolly-bush-02b86570f.4.azurestaticapps.net",
    github: "https://github.com/AzharM82/StockAgentHub",
    purpose: "Was the flagship Schwab stock-swing bot (V3, live 2026-04-24). Being repurposed since 2026-07-24: DESKTOP2 options alerts → cloud sizing/gates → local Claude Agent-SDK executor on DESKTOP2 placing long options on Robinhood.",
    stack: "Python Azure Functions, React journal (Microsoft AAD), Azure Table Storage, Robinhood Trading MCP, Claude Agent SDK executor, Pushover",
    status: "paper",
    cost: "$0/mo",
    category: "Auto-Execution",
    area: "Trading",
    details: [
      "V3 stocks pipeline (deterministic TOS Reversal port, no AI in hot path) and ODT V4 options pipeline are being retired in favour of the options-alert flow",
      "Locked rules Q1–Q7 (2026-07-26): entry on fresh REV U alert, sizing by stop-loss $, marketable-limit near ask, exits = premium SL / +30% TP / REV D / EOD 15:50 ET, re-entry allowed, NO safety net by operator choice",
      "Branch feat/desktop2-options-integration built, NOT deployed; executor + Dashboard/Trades pages pending",
      "Schwab refresh token still 7-day expiry (scripts/schwab_oauth.py) until V3 is fully retired",
      "Infra: stockagenthub-func + stockagenthubstore in rg-stockagenthub",
    ].join("\n"),
  },
  {
    name: "SwingTraderAI",
    url: "",
    github: "https://github.com/AzharM82/SwingTraderAI",
    purpose:
      "AI swing-trade identification (no execution) — 2–5 day stock holds on daily charts. Built, never deployed to Azure.",
    stack: "Python 3.11 Azure Functions, React 19 journal, Schwab API (daily candles), Claude Haiku ranker",
    status: "repo-only",
    cost: "$0/mo",
    category: "Auto-Execution",
    area: "Trading",
    details: [
      "Pipeline: TOS scanner email → chart analyzer (ZigZag + breakout) → Claude Haiku ranks top 3 → email report + paper position tracking",
      "Daily scan 3:30 PM ET, position check 4:15 PM ET; max 3 positions, 5-day max hold, stocks only",
      "Strategies: ZigZag U1/D1 reversal, Minervini Stage 2, Breakout/Pullback, Episodic Pivot",
      "Parked at Phase 7 (Azure RG rg-swingtrader never created)",
    ].join("\n"),
  },

  // ─── SCANNERS & SIGNALS ──────────────────────────────────────
  {
    name: "MultiTimeframe Reversal Scanner (MTF)",
    url: "https://salmon-river-0a7a0c30f.1.azurestaticapps.net",
    github: "https://github.com/AzharM82/multitimeframerev",
    purpose: "The main trading portal (v2, financial-newspaper theme): AVWAP Swing, Bull List paper algo, Day Trades, ATR Matrix, Sector Desk, Rotation, SPY Conviction, Opening Drive, AVWAP-from-Earnings, Trade Journal, Chart Analysis, Unusual Options, Screeners, and Should-I-Be-Trading consolidation.",
    stack: "React 19, Vite 6, Tailwind 4, Node Azure Functions, Polygon.io, FinViz Elite, Alpaca IEX, TradingView webhooks, Outlook IMAP, Gmail SMTP, WhatsApp sidecar, Azure Tables + Queue + Blob, mtfrev-cron Function App",
    status: "live",
    cost: "$16/mo",
    category: "Scanners & Signals",
    area: "Trading",
    details: [
      "AVWAP Swing Scanner: 4:15 PM ET EOD scan, anchors at ATH / 52W / YTD / swing low; Pullback / Pinch / Reclaim; top 30 emailed nightly",
      "Bull List: hourly IMAP poll of D-Bull-Sig TOS alerts → entry/SL/TP via ZigZag → paper-tracked; known gaps before live capital (sizing, R filter, concurrency cap)",
      "ATR Matrix: @SteveDJacobs extension framework over S&P 500 + NDX, A–G grades, 0–100 setup score, Market Posture gauge; cron 4:30 PM ET",
      "Sector Desk + Index Leaders (LIVE 2026-08-05) and Rotation on FinViz real-time (LIVE 2026-08-14): one unfiltered export = whole market in <1s",
      "SPY Conviction Score (LIVE 2026-08-12, alerts-only): six-leg 10-min TradingView indicator emits ARM/BUY/HOLD/REDUCE/SELL decisions; portal records + notifies via /api/spy-conviction",
      "Opening Drive (SMB PMH-break, Alpaca IEX): 29-day backtest ≈ breakeven; deployed 2% structural stop; edge needs discretion or a catalyst feed",
      "AVWAP from Earnings (LIVE 2026-08-16): four chart-read levels swept from DESKTOP2 per 39m candle; cross alerts go to phone — never test with a crossing payload",
      "Trade Journal tab (LIVE 2026-08-08): closed-trades-only, exit-date P&L, local SnapTrade sync 17:30 daily",
      "Portal consolidation (branch feat/portal-consolidation, 2026-07-17): merging Should-I-Be-Trading + Market Metrics screeners + sector rotation + calculators, Google sign-in (would break 5 machine callers)",
      "Cron: mtfrev-cron (Windows Consumption); lesson from Opening Drive: swa deploy ships the working tree — commit before deploying",
    ].join("\n"),
  },
  {
    name: "TOS Reversal Scanner (chart-truth OCR)",
    url: "",
    github: "https://github.com/AzharM82/tos-reversal-scanner",
    purpose:
      "Local pipeline running on DESKTOP1: Finviz screener → load each ticker into TOS → OCR the Azhar_Reversal label strip → WhatsApp + portal alert on fresh up-reversals. The 'chart truth' signal engine.",
    stack: "Python, Tesseract OCR, Win32 GUI automation, Finviz Elite, ThinkOrSwim, WhatsApp sidecar",
    status: "local",
    cost: "$0/mo",
    category: "Scanners & Signals",
    area: "Trading",
    details: [
      "Born from the principle that the reversal must come off the actual TOS chart — no server-side re-derivation trusted",
      "OCR sanity guard rejects readings >20% off; posts ticker + buy/SL/TP to the MTF portal AlertLog (channel=scanner)",
      "Runs via Windows Task Scheduler on DESKTOP1 (D:\\Dev\\tos-reversal-scanner); copy lives in MTF tools/chart-ocr",
      "Its extracted, independent twin is the DTSWAI scanner/ (coexists via shared GUI mutex Global\\DTSWAI_TOS + offset schedules)",
    ].join("\n"),
  },
  {
    name: "TradingView MCP + Alerts",
    url: "",
    github: "https://github.com/AzharM82/tradingview-mcp",
    purpose:
      "78-tool MCP server that reads/controls TradingView Desktop over CDP, plus a personal Pushover alert system built on it (Saty Phase Oscillator black-dot watcher included).",
    stack: "Node MCP server, Chrome DevTools Protocol, TradingView Desktop, Pushover",
    status: "local",
    cost: "$0/mo",
    category: "Scanners & Signals",
    area: "Trading",
    details: [
      "Reads chart state, per-bar indicator plots, OHLCV; Pine compile/debug; replay; screenshots; watchlists; alerts",
      "Page-context chart-model technique reads PER-BAR history of any custom indicator's plots — enables watchlist sweeps (used for the SwingHub ATR strategy scan)",
      "tradingview-alerts repo: personal Pushover alerts driven through this bridge",
    ].join("\n"),
  },
  {
    name: "OpenClaw + Ollama TOS Monitor",
    url: "",
    github: "",
    purpose:
      "Original local reversal monitor: OpenClaw with free local Ollama models watches TOS and alerts via Telegram + WhatsApp. Zero API fees.",
    stack: "OpenClaw, Ollama (llama3.1:8b + llama3.2-vision:11b), Python, Windows Task Scheduler, Telegram, WhatsApp",
    status: "local",
    cost: "$0/mo",
    category: "Scanners & Signals",
    area: "Trading",
    details: [
      "Runs every 10 min during market hours via Task Scheduler",
      "Telegram channel @BabaTraBot; vision model reads the TOS chart locally — no cloud LLM cost",
    ].join("\n"),
  },
  {
    name: "OpenClaw Reversal Scanner (vision)",
    url: "",
    github: "https://github.com/AzharM82/openclaw-reversal",
    purpose:
      "Watchlist-driven Claude Vision scanner — walked TOS LargeCap-Calls/Puts row by row detecting fresh green Reversal bubbles. Worked, but superseded by the deterministic V3 port + OCR scanner.",
    stack: "Python, Claude Sonnet Vision, Win32 automation, Telegram",
    status: "archived",
    cost: "$0/mo",
    category: "Scanners & Signals",
    area: "Trading",
    details: [
      "Verified hits (BA, TSM) but ~$40/wk vision tokens and drift on overlapping labels",
      "Phase 2A endpoint /api/openclaw-signal still exists on stockagenthub-func (log-only)",
      "Hard-earned lessons preserved: hardcoded coords beat vision for locating, balanced-bracket JSON extraction, click the RIGHT side of watchlists",
    ].join("\n"),
  },

  // ─── DECISION DASHBOARDS ─────────────────────────────────────
  {
    name: "Should I Be Trading",
    url: "https://yellow-grass-099796a0f.4.azurestaticapps.net",
    github: "https://github.com/AzharM82/should-i-be-trading",
    purpose:
      "Bloomberg-style go/no-go dashboard: YES/CAUTION/NO decision with 0–100 Quality Score + separate Execution Window Score. Candidate regime filter for the Day Trade Algo.",
    stack: "React 19, Vite 6, Tailwind 4, Node Azure Functions, Polygon.io, FinViz Elite, Yahoo Finance",
    status: "live",
    cost: "$0/mo",
    category: "Decision Dashboards",
    area: "Trading",
    details: [
      "Single API /api/market-score?mode=swing|day — Volatility 25% + Momentum 25% + Trend 20% + Breadth 20% + Macro 10%",
      "Decision: ≥65 YES, 40–64 CAUTION, <40 NO; hard overrides VIX>35→NO, SPY<200MA + breadth<30→NO",
      "Execution Window Score: breakouts holding, pullbacks bought, follow-through",
      "Auto-refresh 45s during market hours; VIX/TNX/DXY from Yahoo (Polygon plan lacks indices)",
    ].join("\n"),
  },
  {
    name: "Sector Rotation Dashboard",
    url: "https://ambitious-forest-011e9520f.2.azurestaticapps.net",
    github: "https://github.com/AzharM82/sector-rotation",
    purpose:
      "Visual sector-rotation explorer — SectorTree, CirclePacking market map, inline StockDetail. Google OAuth, light/dark theme.",
    stack: "React 19, Vite 7, Tailwind, Python Azure Functions, Polygon.io, Redis, Google OAuth",
    status: "live",
    cost: "$0/mo",
    category: "Decision Dashboards",
    area: "Trading",
    details: [
      "APIs: /api/quotes (30s cache), /api/performance (5min), /api/weekly-history (10min)",
      "Redis shared with MTF project; in-memory fallback",
    ].join("\n"),
  },
  {
    name: "Pre-Market Brief",
    url: "https://nice-smoke-05cd8fc0f.7.azurestaticapps.net",
    github: "https://github.com/AzharM82/premarket-brief",
    purpose:
      "Daily 6:15 AM PT AI-narrated pre-market email + private site: themes, top-10 SP500/NDX gainers & losers with one-line whys, week-ahead earnings preview.",
    stack: "React 19, Vite 7, Node Azure Functions, FinViz Elite, Polygon.io, Claude Sonnet, Gmail SMTP, GitHub Actions cron",
    status: "live",
    cost: "~$1/mo AI",
    category: "Decision Dashboards",
    area: "Trading",
    details: [
      "Claude emits structured brief via tools: themes cluster + per-ticker {pct, sector, float, ATR, cap, tag, why ≤140 chars from the actual headline}",
      "Week-ahead: top 30 earnings by cap, 12–18 curated rows with BMO/AMC timing and why-watch",
      "~$0.05/brief in tokens; GitHub Actions cron (SWA timers unreliable on Free tier)",
    ].join("\n"),
  },
  {
    name: "IBD Newsletter Analysis",
    url: "",
    github: "https://github.com/AzharM82/ibd-newsletter-analysis",
    purpose:
      "Weekly IBD newsletter top-5 watchlist with deep-research technical analysis — support, resistance, and target per pick.",
    stack: "Claude deep research, Python",
    status: "local",
    cost: "$0/mo",
    category: "Decision Dashboards",
    area: "Trading",
    details: ["Weekly cadence; output feeds the swing watchlist"].join("\n"),
  },
  {
    name: "Jeff's AI Trading Coach",
    url: "",
    github: "https://github.com/AzharM82/JeffsAIAgent",
    purpose:
      "Weekly AI trading coach grounded in Jeff Sun's process — reads your trades, enriches with Polygon + TradingView data, grades them against principles distilled from jfsrev.substack.com.",
    stack: "Claude, Polygon.io, TradingView MCP",
    status: "local",
    cost: "$0/mo",
    category: "Decision Dashboards",
    area: "Trading",
    details: ["Post-trade review loop — pairs with the SnapTrade journal once the Day Trade Algo is live"].join("\n"),
  },

  // ─── JOURNALS ────────────────────────────────────────────────
  {
    name: "Trading Journal & Lessons",
    url: "https://purple-forest-0e07c220f.7.azurestaticapps.net",
    github: "https://github.com/AzharM82/trading-journal-lessons",
    purpose:
      "Multi-broker trade journal with calendar P&L, mistakes log, and SnapTrade-powered auto-sync from Schwab / Robinhood / Webull / Fidelity.",
    stack: "React 19, Vite, Tailwind, Node Azure Functions, SnapTrade SDK, Gmail SMTP",
    status: "live",
    cost: "$0/mo",
    category: "Journals",
    area: "Trading",
    details: [
      "Daily digest email + daily SnapTrade sync cron",
      "App-level password gate (SWA Google IDP broken on identity.7 shard)",
    ].join("\n"),
  },
  {
    name: "Voice Journal",
    url: "https://brave-water-0b4523c10.6.azurestaticapps.net",
    github: "",
    purpose: "Voice-first journaling: record audio entries, automatic transcription, chat with AI about your journal. General-purpose (not trading-specific).",
    stack: "React 19 + Vite 7 + Tailwind SPA on Azure SWA, Python Azure Functions API (voice-journal-api)",
    status: "live",
    cost: "$0/mo",
    category: "Journals & Notes",
    area: "Productivity",
    details: "",
  },

  // ─── REVENUE SAAS ────────────────────────────────────────────
  {
    name: "StockPro AI",
    url: "https://stockproai.net",
    github: "https://github.com/AzharM82/industry-runners",
    purpose:
      "Production SaaS with paying users — stock trading dashboard with Swing Trading and Day Trading views, breadth, sector rotation, focus stocks. $6.99/mo Stripe subscriptions.",
    stack: "React 19, Vite 7, Tailwind, Python Azure Functions, Claude Sonnet, Polygon.io, PostgreSQL, Redis, Stripe, Google/Microsoft OAuth",
    status: "live",
    cost: "$0/mo",
    category: "Revenue SaaS",
    area: "Trading",
    details: [
      "Admin dashboard: daily report, user roster, data tools, broadcast messaging (Markdown email to all paid, queue-drained by stockproai-cron)",
      "Stripe paid-but-paywalled bug class root-caused & fixed May 2026 (duplicate customers + missed webhooks); bulk reconcile at subscription-status?report=sync-all",
      "Microsoft personal-account login via custom OIDC consumers endpoint",
      "Deploy strictly via git push origin master → GitHub Actions (swa deploy breaks Python APIs)",
    ].join("\n"),
  },
  {
    name: "SwingHub / EPG Swing Group",
    url: "https://red-mushroom-00cb22e1e.7.azurestaticapps.net",
    github: "https://github.com/AzharM82/swinghub",
    purpose:
      "Members-only swing-alert community: admin posts BUY/SELL/HOLD alerts with chart + SL + TP; members get feed, replies, email + web-push; track record auto-derives from paired alerts. $50/mo or $500/yr via Zelle.",
    stack: "React 19, Vite 7, Tailwind 4, Node Azure Functions, Azure Tables + Blob, Gmail SMTP, Web Push (VAPID), Google OAuth",
    status: "live",
    cost: "$0/mo",
    category: "Revenue SaaS",
    area: "Trading",
    details: [
      "Phases 1+2 shipped May 2026 (auth, signup, compose, pending payments, feed, track record, replies, pinning, disclaimers)",
      "Zelle auto-reconciliation BUILT but parked on Outlook IMAP credentials — fallback plan: forward Zelle emails to Gmail IMAP (~30 min switch)",
      "Companion ATR-Matrix Swing strategy: 39m RAHUL entry, 2×ATR(39m) stop, ATR-Matrix trim ladder — scanned via TradingView MCP",
    ].join("\n"),
  },

  // ─── INFRASTRUCTURE & TOOLS ──────────────────────────────────
  {
    name: "Azure Cost Manager",
    url: "",
    github: "https://github.com/AzharM82/azure-cost-manager",
    purpose: "Daily Azure cost report email at 7 AM PST with subscription breakdown. Companion /azure-cost-optimizer skill has already cut $80+/mo of dead resources.",
    stack: "Python Azure Functions, Managed Identity (Cost Management Reader), Gmail SMTP",
    status: "live",
    cost: "$0/mo",
    category: "Infrastructure & Tools",
    area: "Infrastructure",
    details: "",
  },
  {
    name: "Claude Skills Tracker",
    url: "https://agreeable-sea-0650a141e.7.azurestaticapps.net",
    github: "https://github.com/AzharM82/claude-skills-tracker",
    purpose: "Private tracker + Monday weekly digest email of newly-discovered Claude Code skills on GitHub.",
    stack: "Node Azure Functions, React, GitHub API, Gmail SMTP",
    status: "live",
    cost: "$0/mo",
    category: "AI & Learning",
    area: "Learning",
    details: "",
  },
  {
    name: "agentmesh (multi-machine agent mesh)",
    url: "",
    github: "https://github.com/AzharM82/Agentmesh",
    purpose: "Harness-agnostic daemon + mesh CLI so DEV / DESKTOP1 / DESKTOP2 dispatch agent work to each other, stream output back, and hold distributed leases. Built 2026-08-11 to replace the OPS_HANDOFF.md pattern.",
    stack: "TypeScript / Node 20, local IPC (named pipe), filebus default transport, ssh + http relay alternatives, CI on 7 jobs",
    status: "local",
    cost: "$0/mo",
    category: "Infrastructure & Tools",
    area: "Infrastructure",
    details: [
      "Patterns from jcode: daemon owns state, CLI is a thin client, one frozen versioned envelope, no TCP listener",
      "Validated end-to-end on two live daemons; deliberately NOT wired into DTSWAI / MTF production yet",
      "Private repo (capital-A Agentmesh); npm package name lowercase",
    ].join("\n"),
  },
  {
    name: "analyze-github-repo (skill)",
    url: "",
    github: "https://github.com/AzharM82/analyze-github-repo",
    purpose: "Claude Code skill producing a single-file HTML analysis report (pipeline diagram, cards, verdict, 'fits your stack' pairings) for any public GitHub repo.",
    stack: "Claude Code skill",
    status: "local",
    cost: "$0/mo",
    category: "AI & Learning",
    area: "Learning",
    details: "",
  },
  {
    name: "Project Hub",
    url: "https://victorious-mud-0c0ea020f.1.azurestaticapps.net",
    github: "https://github.com/AzharM82/project-hub",
    purpose: "This site — portfolio of every built project (grouped by area: Trading / Learning / Productivity / Infrastructure / Personal & Faith) plus the idea backlog and maintenance tracker. Phone-friendly quick capture.",
    stack: "React 19, Vite 6, Tailwind 4, Node Azure Functions, Azure Table Storage",
    status: "live",
    cost: "$0/mo",
    category: "Infrastructure & Tools",
    area: "Infrastructure",
    details: [
      "v4 (2026-09-04): top-level areas + editable projects + mobile card layout + PWA manifest + shared-key write gate (HUB_WRITE_KEY)",
      "Seed reseeds only rows it created (seeded=true); user-added projects and all backlog rows survive a seed-version bump",
      "Admin tab = maintenance tracker with daily reminder email (GH Actions cron 14:00 UTC → /api/maintenance-remind)",
      "Tables Projects / Backlog / Maintenance on the azkaaraftersalahsa storage account",
    ].join("\n"),
  },

  // ─── OTHER APPS ──────────────────────────────────────────────
  {
    name: "AI Blog Aggregator & Learning Tracker",
    url: "https://ashy-ground-0aad8f10f.4.azurestaticapps.net",
    github: "https://github.com/AzharM82/ai-blog-aggregator",
    purpose: "AI blog aggregation + learning tracker with multi-source research (ArXiv, Dev.to, HackerNews, HuggingFace, YouTube, Claude). Auto-refresh daily 8 AM PST.",
    stack: "Vanilla JS, Tailwind, Python Azure Functions, Anthropic API, Azure Blob Storage",
    status: "live",
    cost: "$0/mo",
    category: "AI & Learning",
    area: "Learning",
    details: "",
  },
  {
    name: "Ramadan Max Rewards",
    url: "https://brave-cliff-0ab6ad01e.6.azurestaticapps.net",
    github: "https://github.com/AzharM82/RamadanMaxRewards",
    purpose: "Islamic habit tracking — prayers and daily azkaar after salah with progress tracking and streaks. Microsoft OIDC auth.",
    stack: "React, Vite, Tailwind, Node Azure Functions, Azure Table Storage, Microsoft OIDC",
    status: "live",
    cost: "$0/mo",
    category: "Faith Apps",
    area: "Personal & Faith",
    details: ["Migrated Cosmos DB → Azure Table Storage Mar 2026, saving ~$16/mo"].join("\n"),
  },
  {
    name: "Azkaar After Salah",
    url: "https://calm-moss-0dbb8311e.4.azurestaticapps.net",
    github: "https://github.com/AzharM82/AfterSalahAzkaar",
    purpose: "Simple azkaar recitation app — the original version before Ramadan Max Rewards.",
    stack: "React, Azure SWA",
    status: "live",
    cost: "$0/mo",
    category: "Faith Apps",
    area: "Personal & Faith",
    details: "",
  },

  // ─── ARCHIVED (LINEAGE) ──────────────────────────────────────
  {
    name: "Market Metrics Dashboard",
    url: "",
    github: "https://github.com/AzharM82/market-metrics",
    purpose: "Decommissioned Mar 2026. Screeners (Qullamaggie/Minervini/O'Neil) migrated into the MTF Reversal Scanner.",
    stack: "React 19, Python Azure Functions, FinViz Elite",
    status: "archived",
    cost: "$0/mo",
    category: "Archived",
    area: "Trading",
    details: "",
  },
  {
    name: "Market Breadth",
    url: "",
    github: "https://github.com/AzharM82/market-breadth",
    purpose: "Standalone breadth dashboard — SWA deleted Apr 2026 to free quota. Breadth concepts live on in the ATR Matrix Market Posture gauge and StockPro AI.",
    stack: "React, Python Azure Functions, Polygon.io",
    status: "archived",
    cost: "$0/mo",
    category: "Archived",
    area: "Trading",
    details: "",
  },
  {
    name: "ATRScanner / ATR5Ext / atr-backtest",
    url: "",
    github: "https://github.com/AzharM82/ATRScanner",
    purpose: "Standalone ATR extension scanner experiments — absorbed: ported to TypeScript as the MTF portal's ATR Matrix tab (Jun 2026).",
    stack: "Python Azure Functions → TypeScript port",
    status: "archived",
    cost: "$0/mo",
    category: "Archived",
    area: "Trading",
    details: "",
  },
  {
    name: "BigDXtremeTrade",
    url: "",
    github: "https://github.com/AzharM82/BigDXtremeTrade",
    purpose: "Find the most anomalous trades to prepare for next day. Azure infra deleted Mar 2026 (saved $63/mo).",
    stack: "Azure App Service (S1), Function App, SWA",
    status: "archived",
    cost: "$0/mo",
    category: "Archived",
    area: "Trading",
    details: "",
  },
  {
    name: "StockRaven + Portal",
    url: "",
    github: "https://github.com/AzharM82/stockraven",
    purpose: "Stock opportunity scanner — confluence detector. Azure RG deleted Mar 2026; backup repos kept.",
    stack: "Azure Functions, SWA, App Insights",
    status: "archived",
    cost: "$0/mo",
    category: "Archived",
    area: "Trading",
    details: "",
  },
  {
    name: "StockAgentHub V2 (Options + OpenClaw)",
    url: "",
    github: "https://github.com/AzharM82/StockAgentHub",
    purpose: "Options trading via OpenClaw vision signals — dormant code behind toggles. Day 1: AMZN 210 CALL +$18 paper. Lessons drove the deterministic V3 design.",
    stack: "Python Azure Functions, OpenClaw, Claude Vision, Schwab",
    status: "archived",
    cost: "$0/mo",
    category: "Archived",
    area: "Trading",
    details: "",
  },
  {
    name: "Early explorations (TradingLifecycle, RMPS V1–V3, Rule-Based Day Trading, positionsizing, stock-options-screener, Stockbee, TradingJournal)",
    url: "",
    github: "https://github.com/AzharM82?tab=repositories",
    purpose: "Early rule-based-system explorations — the philosophy now embodied in StockAgentHub V3 and DTSWAI. Sizing & screening logic reborn in newer apps.",
    stack: "Various",
    status: "archived",
    cost: "$0/mo",
    category: "Archived",
    area: "Trading",
    details: "",
  },
  // ─── ADDED 2026-09-04 ────────────────────────────────────────
  {
    name: "Unusual Options Activity Scanner (UOA)",
    url: "",
    github: "https://github.com/AzharM82/UnusualOptions",
    purpose: "EOD unusual-options-activity scanner: anomaly score from volume/OI/baselines, signals land in mtfrevstorage blobs and render on the MTF portal's Unusual Options tab.",
    stack: "Python, GitHub Actions crons (eod 21:45 / baseline 23:00 / oi-confirm 14:30 UTC), Polygon options, Azure Blob",
    status: "repo-only",
    cost: "$0/mo (needs Polygon Options Starter ~$29/mo)",
    category: "Scanners & Signals",
    area: "Trading",
    details: [
      "Code complete 2026-07-02; two data modes (snapshot with OI, aggs fallback); 32 tests pass",
      "Blocked on the Polygon Options subscription — stocks key is paid, options is a separate plan",
      "No Azure resources by design; MTF tab E2E validated with a sample latest.json 2026-07-06",
    ].join("\n"),
  },
  {
    name: "RHAgentic — Robinhood Agentic Trading",
    url: "",
    github: "",
    purpose: "Robinhood Trading MCP connected to a dedicated $300 Agentic account; Phase 2 (Claude Agent SDK trading app driven by TradingView MCP discovery) is designed but paused.",
    stack: "Robinhood Trading MCP (OAuth), Claude Agent SDK (Node), TradingView MCP",
    status: "local",
    cost: "$0/mo",
    category: "Auto-Execution",
    area: "Trading",
    details: [
      "Phase 1 done 2026-06-19: MCP registered project-scoped in dev/RHAgentic/.mcp.json, read-only smoke test returned live data",
      "Agent can only trade the Agentic account, read-only elsewhere, never sees the password",
      "Strategy design paused — which TV watchlist/indicators define the signal is still open",
    ].join("\n"),
  },
  {
    name: "Screening Machine (DESKTOP1/2 scanner clients)",
    url: "",
    github: "",
    purpose: "Source of truth for the on-machine TOS OCR scanner code: stocks/ (DTSWAI day-trade scanner, DESKTOP1) and options/ (DESKTOP2 alerts). Pushes alerts to WhatsApp + their clouds.",
    stack: "Python, Tesseract OCR, Win32 automation, ThinkOrSwim, Windows Task Scheduler",
    status: "live",
    cost: "$0/mo",
    category: "Scanners & Signals",
    area: "Trading",
    details: [
      "Dir dev/screening-machine; setup_screening_tasks.ps1 registers the scheduled tasks",
      "DESKTOP1 Watchdog.ps1 scan-miss check still assumes the old 3-scan schedule (~2h blind spot in local auto-recovery; fix parked 2026-08-25)",
    ].join("\n"),
  },
  {
    name: "Momentum Backtest",
    url: "",
    github: "",
    purpose: "One-off Python backtest of momentum scan signals with equity curve and HTML report.",
    stack: "Python, pandas, matplotlib",
    status: "local",
    cost: "$0/mo",
    category: "Research",
    area: "Trading",
    details: "Dir dev/Momentum Backtest — scan_backtest.py → backtest_signals.csv / backtest_summary.csv / report.html",
  },
  {
    name: "Mean-Reversion Options Dashboard (LVStocks with HV Potential)",
    url: "",
    github: "",
    purpose: "Sector-organised real-time stock performance dashboard aimed at spotting low-volatility names with high-volatility potential for options mean-reversion setups.",
    stack: "React + Vite, Node Azure Functions, Azure SWA",
    status: "repo-only",
    cost: "$0/mo",
    category: "Decision Dashboards",
    area: "Trading",
    details: "Dir dev/LVStocks with HVPotential — built from a Claude Code prompt; not deployed",
  },
  {
    name: "12% Gain Options Strategy SOP",
    url: "",
    github: "",
    purpose: "Single-page standard operating procedure for the 12% gain options strategy — the checklist to follow before and during a trade.",
    stack: "Static HTML/CSS/JS",
    status: "local",
    cost: "$0/mo",
    category: "Playbooks",
    area: "Trading",
    details: "Dir C:\\Users\\reach\\SOP App",
  },
  {
    name: "Agentic Workflow (control plane)",
    url: "",
    github: "https://github.com/AzharM82/AgenticWorkflow",
    purpose: "The engineering operating system for all projects: blueprint (plan) / overnight (gnhf autonomous runs) / lanes (treehouse worktrees) / crew (firstmate, WSL) over the Kun Chen stack, plus runbooks and the daily loop.",
    stack: "PowerShell + bash wrappers, gnhf, treehouse, firstmate (WSL2), Claude Code",
    status: "live",
    cost: "$0/mo",
    category: "Infrastructure & Tools",
    area: "Infrastructure",
    details: [
      "Adopted 2026-07-03; shipit/no-mistakes gate retired 2026-07-08; lavish/blueprint HTML plans retired 2026-07-18 (plans go in chat)",
      "Agents deploy to production since 2026-07-18 — but only validated builds, and the live site must be verified afterwards",
      "Health check: scripts/doctor.ps1; docs/how-to-use.html is the operating manual",
    ].join("\n"),
  },
  {
    name: "VulnScanner — Web App Security Assessment",
    url: "",
    github: "",
    purpose: "Local web-app vulnerability scanner (SQLi, XSS, CSRF, headers) producing severity-rated reports with remediation notes; runs as a PM2 Windows service.",
    stack: "Next.js, PM2 service, Node",
    status: "local",
    cost: "$0/mo",
    category: "Security",
    area: "Infrastructure",
    details: "Dir C:\\Users\\reach\\Vuln Management — install-service.bat / pm2-status.bat",
  },
  {
    name: "ToDoWithCal",
    url: "",
    github: "",
    purpose: "Local to-do app with a calendar view — tasks stored in a SQLite file, client + server in one repo.",
    stack: "Node server + SQLite (tasks.db), JS client",
    status: "local",
    cost: "$0/mo",
    category: "Productivity Apps",
    area: "Productivity",
    details: "Dir C:\\Users\\reach\\ToDoWithCal (client/ + server/)",
  },
  {
    name: "Daily Report Card",
    url: "",
    github: "",
    purpose: "Next.js + Prisma app for a daily self-report card / habit scoring.",
    stack: "Next.js, Prisma, Tailwind",
    status: "local",
    cost: "$0/mo",
    category: "Productivity Apps",
    area: "Productivity",
    details: "Dir C:\\Users\\reach\\Daily Report Card\\daily-report-card",
  },
  {
    name: "OpenWhispr dictation + paste shim",
    url: "",
    github: "",
    purpose: "Local Whisper voice dictation (Ctrl+Shift+R) with a WezTerm paste shim so dictated text lands in the terminal; transcriptions.db is the debug source of truth.",
    stack: "OpenWhispr, local Whisper, WezTerm Lua binding, Node shim",
    status: "local",
    cost: "$0/mo",
    category: "Productivity Apps",
    area: "Productivity",
    details: "Dir dev/openwhispr-paste-shim",
  },
  {
    name: "TaxSmartPro / TaxShield Pro",
    url: "",
    github: "",
    purpose: "Personal tax command center for a high-income W-2 earner with two LLCs — multi-year strategy + filing assistant. Currently a vibe-coding prompt only, not built.",
    stack: "Prompt spec only (dev/TaxSmartPro/TaxOptimizer_Vibe_Coding_Prompt.md)",
    status: "repo-only",
    cost: "$0/mo",
    category: "Personal Finance",
    area: "Productivity",
    details: "",
  },
  {
    name: "AI Learning Path Generator",
    url: "",
    github: "",
    purpose: "Python backend that generates a personalised learning path (modules, resources, sequencing) for a topic using an LLM.",
    stack: "Python FastAPI (routers / services / models), LLM API",
    status: "local",
    cost: "$0/mo",
    category: "AI & Learning",
    area: "Learning",
    details: "Dir C:\\Users\\reach\\AIGeneratedLearningPath Generator\\backend",
  },
  {
    name: "Beginner Video Series (trading education)",
    url: "",
    github: "",
    purpose: "Outline for a beginner trading video series — content planning doc.",
    stack: "Word document",
    status: "local",
    cost: "$0/mo",
    category: "Content",
    area: "Learning",
    details: "dev/Beginner Video/Beginner Video Series.docx",
  },
  {
    name: "Trading Journal App (Journal Everyday)",
    url: "",
    github: "",
    purpose: "Early monorepo trading journal (React + Azure Functions + Cosmos DB) — superseded by Trading Journal & Lessons.",
    stack: "Vite + React + TS, Azure Functions, Cosmos DB, Blob",
    status: "archived",
    cost: "$0/mo",
    category: "Archived",
    area: "Trading",
    details: "Dir C:\\Users\\reach\\Journal Everyday",
  },

];

interface BacklogSeed {
  title: string;
  description: string;
  category: string;
  area: string;
  priority: string;
  status: string; // idea | planned | in-progress | done | dropped
}

// Backlog seeding is ADDITIVE: an item is inserted only when no row with the same
// derived rowKey exists. Existing rows are never modified or deleted by the seed.
const BACKLOG: BacklogSeed[] = [
  {
    title: "DTSWAI: activate live trading",
    description: "Done 2026-07-30 — master flipped to LIVE / real money on Alpaca, ~23 subscribers onboarded, fan-out enabled.",
    category: "Day Trade Algo",
    area: "Trading",
    priority: "high",
    status: "done",
  },
  {
    title: "DTSWAI: migrate broker Schwab → Alpaca",
    description: "Done — DTSWAI runs on Alpaca (master + subscriber keys); no more 7-day Schwab re-auth for the day-trade system.",
    category: "Day Trade Algo",
    area: "Trading",
    priority: "high",
    status: "done",
  },
  {
    title: "StockAgentHub: finish DESKTOP2 options executor + deploy",
    description: "Branch feat/desktop2-options-integration is built but not deployed. Remaining: Claude Agent-SDK executor on DESKTOP2 (Robinhood MCP), Dashboard/Trades pages, remaining-capital tracking, idempotent client_order_id, daily_loss_stop, partial-fill reconciliation.",
    category: "Auto-Execution",
    area: "Trading",
    priority: "high",
    status: "planned",
  },
  {
    title: "Bull-List hardening before live capital",
    description: "Fixed-risk sizing qty = riskBudget/(entry−SL); reject setups with R < 1.5; cap SL distance; handle gap-through-SL fills; add MAX_CONCURRENT_POSITIONS.",
    category: "Scanner",
    area: "Trading",
    priority: "high",
    status: "idea",
  },
  {
    title: "DESKTOP1 Watchdog: fix scan-miss blind spot",
    description: "Watchdog.ps1 still checks the retired 3-scan SCAN_TIMES_PT, leaving a ~2h hole in local auto-recovery for the 10-min scanner. Fix drafted and parked 2026-08-25; cloud Pushover (20 min) unaffected.",
    category: "Ops",
    area: "Trading",
    priority: "medium",
    status: "planned",
  },
  {
    title: "MTF portal consolidation + Google sign-in",
    description: "Branch feat/portal-consolidation: merge Should-I-Be-Trading, Market Metrics screeners, sector rotation and 4 calculators into the portal. Auth would break 5 machine callers — needs a machine-token path first.",
    category: "Portal",
    area: "Trading",
    priority: "medium",
    status: "in-progress",
  },
  {
    title: "UOA scanner: subscribe Polygon Options Starter + backfill",
    description: "Options data is a separate Polygon plan (~$29/mo). After subscribing: run workflow_dispatch backfill once (20-day baselines), then the three GH Actions crons take over. Set GitHub secrets via scripts/set-github-secrets.ps1.",
    category: "Scanner",
    area: "Trading",
    priority: "medium",
    status: "idea",
  },
  {
    title: "Opening Drive: add a real catalyst feed",
    description: "29-day backtest says the PMH-break setup is ≈breakeven; the ceiling is signal quality. Skip-YELLOW regime roughly doubles edge. A news/catalyst feed (or human discretion) is the missing piece.",
    category: "Scanner",
    area: "Trading",
    priority: "low",
    status: "idea",
  },
  {
    title: "RHAgentic Phase 2: strategy design",
    description: "Claude Agent SDK app over the Robinhood Trading MCP. Open: which TradingView watchlists/indicators define the signal, timeframe, and how entry/SL/TP derive from the chart.",
    category: "AI Agent",
    area: "Trading",
    priority: "low",
    status: "idea",
  },
  {
    title: "Wire 'Should I Be Trading' regime gate into DTSWAI",
    description: "Use the 0-100 Quality Score / YES-CAUTION-NO verdict as a don't-trade-today gate ahead of scanner entries.",
    category: "Day Trade Algo",
    area: "Trading",
    priority: "medium",
    status: "idea",
  },
  {
    title: "Wire ATR Matrix setup score into DTSWAI universe",
    description: "Rank/filter the day-trade candidate universe using the ATR Matrix 0-100 setup score and Market Posture bias (buy vs sell focus).",
    category: "Day Trade Algo",
    area: "Trading",
    priority: "medium",
    status: "idea",
  },
  {
    title: "SwingHub: Zelle auto-reconciliation via Gmail IMAP",
    description: "Outlook IMAP auth is blocked account-side. Forward Chase Zelle emails to Gmail, point the scanner at imap.gmail.com (~30 min switch). All other code is built + deployed.",
    category: "SaaS",
    area: "Trading",
    priority: "medium",
    status: "idea",
  },
  {
    title: "Morning War Room Agent",
    description: "AI agent at 8:30 AM ET. Calls SIBT, ATR Matrix posture, checks focus stocks for gaps, reads overnight news. Produces a Pushover/WhatsApp briefing.",
    category: "AI Agent",
    area: "Trading",
    priority: "medium",
    status: "idea",
  },
  {
    title: "Trade Journal Analyst Agent",
    description: "Agent that cross-references journal trades with market conditions (SIBT score). Finds behavioral patterns: win rates by condition, time, setup. Jeff's AI Coach is the v1 of this.",
    category: "AI Agent",
    area: "Trading",
    priority: "medium",
    status: "idea",
  },
  {
    title: "Position Watchdog Agent",
    description: "Monitors open positions via Polygon. Alerts on stops hit, targets reached, significant moves. End-of-day P&L summary.",
    category: "AI Agent",
    area: "Trading",
    priority: "low",
    status: "idea",
  },
  {
    title: "Focus Stock Curator Agent",
    description: "Weekly agent scanning StockPro's focus stocks. Flags broken trends for removal, suggests new additions.",
    category: "AI Agent",
    area: "Trading",
    priority: "low",
    status: "idea",
  },
  {
    title: "Wire agentmesh into DTSWAI / MTF ops",
    description: "agentmesh is validated E2E but standalone. Replace the OPS_HANDOFF.md + RDP handoff between DEV and DESKTOP1/DESKTOP2 with mesh dispatch + leases. Push the private repo first.",
    category: "Tooling",
    area: "Infrastructure",
    priority: "medium",
    status: "idea",
  },
  {
    title: "Project Hub: JSON export/import + local mode",
    description: "One-click export of Projects/Backlog/Maintenance as JSON for backup, and an import path so the hub can also run against a local Azurite / SQLite store when offline.",
    category: "Tooling",
    area: "Infrastructure",
    priority: "low",
    status: "idea",
  },
  {
    title: "Weekly 'what did I build' digest email",
    description: "Sunday email summarising projects touched (git activity across dev/), backlog items moved, and maintenance tasks due — a learning log of the week.",
    category: "Habit",
    area: "Learning",
    priority: "low",
    status: "idea",
  },
];

const SEED_FLAG = "seeded";

function projectRowKey(name: string): string {
  return name.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase().slice(0, 100);
}

/**
 * Reseed PROJECTS non-destructively:
 *  - rows previously written by the seed (seeded === true) are deleted and re-created
 *  - user-added rows (no seeded flag) are left untouched
 *  - Backlog rows are NEVER deleted; missing seed titles are inserted
 */
export async function seedData(): Promise<{ projects: number; backlog: number }> {
  const pc = await getProjectsClient();
  const bc = await getBacklogClient();

  // Remove only rows the seed itself created
  try {
    const existingProjects = pc.listEntities({ queryOptions: { filter: "PartitionKey eq 'projects'" } });
    for await (const entity of existingProjects) {
      // seeded rows, plus legacy pre-v4 rows (no flag, not user-created "u-" keys)
      const legacy = entity[SEED_FLAG] === undefined && !String(entity.rowKey).startsWith("u-");
      if (entity[SEED_FLAG] === true || legacy) {
        await pc.deleteEntity(entity.partitionKey as string, entity.rowKey as string);
      }
    }
  } catch { /* ignore */ }

  let projectCount = 0;
  let backlogCount = 0;
  const deadProjects = await getTombstones("projects");
  const deadBacklog = await getTombstones("backlog");

  for (const p of PROJECTS) {
    if (deadProjects.has(projectRowKey(p.name))) continue; // operator deleted it — stay deleted
    await pc.upsertEntity(
      {
        partitionKey: "projects",
        rowKey: projectRowKey(p.name),
        name: p.name,
        url: p.url,
        github: p.github,
        purpose: p.purpose,
        stack: p.stack,
        status: p.status,
        cost: p.cost,
        category: p.category,
        area: p.area,
        details: p.details,
        [SEED_FLAG]: true,
        updatedAt: new Date().toISOString(),
      },
      "Replace",
    );
    projectCount++;
  }

  for (const b of BACKLOG) {
    const rowKey = b.title.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase().slice(0, 100);
    if (deadBacklog.has(rowKey)) continue;
    try {
      await bc.getEntity("backlog", rowKey);
      continue; // already present — never overwrite user state
    } catch {
      // not found → insert
    }
    await bc.createEntity({
      partitionKey: "backlog",
      rowKey,
      title: b.title,
      description: b.description,
      category: b.category,
      area: b.area,
      priority: b.priority,
      status: b.status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      [SEED_FLAG]: true,
    });
    backlogCount++;
  }

  await pc.upsertEntity({ partitionKey: "meta", rowKey: "seedVersion", value: SEED_VERSION });

  return { projects: projectCount, backlog: backlogCount };
}

export async function getStoredSeedVersion(): Promise<string | null> {
  const pc = await getProjectsClient();
  try {
    const e = await pc.getEntity("meta", "seedVersion");
    return (e.value as string) ?? null;
  } catch {
    return null;
  }
}
