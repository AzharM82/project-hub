import { getProjectsClient, getBacklogClient } from "./storage.js";

interface ProjectSeed {
  name: string;
  url: string;
  github: string;
  purpose: string;
  stack: string;
  status: string;
  cost: string;
}

const PROJECTS: ProjectSeed[] = [
  // ─── LIVE PROJECTS ──────────────────────────────────────────
  {
    name: "StockPro AI",
    url: "https://stockproai.net",
    github: "https://github.com/AzharM82/industry-runners",
    purpose: "Premium SaaS platform — AI stock analysis (ChartGPT, Deep Research, Halal), breadth, sector rotation, focus stocks, trade management. Stripe subscriptions.",
    stack: "React 19, Vite 7, Tailwind, Python Azure Functions, Claude API, Polygon.io, PostgreSQL, Redis, Stripe",
    status: "live",
    cost: "$0/mo",
  },
  {
    name: "Should I Be Trading",
    url: "https://yellow-grass-099796a0f.4.azurestaticapps.net",
    github: "https://github.com/AzharM82/should-i-be-trading",
    purpose: "Bloomberg-style market quality dashboard — YES/CAUTION/NO decision with scoring across Volatility, Momentum, Trend, Breadth, Macro. Execution Window Score.",
    stack: "React 19, Vite 6, Tailwind 4, Node.js Azure Functions, Polygon.io, FinViz Elite, Yahoo Finance",
    status: "live",
    cost: "$0/mo",
  },
  {
    name: "MultiTimeframe Reversal Scanner",
    url: "https://salmon-river-0a7a0c30f.1.azurestaticapps.net",
    github: "https://github.com/AzharM82/multitimeframerev",
    purpose: "Multi-timeframe reversal scanner with daily + weekly capitulation alerts via Pushover for 882 stocks. Phase Oscillator. Cron-triggered scanning.",
    stack: "React 19, Vite 6, Tailwind 4, Node.js Azure Functions, Polygon.io, Redis, Azure Table Storage, Pushover",
    status: "live",
    cost: "$16/mo",
  },
  {
    name: "Market Metrics Dashboard",
    url: "https://gentle-plant-0e85b0b0f.2.azurestaticapps.net",
    github: "https://github.com/AzharM82/market-metrics",
    purpose: "Comprehensive market dashboard — breadth, screeners (Qullamaggie, Minervini, O'Neil), movers, sectors, momentum 50, economic calendar, intraday.",
    stack: "React 19, Vite 6, Tailwind 4, Python Azure Functions, FinViz Elite, Polygon.io, Stockbee, Azure Table Storage",
    status: "live",
    cost: "$0/mo",
  },
  {
    name: "Sector Rotation Dashboard",
    url: "https://ambitious-forest-011e9520f.2.azurestaticapps.net",
    github: "https://github.com/AzharM82/sector-rotation",
    purpose: "Sector performance visualization — SectorTree, CirclePacking, StockDetail views. Google OAuth. Light/dark theme.",
    stack: "React 19, Vite 7, Tailwind, Python Azure Functions, Polygon.io, Redis, Google OAuth",
    status: "live",
    cost: "$0/mo",
  },
  {
    name: "Ramadan Max Rewards",
    url: "https://brave-cliff-0ab6ad01e.6.azurestaticapps.net",
    github: "https://github.com/AzharM82/RamadanMaxRewards",
    purpose: "Islamic habit tracking app for prayers and daily azkaar after salah with progress tracking and streaks.",
    stack: "React, Vite, Tailwind, Node.js Azure Functions, Azure Table Storage, Microsoft Auth (OIDC)",
    status: "live",
    cost: "$0/mo",
  },
  {
    name: "Azkaar After Salah",
    url: "https://calm-moss-0dbb8311e.4.azurestaticapps.net",
    github: "https://github.com/AzharM82/AfterSalahAzkaar",
    purpose: "Simple app to recite azkaar (remembrance) after obligatory prayers. Original version before Ramadan Max Rewards.",
    stack: "React, Azure SWA",
    status: "live",
    cost: "$0/mo",
  },
  {
    name: "Azure Cost Manager",
    url: "",
    github: "https://github.com/AzharM82/azure-cost-manager",
    purpose: "Daily Azure cost report emailer — sends subscription cost breakdown at 7 AM PST via Gmail SMTP.",
    stack: "Python Azure Functions, Managed Identity, Gmail SMTP",
    status: "live",
    cost: "$0/mo",
  },
  {
    name: "Market Breadth",
    url: "https://green-forest-02e00250f.2.azurestaticapps.net",
    github: "https://github.com/AzharM82/market-breadth",
    purpose: "Market breadth indicators dashboard — standalone breadth visualization before it was folded into Market Metrics.",
    stack: "React, Python Azure Functions, Polygon.io",
    status: "live",
    cost: "$0/mo",
  },
  {
    name: "Voice Journal",
    url: "https://brave-water-0b4523c10.6.azurestaticapps.net",
    github: "",
    purpose: "Voice-based trading journal — record trade notes via speech-to-text.",
    stack: "React, Azure SWA",
    status: "live",
    cost: "$0/mo",
  },
  {
    name: "AI Blog Aggregator",
    url: "https://ashy-ground-0aad8f10f.4.azurestaticapps.net",
    github: "",
    purpose: "AI-powered blog aggregation and content curation.",
    stack: "React, Azure SWA",
    status: "live",
    cost: "$0/mo",
  },
  {
    name: "Project Hub",
    url: "https://victorious-mud-0c0ea020f.1.azurestaticapps.net",
    github: "https://github.com/AzharM82/project-hub",
    purpose: "Portfolio tracker & backlog — tracks all built projects and future ideas/AI agents.",
    stack: "React 19, Vite 6, Tailwind 4, Node.js Azure Functions, Azure Table Storage",
    status: "live",
    cost: "$0/mo",
  },
  // ─── ARCHIVED / DELETED INFRA ────────────────────────────────
  {
    name: "BigDXtremeTrade",
    url: "",
    github: "https://github.com/AzharM82/BigDXtremeTrade",
    purpose: "Find the most anomalous trades to prepare for next day. Azure infra deleted Mar 2026 to save $63/mo.",
    stack: "Azure App Service (S1), Function App, SWA",
    status: "archived",
    cost: "$0/mo",
  },
  {
    name: "StockRaven",
    url: "",
    github: "https://github.com/AzharM82/stockraven",
    purpose: "Stock opportunity scanner — confluence detector for trading opportunities. Azure RG deleted Mar 2026.",
    stack: "Azure Functions, SWA, App Insights",
    status: "archived",
    cost: "$0/mo",
  },
  {
    name: "StockRaven Portal",
    url: "",
    github: "https://github.com/AzharM82/stockraven-portal",
    purpose: "Frontend portal for StockRaven scanner. Archived alongside StockRaven backend.",
    stack: "React, Azure SWA",
    status: "archived",
    cost: "$0/mo",
  },
  {
    name: "Industry Runners FinViz",
    url: "",
    github: "https://github.com/AzharM82/industry-runners-finviz",
    purpose: "Earlier version of StockPro AI focused on FinViz data. SWA deleted Mar 2026.",
    stack: "React, Azure SWA",
    status: "archived",
    cost: "$0/mo",
  },
  // ─── REPO-ONLY (code exists, not deployed) ───────────────────
  {
    name: "Trading Journal",
    url: "",
    github: "https://github.com/AzharM82/TradingJournal",
    purpose: "Comprehensive trading journal app — record and analyze trades.",
    stack: "Unknown",
    status: "repo-only",
    cost: "$0/mo",
  },
  {
    name: "Trading Lifecycle",
    url: "",
    github: "https://github.com/AzharM82/TradingLifecycle",
    purpose: "End-to-end SaaS app for rule-based trading lifecycle management.",
    stack: "Unknown",
    status: "repo-only",
    cost: "$0/mo",
  },
  {
    name: "Stock Options Screener",
    url: "",
    github: "https://github.com/AzharM82/stock-options-screener",
    purpose: "Pre-trade checklist — actions to verify before placing an order.",
    stack: "Unknown",
    status: "repo-only",
    cost: "$0/mo",
  },
  {
    name: "Position Sizing",
    url: "",
    github: "https://github.com/AzharM82/positionsizing",
    purpose: "Lightweight web app for stock position sizing and risk management.",
    stack: "Unknown",
    status: "repo-only",
    cost: "$0/mo",
  },
  {
    name: "ATR 5 Extension",
    url: "",
    github: "https://github.com/AzharM82/ATR5Ext",
    purpose: "ATR 5 Extension 5x — volatility-based trade extension calculator.",
    stack: "Unknown",
    status: "repo-only",
    cost: "$0/mo",
  },
  {
    name: "TodoWithCal and AI",
    url: "",
    github: "https://github.com/AzharM82/TodoWithCal-and-AI",
    purpose: "AI-powered todo list with calendar integration.",
    stack: "Unknown",
    status: "repo-only",
    cost: "$0/mo",
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
    title: "Morning War Room Agent",
    description: "AI agent that runs at 8:30 AM ET. Calls SIBT, Market Metrics, Capitulation scanner, checks focus stocks for gaps, reads overnight news. Produces a 1-paragraph Pushover briefing with actionable trading guidance.",
    category: "AI Agent",
    priority: "high",
  },
  {
    title: "Trade Journal Analyst Agent",
    description: "Voice/text agent that records trade entries, exits, thesis, and emotions. Cross-references with market conditions (SIBT score at time of trade). Finds behavioral patterns: win rates by market condition, time of day, setup type.",
    category: "AI Agent",
    priority: "high",
  },
  {
    title: "Position Watchdog Agent",
    description: "Monitors open positions throughout the day via Polygon. Sends Pushover alerts when stops are hit, targets reached, or positions move significantly. End-of-day P&L summary.",
    category: "AI Agent",
    priority: "medium",
  },
  {
    title: "Focus Stock Curator Agent",
    description: "Weekly agent that scans StockPro's 250+ focus stocks. Flags broken trends for removal, suggests new additions from capitulation recoveries. Outputs add/remove recommendations.",
    category: "AI Agent",
    priority: "medium",
  },
  {
    title: "Alert Triage Agent",
    description: "Filters capitulation scanner alerts by actual trade quality. Checks sector breadth, institutional accumulation patterns, and ranks alerts beyond just drop percentage.",
    category: "AI Agent",
    priority: "low",
  },
];

export async function seedData(): Promise<{ projects: number; backlog: number }> {
  const pc = await getProjectsClient();
  const bc = await getBacklogClient();

  let projectCount = 0;
  let backlogCount = 0;

  // Seed projects
  for (const p of PROJECTS) {
    const rowKey = p.name.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
    try {
      await pc.getEntity("projects", rowKey);
      // Already exists, skip
    } catch {
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
      });
      projectCount++;
    }
  }

  // Seed backlog
  for (const b of BACKLOG) {
    const rowKey = b.title.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
    try {
      await bc.getEntity("backlog", rowKey);
    } catch {
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
  }

  return { projects: projectCount, backlog: backlogCount };
}
