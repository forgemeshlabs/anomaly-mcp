import { createRequire } from "node:module";

const API_BASE = "https://anomaly.forgemesh.io";
// Vendored bounded-fetch guard (60s timeout, 2 MB cap, no redirects, single origin). payTo: [] = this server never signs.
const require = createRequire(import.meta.url);
const { createGuard } = require("../x402-guard.cjs") as {
  createGuard: (o: { baseUrl: string; payTo: string[] }) => {
    fetchBounded: (url: string, init?: Record<string, unknown>) => Promise<{ status: number; headers: Headers; text: string }>;
  };
};
const guard = createGuard({ baseUrl: API_BASE, payTo: [] });

type X402Accept = {
  amount?: string;
  asset?: string;
  network?: string;
  payTo?: string;
  scheme?: string;
  maxTimeoutSeconds?: number;
  extra?: {
    name?: string;
    version?: string;
  };
};

type X402Challenge = {
  accepts?: X402Accept[];
  error?: string;
  resource?: {
    description?: string;
    mimeType?: string;
    url?: string;
  };
  x402Version?: number;
};

export const tools = [
  {
    name: "health_check",
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
    description: "Check ForgeMesh Anomaly Tracker API health and uptime.",
    inputSchema: { type: "object" as const, properties: {} }
  },
  {
    name: "anomaly_scan",
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
    description: "On-chain flow events with an anomaly score: the recent large exchange, bridge and stablecoin flow events on a chain (domain is fixed to financial). Window 1h, 4h, 24h or 168h; 168h is not available on base. Returns JSON with events, observed_symbols, events_collected and source_status, plus score, novelty and story only when the model has real history; otherwise score is null with reason model_not_trained_on_real_data. No events: 409, not charged. Costs $0.05 USDC on Base mainnet.",
    inputSchema: {
      type: "object" as const,
      properties: {
        chain: {
          type: "string",
          enum: ["ethereum", "base", "arbitrum"],
          description: "Blockchain to analyze (default: ethereum)"
        },
        window: {
          type: "string",
          enum: ["1h", "4h", "24h", "168h"],
          description: "Lookback window (default: 24h); 168h is not available on base"
        }
      }
    }
  },
  {
    name: "token_scan",
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
    description: "Token transfer scan: classified recent transfers of one token. Pass token (contract address or symbol such as usdt, usdc, weth, link, pepe), chain (ethereum only for now; base and arbitrum answer 503 without charge) and window (1h, 4h, 24h or 168h). Returns JSON with transfers, observed_symbols, events_collected and source_status; the anomaly score is null with reason model_not_trained_on_real_data until the model has real history. No transfers: 409, not charged. Costs $0.03 USDC on Base mainnet.",
    inputSchema: {
      type: "object" as const,
      properties: {
        token: {
          type: "string",
          description: "Token contract address (0x...) or symbol: usdt, usdc, weth, wbtc, link, uni, aave, steth, pepe, dai, cbeth, arb"
        },
        chain: {
          type: "string",
          enum: ["ethereum", "base", "arbitrum"],
          description: "Blockchain (default: ethereum). Only ethereum is served today; base and arbitrum answer 503 without charge"
        },
        window: {
          type: "string",
          enum: ["1h", "4h", "24h", "168h"],
          description: "Lookback window (default: 24h)"
        }
      },
      required: ["token"]
    }
  },
  {
    name: "whale_alerts",
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
    description: "Whale alerts: large exchange, bridge and stablecoin flows at monitored addresses (major exchanges, L2 bridges, Tether and Circle treasuries). Pass chain (ethereum, base or arbitrum; default ethereum) and hours (1-168, default 4; base up to 96). Returns JSON with chain, window_hours, alert_count, alerts (symbol such as CEX_INFLOW, BRIDGE_IN or STABLECOIN_MINT, source, amount_eth or amount_usd, timestamp) and source_status naming the source and window checked. An empty window is stated explicitly. Costs $0.02 USDC on Base mainnet.",
    inputSchema: {
      type: "object" as const,
      properties: {
        chain: {
          type: "string",
          enum: ["ethereum", "base", "arbitrum"],
          description: "Blockchain to monitor (default: ethereum)"
        },
        hours: {
          type: "integer",
          description: "Lookback window in hours, 1-168 (default: 4; base accepts up to 96)"
        }
      }
    }
  },
  {
    name: "address_scan",
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
    description: "Wallet activity scan: classified recent flows of one wallet (ETH transfers of 10 ETH or more, token transfers, flows with known exchanges and bridges). Pass address (0x...), chain (ethereum only for now; base and arbitrum answer 503 without charge) and window (1h, 4h, 24h or 168h). Returns JSON with activity, observed_symbols and source_status; the anomaly score is null with a reason until the model has real history. No classifiable activity: 409, not charged. Costs $0.03 USDC on Base mainnet.",
    inputSchema: {
      type: "object" as const,
      properties: {
        address: {
          type: "string",
          description: "Wallet address to scan (0x...)"
        },
        chain: {
          type: "string",
          enum: ["ethereum", "base", "arbitrum"],
          description: "Blockchain (default: ethereum). Only ethereum is served today; base and arbitrum answer 503 without charge"
        },
        window: {
          type: "string",
          enum: ["1h", "4h", "24h", "168h"],
          description: "Lookback window (default: 24h)"
        }
      },
      required: ["address"]
    }
  },
  {
    name: "model_status",
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
    description: "Anomaly model status: which model domains can score right now. No parameters. Returns JSON with status, chains (training_sequences, observed_sequences_7d, can_score, last_retrain) and models per domain (observed_sequences_7d, required_sequences_7d, can_score). A domain scores only with at least 10 observed sequences in the last 7 days; check it before relying on a score. Costs $0.01 USDC on Base mainnet.",
    inputSchema: {
      type: "object" as const,
      properties: {}
    }
  },
  // ── NFT & DeFi ────────────────────────────────────────────────────────────
  {
    name: "nft_scan",
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
    description: "NFT collection transfer scan: classified recent transfers of one NFT contract (mints, sweeps, repeated back-and-forth trades). Pass token (NFT contract address), chain (ethereum only for now; base and arbitrum answer 503 without charge) and window (1h, 4h, 24h or 168h). Returns JSON with recent_events, observed_symbols, collection metadata and source_status; the anomaly score is null with a reason until the model has real history. No transfers: 409, not charged. Costs $0.03 USDC on Base mainnet.",
    inputSchema: {
      type: "object" as const,
      properties: {
        token: {
          type: "string",
          description: "NFT contract address (ERC-721 or ERC-1155), e.g. 0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d"
        },
        chain: {
          type: "string",
          enum: ["ethereum", "base", "arbitrum"],
          description: "Blockchain (default: ethereum). Only ethereum is served today; base and arbitrum answer 503 without charge"
        },
        window: {
          type: "string",
          enum: ["1h", "4h", "24h", "168h"],
          description: "Lookback window (default: 24h)"
        }
      },
      required: ["token"]
    }
  },
  {
    name: "defi_scan",
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
    description: "DeFi protocol flow scan: classified value flows at one protocol contract (ETH transfers of 10+ ETH, token transfers, flows with known exchanges and bridges; plain contract calls are not classified). Pass protocol (uniswap_v3, aave_v3, aave_v2, curve_3pool, compound_v3 or a contract address), chain (ethereum only for now) and window. Returns JSON with activity and observed_symbols; the score is null with a reason until the model has real history. Nothing classifiable: 409, not charged. Costs $0.03 USDC on Base mainnet.",
    inputSchema: {
      type: "object" as const,
      properties: {
        protocol: {
          type: "string",
          description: "Protocol name (uniswap_v3, aave_v3, aave_v2, curve_3pool, compound_v3) or a 0x contract address"
        },
        chain: {
          type: "string",
          enum: ["ethereum", "base", "arbitrum"],
          description: "Blockchain (default: ethereum). Only ethereum is served today; base and arbitrum answer 503 without charge"
        },
        window: {
          type: "string",
          enum: ["1h", "4h", "24h", "168h"],
          description: "Lookback window (default: 24h)"
        }
      },
      required: ["protocol"]
    }
  },
  // ── Aviation ──────────────────────────────────────────────────────────────
  {
    name: "squawk_alerts",
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
    description: "Aircraft emergency squawk alerts: aircraft currently transmitting transponder code 7500 (hijack), 7600 (radio failure) or 7700 (general emergency), as heard by the adsb.lol volunteer receiver network (ODbL data; coverage is thin over oceans and sparse regions). No parameters. Returns JSON with as_of, emergency_count, by_type and alerts (icao24, callsign, registration, squawk, squawk_type, latitude, longitude, altitude). None active is a valid answer and says so. Source down: 503, not charged. Costs $0.02 USDC on Base mainnet.",
    inputSchema: {
      type: "object" as const,
      properties: {}
    }
  },
  {
    name: "flight_scan",
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
    description: "Airspace scan: classified air-traffic events in a region (emergency squawks, rapid descents, speed outliers) from adsb.lol volunteer receivers (ODbL data), sampled with 250 NM circles, not the whole region. Pass region (required). Returns JSON with as_of, total_aircraft, airborne and observed_symbols; the score is null with a reason until the model has real history. No aircraft heard: 409; source down: 503; not charged. Costs $0.03 USDC on Base mainnet.",
    inputSchema: {
      type: "object" as const,
      properties: {
        region: {
          type: "string",
          enum: ["north_atlantic", "europe", "north_america", "asia_pacific", "middle_east", "africa"],
          description: "Airspace region to analyze (required)"
        }
      },
      required: ["region"]
    }
  },
  // ── Creator signals ───────────────────────────────────────────────────────
  {
    name: "trending_signal",
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
    description: "Trending GitHub repos: new repositories with unusually fast star growth. Pass days (3, 7, 14 or 30; default 7, echoed; any other value is a 400). Returns JSON with signals ranked by star velocity (full_name, stars, stars_per_day, fork_ratio, language), signal_count and scanned count. The overall score is null with reason model_not_trained_on_real_data until the model has real history. Costs $0.02 USDC on Base mainnet.",
    inputSchema: {
      type: "object" as const,
      properties: {
        days: {
          type: "string",
          enum: ["3", "7", "14", "30"],
          description: "Search repos created in the last N days (default: 7)"
        }
      }
    }
  },
  {
    name: "repo_scan",
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
    description: "GitHub repo growth scan: growth metrics for one repository. Pass repo (owner/repo, e.g. vercel/ai). Returns JSON with metrics (stars, stars_per_day, fork_ratio, age_days, language) and observed_symbols (velocity signals such as HOT_REPO or FORK_SURGE). The anomaly score is null with reason model_not_trained_on_real_data until the model has real history. Unknown repo: 404, not charged. Costs $0.03 USDC on Base mainnet.",
    inputSchema: {
      type: "object" as const,
      properties: {
        repo: {
          type: "string",
          description: "GitHub repo in owner/repo format, e.g. vercel/ai or microsoft/vscode"
        }
      },
      required: ["repo"]
    }
  },
  // ── GitHub activity watch ─────────────────────────────────────────────────
  {
    name: "github_watch",
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
    description: "GitHub repo activity watch: recent public event activity for one repository. Pass repo (owner/repo). Returns JSON with total_events, unique_actors, bot_ratio, event_breakdown (commits, PR merges, PR opens, issues), recent_events and observed_symbols (e.g. COMMIT_BURST, MERGE_RUSH). The anomaly score is null with a reason until the model has real history. No public events: 409, not charged. Costs $0.03 USDC on Base mainnet.",
    inputSchema: {
      type: "object" as const,
      properties: {
        repo: {
          type: "string",
          description: "GitHub repo in owner/repo format, e.g. vercel/ai"
        }
      },
      required: ["repo"]
    }
  },
  {
    name: "claude_feature_watch",
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
    description: "Claude and Anthropic release watch: recently merged pull requests across Anthropic's public Claude repos. Pass days (an integer 1-30; default 7, echoed; anything else is a 400, not charged). Returns JSON with features_merged, repos_scanned, since, days, by_repo counts and features (title, repo, merged_at, author, labels). Costs $0.02 USDC on Base mainnet.",
    inputSchema: {
      type: "object" as const,
      properties: {
        days: {
          type: "integer",
          description: "Lookback window in days, 1-30 (default: 7)"
        }
      }
    }
  },
  // ── Real-time polling endpoints ──────────────────────────────────────────
  {
    name: "mempool_anomaly",
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
    description: "Mempool monitor: gas level and pending-transaction snapshot on Ethereum or Base. Pass chain (ethereum or base; default ethereum). Returns JSON with pending_count, gas (current_gwei, base_fee_gwei, median_20block_gwei, ratio_vs_median), pending_stats (total_value_eth, contract_deploys, big_swaps, whale_pending) and observed_symbols. The anomaly score is null with a reason until the model has real history. Built for frequent polling. Costs $0.01 USDC on Base mainnet.",
    inputSchema: {
      type: "object" as const,
      properties: {
        chain: {
          type: "string",
          enum: ["ethereum", "base"],
          description: "Blockchain (default: ethereum). Only Ethereum and Base have RPC mempool access."
        }
      }
    }
  },
  {
    name: "depeg_monitor",
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
    description: "Stablecoin depeg monitor: current price and deviation from the 1 USD peg for USDC, USDT and DAI (coins tracked vary by chain). Pass chain (ethereum, base or arbitrum; default ethereum). Returns JSON with overall_status (e.g. PEG_STABLE, PEG_DRIFT), max_deviation_pct, drift_count and per-coin price, deviation_pct and status. The sequence score is null with a reason until the model has real history. Costs $0.01 USDC on Base mainnet.",
    inputSchema: {
      type: "object" as const,
      properties: {
        chain: {
          type: "string",
          enum: ["ethereum", "base", "arbitrum"],
          description: "Blockchain (default: ethereum)"
        }
      }
    }
  }
];

