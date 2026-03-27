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
  {
    name: "Should I Be Trading",
    url: "https://yellow-grass-099796a0f.4.azurestaticapps.net",
    github: "https://github.com/AzharM82/should-i-be-trading",
    purpose: "Market quality dashboard — YES/CAUTION/NO decision with scoring across Volatility, Momentum, Trend, Breadth, Macro",
    stack: "React 19, Vite 6, Tailwind 4, Node.js Azure Functions, Polygon.io, FinViz Elite, Yahoo Finance",
    status: "live",
    cost: "$0/mo",
  },
  {
    name: "MultiTimeframe Reversal Scanner",
    url: "https://salmon-river-0a7a0c30f.1.azurestaticapps.net",
    github: "https://github.com/AzharM82/multitimeframerev",
    purpose: "Multi-timeframe reversal scanner with capitulation alerts via Pushover. Daily + weekly capitulation detection for 882 stocks",
    stack: "React 19, Vite 6, Tailwind 4, Node.js Azure Functions, Polygon.io, Redis, Pushover",
    status: "live",
    cost: "$16/mo",
  },
  {
    name: "Market Metrics Dashboard",
    url: "https://gentle-plant-0e85b0b0f.2.azurestaticapps.net",
    github: "https://github.com/AzharM82/market-metrics",
    purpose: "Comprehensive market dashboard — breadth, screeners (Qullamaggie, Minervini, O'Neil), movers, sectors, momentum, economic calendar",
    stack: "React 19, Vite 6, Tailwind 4, Python Azure Functions, FinViz Elite, Polygon.io, Stockbee",
    status: "live",
    cost: "$0/mo",
  },
  {
    name: "Sector Rotation Dashboard",
    url: "https://ambitious-forest-011e9520f.2.azurestaticapps.net",
    github: "https://github.com/AzharM82/sector-rotation",
    purpose: "Sector performance visualization with circle packing, sector tree, and stock detail views",
    stack: "React 19, Vite 7, Tailwind, Python Azure Functions, Polygon.io, Google OAuth",
    status: "live",
    cost: "$0/mo",
  },
  {
    name: "StockPro AI",
    url: "https://stockproai.net",
    github: "https://github.com/AzharM82/industry-runners",
    purpose: "Premium SaaS platform — AI stock analysis (ChartGPT, Deep Research, Halal), breadth, sector rotation, focus stocks, trade management",
    stack: "React 19, Vite 7, Tailwind, Python Azure Functions, Claude API, Polygon.io, PostgreSQL, Redis, Stripe",
    status: "live",
    cost: "$0/mo",
  },
  {
    name: "Ramadan Max Rewards",
    url: "https://brave-cliff-0ab6ad01e.6.azurestaticapps.net",
    github: "",
    purpose: "Islamic habit tracking app for prayers and daily azkaar with progress tracking",
    stack: "React, Vite, Tailwind, Node.js Azure Functions, Azure Table Storage, Microsoft Auth",
    status: "live",
    cost: "$0/mo",
  },
  {
    name: "Azure Cost Manager",
    url: "",
    github: "",
    purpose: "Daily Azure cost report emailer — sends subscription cost breakdown at 7 AM PST via Gmail",
    stack: "Python Azure Functions, Managed Identity, Gmail SMTP",
    status: "live",
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
