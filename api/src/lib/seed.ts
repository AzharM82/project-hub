import { getProjectsClient, getBacklogClient } from "./storage.js";

// Bump this whenever PROJECTS/BACKLOG below change — the API reseeds once per version.
export const SEED_VERSION = "2026-06-05-full-inventory-v3";

interface ProjectSeed {
  name: string;
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
    purpose:
      "THE day-trade algo. Consolidates StockAgentHub (Schwab + algo), tos-reversal-scanner (chart-truth OCR signals), and MTF portal patterns into one repo + portal + cloud. v1 deployed 2026-05-24 in PAPER MODE.",
    stack: "Python Azure Functions, React 19 + Vite portal (Spark/Cool Slate design), Schwab API, Azure Table Storage + Queue, WhatsApp sidecar, Google Sign-In auth",
    status: "paper",
    cost: "$0/mo",
    category: "Day Trade Algo",
    details: [
      "Chart truth: local scanner OCRs the TOS Azhar_Reversal strip and POSTs ticker + buy/SL/TP to /api/scanner-alert — the cloud NEVER re-derives the reversal; entry runs inline in the POST handler",
      "Cloud orchestrator is monitor-only on a 5-min cron; exits: trailing 2-bar-low stop (ratchets up only, real-time Schwab quotes), TP 5%, D1, EOD",
      "Risk: $1k/ticker, $5k total, max 5 tickers, no trades first 30 min / last 15 min; paper_mode + master trading_enabled kill-switch in portal Config (TradingConfig table)",
      "WhatsApp alert on every BUY and SELL (Pushover fallback); all config editable in the portal",
      "Infra: dtswai-func + dtswaistore in rg-stockagenthub; portal SWA dtswai-portal; app-level Google auth (ALLOWED_EMAILS), scanner endpoints x-timer-secret",
      "TO ACTIVATE: re-auth Schwab token (expired ~Jun 2) → set Finviz screener URL in Config → run scanner/ on DESKTOP1 (docs/DESKTOP1_SETUP.md) → paper-validate → flip paper_mode → pause StockAgentHub (shared account)",
      "Planned: migrate broker Schwab → Alpaca (own creds, paper API, no 7-day re-auth); cross-machine handoff via OPS_HANDOFF.md at repo root",
    ].join("\n"),
  },

  // ─── AUTO-EXECUTION ──────────────────────────────────────────
  {
    name: "StockAgentHub V3 — Stock Swing Trading",
    url: "https://jolly-bush-02b86570f.4.azurestaticapps.net",
    github: "https://github.com/AzharM82/StockAgentHub",
    purpose:
      "Flagship LIVE system trading real money on Schwab. Deterministic Python port of the TOS Reversal thinkscript drives stock swing entries — no AI in the hot path. Direct parent of DTSWAI.",
    stack: "Python Azure Functions, Schwab API, React journal (Microsoft AAD), Azure Table Storage, Pushover",
    status: "live",
    cost: "$0/mo",
    category: "Auto-Execution",
    details: [
      "tos_reversal.py validated penny-perfect vs TOS charts (NOW, WDAY, VEEV @ 3-min); on fresh U1: MARKET BUY at next-bar open, SL = low of bar before U1, TP = +5%",
      "Timer every 3 min (13:00–20:00 UTC weekdays) over ORBWatchlist; Schwab 1-min bars resampled to 3-min",
      "Monitor enforces STOP_LOSS → TAKE_PROFIT → RED_REVERSAL exits (market sells, software SL — no broker OCO); holds overnight",
      "Risk knobs: $5k budget, $1k/ticker, max 5 tickers, skip first 30 min; paper-mode toggle + emergency stop in Config tab",
      "Full telemetry (SignalLogs/OrderLogs/ExitLogs/TradeJournal) + 3 PM PST daily email report",
      "Replaced V2 OpenClaw vision approach (~$40/wk Anthropic spend, label drift, needed a Windows box awake)",
      "Schwab refresh token = 7-day expiry, manual re-auth via scripts/schwab_oauth.py (Pushover alert 24h before)",
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
    purpose:
      "Biggest scanner portal (v2, financial-newspaper light theme): AVWAP Swing Scanner, Bull List paper algo, Day Trades (chart-truth alerts), ATR Matrix, and performance tracking.",
    stack: "React 19, Vite 6, Tailwind 4, Node Azure Functions, Polygon.io, FinViz Elite, Outlook IMAP, Gmail SMTP, WhatsApp sidecar, Azure Tables + Queue, mtfrev-cron Function App",
    status: "live",
    cost: "$16/mo",
    category: "Scanners & Signals",
    details: [
      "AVWAP Swing Scanner: 4:15 PM ET EOD scan, 209-ticker universe, anchors at ATH / 52W high / 52W low / YTD / swing low; Pullback / Pinch / Reclaim patterns; top 30 emailed nightly",
      "Bull List: hourly Outlook IMAP poll of D-Bull-Sig TOS alerts → entry/SL/TP via ZigZag → paper-tracked. First week: +$32,129 (+2.05%) on ~$1.57M deployed at 46.9% win rate — positive expectancy, winners outsize losers",
      "Day Trades: alerts from the local Finviz→TOS-OCR scanner (chart truth) via /api/scanner-alert; WhatsApp delivery through queue + sidecar; realized-P&L panel",
      "ATR Matrix (added Jun 2026): @SteveDJacobs extension framework over full S&P 500 + NDX (~516 tickers, pure Finviz, ~2.5s scan); extension = (Close−SMA50)/ATR, LEAVE→BLOW-OFF zones, A–G grades, 0–100 setup score, Top Setups with intraday BUYABLE/WAIT flags, Market Posture breadth gauge (RISK_ON/MIXED/RISK_OFF), reverse ticker lookup",
      "Cron: native Function App mtfrev-cron (Windows Consumption, free) — AVWAP EOD, Bull email hourly, Bull monitor 30-min, ATR scan 4:30 PM ET",
      "Known Bull-List gaps before live capital: fixed-$ sizing with variable risk, no R-multiple filter, wide SLs, gap-through-SL fills, no concurrency cap",
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
    details: [
      "Daily digest email + daily SnapTrade sync cron",
      "App-level password gate (SWA Google IDP broken on identity.7 shard)",
    ].join("\n"),
  },
  {
    name: "Voice Journal",
    url: "https://brave-water-0b4523c10.6.azurestaticapps.net",
    github: "",
    purpose: "Voice-based trading journal — record trade notes via speech-to-text. Captures the WHY behind trades, not just fills.",
    stack: "React, Azure SWA",
    status: "live",
    cost: "$0/mo",
    category: "Journals",
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
    category: "Infrastructure & Tools",
    details: "",
  },
  {
    name: "CLI Mesh Network",
    url: "",
    github: "https://github.com/AzharM82/CLIMeshNetwork",
    purpose: "Lets Claude Code CLI sessions on separate machines talk to each other — relevant to the DEV ↔ DESKTOP1 split the Day Trade Algo uses.",
    stack: "Node",
    status: "local",
    cost: "$0/mo",
    category: "Infrastructure & Tools",
    details: "",
  },
  {
    name: "analyze-github-repo (skill)",
    url: "",
    github: "https://github.com/AzharM82/analyze-github-repo",
    purpose: "Claude Code skill producing a single-file HTML analysis report (pipeline diagram, cards, verdict, 'fits your stack' pairings) for any public GitHub repo.",
    stack: "Claude Code skill",
    status: "local",
    cost: "$0/mo",
    category: "Infrastructure & Tools",
    details: "",
  },
  {
    name: "Project Hub",
    url: "https://victorious-mud-0c0ea020f.1.azurestaticapps.net",
    github: "https://github.com/AzharM82/project-hub",
    purpose: "This site — portfolio tracker & backlog for all built projects and future ideas.",
    stack: "React 19, Vite 6, Tailwind 4, Node Azure Functions, Azure Table Storage",
    status: "live",
    cost: "$0/mo",
    category: "Infrastructure & Tools",
    details: "",
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
    category: "Other Apps",
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
    category: "Other Apps",
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
    category: "Other Apps",
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
    details: "",
  },
];

interface BacklogSeed {
  title: string;
  description: string;
  category: string;
  priority: string;
}

const BACKLOG: BacklogSeed[] = [
  {
    title: "DTSWAI: activate live trading",
    description:
      "Re-auth Schwab token (expired ~Jun 2) → set Finviz day-trader screener URL in portal Config → run scanner/ on DESKTOP1 → add portal origin to Google OAuth client → paper-validate → flip paper_mode → pause StockAgentHub (shared account).",
    category: "Day Trade Algo",
    priority: "high",
  },
  {
    title: "DTSWAI: migrate broker Schwab → Alpaca",
    description:
      "Own broker creds, real paper API, no 7-day browser re-auth. Also resolves the shared-token fragility between DTSWAI and StockAgentHub.",
    category: "Day Trade Algo",
    priority: "high",
  },
  {
    title: "Wire 'Should I Be Trading' regime gate into DTSWAI",
    description: "Use the 0-100 Quality Score / YES-CAUTION-NO verdict as a don't-trade-today gate ahead of scanner entries.",
    category: "Day Trade Algo",
    priority: "medium",
  },
  {
    title: "Wire ATR Matrix setup score into DTSWAI universe",
    description: "Rank/filter the day-trade candidate universe using the ATR Matrix 0-100 setup score and Market Posture bias (buy vs sell focus).",
    category: "Day Trade Algo",
    priority: "medium",
  },
  {
    title: "Bull-List hardening before live capital",
    description:
      "Fixed-risk sizing qty = riskBudget/(entry−SL); reject setups with R < 1.5; cap SL distance; handle gap-through-SL fills; add MAX_CONCURRENT_POSITIONS.",
    category: "Scanner",
    priority: "high",
  },
  {
    title: "SwingHub: Zelle auto-reconciliation via Gmail IMAP",
    description: "Outlook IMAP auth is blocked account-side. Forward Chase Zelle emails to Gmail, point the scanner at imap.gmail.com (~30 min switch). All other code is built + deployed.",
    category: "SaaS",
    priority: "medium",
  },
  {
    title: "Morning War Room Agent",
    description:
      "AI agent at 8:30 AM ET. Calls SIBT, ATR Matrix posture, checks focus stocks for gaps, reads overnight news. Produces a Pushover/WhatsApp briefing.",
    category: "AI Agent",
    priority: "medium",
  },
  {
    title: "Trade Journal Analyst Agent",
    description:
      "Agent that cross-references journal trades with market conditions (SIBT score). Finds behavioral patterns: win rates by condition, time, setup. Jeff's AI Coach is the v1 of this.",
    category: "AI Agent",
    priority: "medium",
  },
  {
    title: "Position Watchdog Agent",
    description: "Monitors open positions via Polygon. Alerts on stops hit, targets reached, significant moves. End-of-day P&L summary.",
    category: "AI Agent",
    priority: "low",
  },
  {
    title: "Focus Stock Curator Agent",
    description: "Weekly agent scanning StockPro's focus stocks. Flags broken trends for removal, suggests new additions.",
    category: "AI Agent",
    priority: "low",
  },
];

export async function seedData(): Promise<{ projects: number; backlog: number }> {
  const pc = await getProjectsClient();
  const bc = await getBacklogClient();

  // Clear existing data for a clean reseed
  try {
    const existingProjects = pc.listEntities({ queryOptions: { filter: "PartitionKey eq 'projects'" } });
    for await (const entity of existingProjects) {
      await pc.deleteEntity(entity.partitionKey as string, entity.rowKey as string);
    }
  } catch { /* ignore */ }

  try {
    const existingBacklog = bc.listEntities({ queryOptions: { filter: "PartitionKey eq 'backlog'" } });
    for await (const entity of existingBacklog) {
      await bc.deleteEntity(entity.partitionKey as string, entity.rowKey as string);
    }
  } catch { /* ignore */ }

  let projectCount = 0;
  let backlogCount = 0;

  // Seed projects
  for (const p of PROJECTS) {
    const rowKey = p.name.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase().slice(0, 100);
    await pc.createEntity({
      partitionKey: "projects",
      rowKey,
      name: p.name,
      url: p.url,
      github: p.github,
      purpose: p.purpose,
      stack: p.stack,
      status: p.status,
      cost: p.cost,
      category: p.category,
      details: p.details,
    });
    projectCount++;
  }

  // Seed backlog
  for (const b of BACKLOG) {
    const rowKey = b.title.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase().slice(0, 100);
    await bc.createEntity({
      partitionKey: "backlog",
      rowKey,
      title: b.title,
      description: b.description,
      category: b.category,
      priority: b.priority,
      status: "idea",
      createdAt: new Date().toISOString(),
    });
    backlogCount++;
  }

  // Record seed version so we only reseed when the seed data changes
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