function parsePaymentChallenge(header: string | null): X402Challenge | null {
  if (!header) return null;
  try {
    return JSON.parse(atob(header)) as X402Challenge;
  } catch {
    return null;
  }
}

function formatAtomicUsdc(amount: string | undefined): string | null {
  if (!amount || !/^\d+$/.test(amount)) return null;
  const padded = amount.padStart(7, "0");
  const whole = padded.slice(0, -6) || "0";
  const fraction = padded.slice(-6).replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : whole;
}

function paymentRequiredResponse(path: string, challenge: X402Challenge | null): Record<string, unknown> {
  const accept = challenge?.accepts?.[0];
  const amountUsdc = formatAtomicUsdc(accept?.amount);
  const url = challenge?.resource?.url || `${API_BASE}${path}`;

  return {
    x402_status: 402,
    payment_required: true,
    message: amountUsdc
      ? `Payment required: ${amountUsdc} USDC on Base.`
      : "Payment required: USDC on Base.",
    payment: {
      amount_usdc: amountUsdc,
      amount_atomic: accept?.amount || null,
      asset: accept?.extra?.name || "USDC",
      asset_address: accept?.asset || null,
      network: accept?.network || "eip155:8453",
      pay_to: accept?.payTo || null,
      scheme: accept?.scheme || "exact",
      max_timeout_seconds: accept?.maxTimeoutSeconds || null
    },
    resource: {
      url,
      description: challenge?.resource?.description || null,
      mime_type: challenge?.resource?.mimeType || "application/json"
    },
    next_step: "Pay this x402 challenge with a compatible client, then retry the same tool call."
  };
}

