declare const process: { env: Record<string, string | undefined> };
const API_BASE = process.env.ANOMALY_API_BASE || "https://anomaly.forgemesh.io";

export const tools = [
  {
    name: "health_check",
    description: "Check ForgeMesh Anomaly Tracker API health and uptime.",
    inputSchema: { type: "object" as const, properties: {} }
  },
  {
    name: "anomaly_scan",
    description: "Scan a blockchain for sequence anomalies — unusual patterns of whale movements, exchange flows, bridge activity, and stablecoin mints/burns. Returns a story label, anomaly score (0-100), novelty level, and the peak anomalous symbol window. Costs $0.05 USDC on Base mainnet.",
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
          description: "Lookback window (default: 24h)"
        }
      }
    }
  },
  {
    name: "token_scan",
    description: "Anomaly scan for a single token — scores recent transfer patterns for unusual activity (large CEX flows, whale accumulation, token mints/burns). Pass a contract address or well-known symbol. Costs $0.03 USDC on Base mainnet.",
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
          description: "Blockchain to analyze (default: ethereum)"
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
    description: "Get recent whale movements, CEX inflows/outflows, bridge activity, and stablecoin mints/burns from monitored addresses (Binance, Coinbase, Kraken, OKX, Bybit, major bridges, Tether, Circle). Costs $0.02 USDC on Base mainnet.",
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
          description: "Lookback window in hours, 1-168 (default: 4)"
        }
      }
    }
  },
  {
    name: "address_scan",
    description: "Scan any wallet address for anomalous transaction patterns. Classifies each transaction by checking counterparties against known CEX wallets, bridges, and stablecoin issuers. Costs $0.03 USDC on Base mainnet.",
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
          description: "Blockchain to scan (default: ethereum)"
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
    description: "Get SequenceMiner model health and training stats per chain — training sequence count and last retrain time. Costs $0.01 USDC on Base mainnet.",
    inputSchema: {
      type: "object" as const,
      properties: {}
    }
  },
  // ── NFT & DeFi ────────────────────────────────────────────────────────────
  {
    name: "nft_scan",
    description: "Anomaly scan for an NFT collection — detects sweep accumulation, wash trading patterns, and mint surges before they're obvious. Pass a contract address. Returns a story label (e.g. 'Sweep Accumulation', 'Wash Trading Detected') and anomaly score. Costs $0.03 USDC on Base mainnet.",
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
          description: "Blockchain (default: ethereum)"
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
    description: "Anomaly scan for a DeFi protocol — detects unusual flows through major lending and DEX contracts (Uniswap, Aave, Curve, Compound). Pass a protocol name or contract address. Returns a story label and anomaly score. Costs $0.03 USDC on Base mainnet.",
    inputSchema: {
      type: "object" as const,
      properties: {
        protocol: {
          type: "string",
          description: "Protocol name (uniswap_v3, uniswap_v3_r2, aave_v3, aave_v2, curve_3pool, compound_v3) or a 0x contract address"
        },
        chain: {
          type: "string",
          enum: ["ethereum", "base", "arbitrum"],
          description: "Blockchain (default: ethereum)"
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
    description: "Live global sweep of active aviation emergency squawk codes via OpenSky Network. Returns all aircraft currently squawking 7700 (general emergency), 7600 (radio failure), or 7500 (hijack) with position, altitude, and velocity. Costs $0.02 USDC on Base mainnet.",
    inputSchema: {
      type: "object" as const,
      properties: {}
    }
  },
  {
    name: "flight_scan",
    description: "Sequence anomaly analysis for a named airspace region — detects unusual clustering of emergency squawks, rapid descents, or speed anomalies using the SequenceMiner engine. Costs $0.03 USDC on Base mainnet.",
    inputSchema: {
      type: "object" as const,
      properties: {
        region: {
          type: "string",
          enum: ["north_atlantic", "europe", "north_america", "asia_pacific", "middle_east", "africa", "global"],
          description: "Airspace region to analyze (default: global)"
        }
      }
    }
  },
  // ── Creator signals ───────────────────────────────────────────────────────
  {
    name: "trending_signal",
    description: "GitHub repos with anomalous star velocity right now — early signals before mainstream discovery. Detects repos going viral (200+ stars/day), overnight explosions, fork surges, and issue floods. Useful for trend hunting, VC scouting, developer tool discovery. Costs $0.02 USDC on Base mainnet.",
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
    description: "Deep anomaly scan for a single GitHub repository — scores star velocity, fork ratio, overnight explosion signals, and issue flood patterns. Returns a story label (e.g. 'Breakout Signal', 'Viral Activity') and anomaly score. Costs $0.03 USDC on Base mainnet.",
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
  }
];

async function apiGet(path: string): Promise<unknown> {
  const res = await fetch(`${API_BASE}${path}`);
  if (res.status === 402) {
    const challenge = res.headers.get("payment-required");
    let decoded: unknown = null;
    if (challenge) {
      try { decoded = JSON.parse(atob(challenge)); } catch {}
    }
    return {
      x402_status: 402,
      message: "Payment required — this endpoint costs USDC on Base mainnet via x402 protocol.",
      challenge: decoded
    };
  }
  return res.json();
}

async function apiPost(path: string, body: Record<string, unknown>): Promise<unknown> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (res.status === 402) {
    const challenge = res.headers.get("payment-required");
    let decoded: unknown = null;
    if (challenge) {
      try { decoded = JSON.parse(atob(challenge)); } catch {}
    }
    return {
      x402_status: 402,
      message: "Payment required — this endpoint costs USDC on Base mainnet via x402 protocol.",
      challenge: decoded
    };
  }
  return res.json();
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
        region: (args.region as string) || "global"
      });

    case "trending_signal": {
      const days = args.days || "7";
      return apiGet(`/api/trending-signal?days=${days}`);
    }

    case "repo_scan":
      return apiPost("/api/repo-scan", {
        repo: args.repo as string
      });

    default:
      return { error: `Unknown tool: ${name}` };
  }
}
