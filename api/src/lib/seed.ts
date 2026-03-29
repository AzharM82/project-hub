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
    purpose: "Premium SaaS — AI stock analysis (ChartGPT, Deep Research, Halal), breadth, sector rotation, focus stocks, trade management. Stripe subscriptions.",
    stack: "React 19, Vite 7, Tailwind, Python Azure Functions, Claude API, Polygon.io, PostgreSQL, Redis, Stripe",
    status: "live",
    cost: "$0/mo",
  },
  {
    name: "Should I Be Trading",
    url: "https://yellow-grass-099796a0f.4.azurestaticapps.net",
    github: "https://github.com/AzharM82/should-i-be-trading",
    purpose: "Bloomberg-style market quality dashboard — YES/CAUTION/NO decision with 0-100 quality score across Volatility, Momentum, Trend, Breadth, Macro.",
    stack: "React 19, Vite 6, Tailwind 4, Node.js Azure Functions, Polygon.io, FinViz Elite, Yahoo Finance",
    status: "live",
    cost: "$0/mo",
  },
  {
    name: "MultiTimeframe Reversal Scanner",
    url: "https://salmon-river-0a7a0c30f.1.azurestaticapps.net",
    github: "https://github.com/AzharM82/multitimeframerev",
    purpose: "5-tab scanner: Reversal Scanner, Phase Oscillator, Daily/Weekly Capitulation alerts, Screeners (Qullamaggie/Minervini/O'Neil via FinViz Elite). Cron-triggered Pushover alerts.",
    stack: "React 19, Vite 6, Tailwind 4, Node.js Azure Functions, Polygon.io, FinViz Elite, Redis, Azure Table Storage, Pushover",
    status: "live",
    cost: "$16/mo",
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
    name: "AI Blog Aggregator & Learning Tracker",
    url: "https://ashy-ground-0aad8f10f.4.azurestaticapps.net",
    github: "https://github.com/AzharM82/ai-blog-aggregator",
    purpose: "AI blog aggregation + Learning Tracker with multi-source research (ArXiv, Dev.to, HackerNews, HuggingFace, YouTube, Claude). Scoring, auto-refresh daily 8 AM PST.",
    stack: "Vanilla JS, Tailwind, Python Azure Functions, Anthropic API, ArXiv, Dev.to, HN Algolia, YouTube Data API, Azure Blob Storage",
    status: "live",
    cost: "$0/mo",
  },
  {
    name: "Ramadan Max Rewards",
    url: "https://brave-cliff-0ab6ad01e.6.azurestaticapps.net",
    github: "https://github.com/AzharM82/RamadanMaxRewards",
    purpose: "Islamic habit tracking — prayers and daily azkaar after salah with progress tracking and streaks. Microsoft OIDC auth.",
    stack: "React, Vite, Tailwind, Node.js Azure Functions, Azure Table Storage, Microsoft Auth (OIDC)",
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
    name: "Project Hub",
    url: "https://victorious-mud-0c0ea020f.1.azurestaticapps.net",
    github: "https://github.com/AzharM82/project-hub",
    purpose: "Portfolio tracker & backlog — tracks all built projects, Azure costs, and future ideas/AI agents.",
    stack: "React 19, Vite 6, Tailwind 4, Node.js Azure Functions, Azure Table Storage",
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
    name: "Market Breadth",
    url: "https://green-forest-02e00250f.2.azurestaticapps.net",
    github: "https://github.com/AzharM82/market-breadth",
    purpose: "Standalone market breadth indicators dashboard. Breadth features now also in StockPro AI.",
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
  // ─── ARCHIVED / DELETED INFRA ────────────────────────────────
  {
    name: "Market Metrics Dashboard",
    url: "",
    github: "https://github.com/AzharM82/market-metrics",
    purpose: "Decommissioned Mar 2026. Screeners migrated to MTF Reversal Scanner. Was: breadth, screeners, movers, sectors, momentum 50, economic calendar.",
    stack: "React 19, Vite 6, Tailwind 4, Python Azure Functions, FinViz Elite",
    status: "archived",
    cost: "$0/mo",
  },
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
    name: "StockRaven Portal",
    url: "",
    github: "https://github.com/AzharM82/stockraven-portal",
    purpose: "Frontend portal for StockRaven scanner. Archived alongside StockRaven backend.",
    stack: "React, Azure SWA",
    status: "repo-only",
    cost: "$0/mo",
  },
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
    name: "Position Sizing",
    url: "",
    github: "https://github.com/AzharM82/positionsizing",
    purpose: "Lightweight web app for stock position sizing and risk management.",
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
    description: "AI agent at 8:30 AM ET. Calls SIBT, Market Metrics, Capitulation scanner, checks focus stocks for gaps, reads overnight news. Produces a Pushover briefing.",
    category: "AI Agent",
    priority: "high",
  },
  {
    title: "Trade Journal Analyst Agent",
    description: "Voice/text agent that records trades, cross-references with market conditions (SIBT score). Finds behavioral patterns: win rates by condition, time, setup.",
    category: "AI Agent",
    priority: "high",
  },
  {
    title: "StockAgentHub — AI Options Trading",
    description: "3-group agent system: Direction (CALLS/PUTS signals), TOS Scanner (options flow), Schwab Execution (auto-trade). Inspired by MoonDev Trading AI Agents.",
    category: "AI Agent",
    priority: "high",
  },
  {
    title: "Position Watchdog Agent",
    description: "Monitors open positions via Polygon. Pushover alerts on stops hit, targets reached, significant moves. End-of-day P&L summary.",
    category: "AI Agent",
    priority: "medium",
  },
  {
    title: "Focus Stock Curator Agent",
    description: "Weekly agent scanning StockPro's 250+ focus stocks. Flags broken trends for removal, suggests new additions from capitulation recoveries.",
    category: "AI Agent",
    priority: "medium",
  },
  {
    title: "Alert Triage Agent",
    description: "Filters capitulation alerts by trade quality. Checks sector breadth, institutional accumulation, ranks beyond just drop percentage.",
    category: "AI Agent",
    priority: "low",
  },
  {
    title: "Consolidate Market Breadth into StockPro",
    description: "Standalone Market Breadth SWA can be folded into StockPro AI. Remove duplicate deployment.",
    category: "Tool",
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
    const rowKey = p.name.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
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

  // Seed backlog
  for (const b of BACKLOG) {
    const rowKey = b.title.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
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

  return { projects: projectCount, backlog: backlogCount };
}