async function apiGet(path: string): Promise<unknown> {
  const res = await guard.fetchBounded(path);
  if (res.status === 402) {
    return paymentRequiredResponse(path, parsePaymentChallenge(res.headers.get("payment-required")));
  }
  return JSON.parse(res.text);
}

async function apiPost(path: string, body: Record<string, unknown>): Promise<unknown> {
  const res = await guard.fetchBounded(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (res.status === 402) {
    return paymentRequiredResponse(path, parsePaymentChallenge(res.headers.get("payment-required")));
  }
  return JSON.parse(res.text);
}

export async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case "health_check":
      return apiGet("/health");

    case "anomaly_scan":
      return apiPost("/api/sequence-anomaly", {
        domain: "financial",
        chain: (args.chain as string) || "ethereum",
        window: (args.window as string) || "24h"
      });

    case "token_scan":
      return apiPost("/api/token-scan", {
        token: args.token as string,
        chain: (args.chain as string) || "ethereum",
        window: (args.window as string) || "24h"
      });

    case "whale_alerts": {
      const chain = (args.chain as string) || "ethereum";
      const hours = args.hours || 4;
      return apiGet(`/api/whale-alerts?chain=${chain}&hours=${hours}`);
    }

    case "address_scan":
      return apiPost("/api/address-scan", {
        address: args.address as string,
        chain: (args.chain as string) || "ethereum",
        window: (args.window as string) || "24h"
      });

    case "model_status":
      return apiGet("/api/sequence-anomaly/status");

    case "nft_scan":
      return apiPost("/api/nft-scan", {
        token: args.token as string,
        chain: (args.chain as string) || "ethereum",
        window: (args.window as string) || "24h"
      });

    case "defi_scan":
      return apiPost("/api/defi-scan", {
        protocol: args.protocol as string,
        chain: (args.chain as string) || "ethereum",
        window: (args.window as string) || "24h"
      });

    case "squawk_alerts":
      return apiGet("/api/squawk-alerts");

    case "flight_scan":
      return apiPost("/api/flight-scan", {
        region: args.region as string
      });

    case "trending_signal": {
      const days = args.days || "7";
      return apiGet(`/api/trending-signal?days=${days}`);
    }

    case "repo_scan":
      return apiPost("/api/repo-scan", {
        repo: args.repo as string
      });

    case "github_watch":
      return apiPost("/api/github-watch", {
        repo: args.repo as string
      });

    case "claude_feature_watch": {
      const cfDays = args.days || 7;
      return apiGet(`/api/claude-feature-watch?days=${cfDays}`);
    }

    case "mempool_anomaly": {
      const mpChain = (args.chain as string) || "ethereum";
      return apiGet(`/api/mempool-anomaly?chain=${mpChain}`);
    }

    case "depeg_monitor": {
      const dpChain = (args.chain as string) || "ethereum";
      return apiGet(`/api/depeg-monitor?chain=${dpChain}`);
    }

    default:
      return { error: `Unknown tool: ${name}` };
  }
}
