const API_BASE = process.env.ANOMALY_API_BASE || "https://anomaly.forgemesh.io";

export const tools = [
  {
    name: "get_api_status",
    description: "Check ForgeMesh Anomaly Tracker API health.",
    inputSchema: { type: "object" as const, properties: {} }
  },
  {
    name: "get_discovery_metadata",
    description: "Fetch agent discovery files: llms.txt, openapi.json, or .well-known/x402.json.",
    inputSchema: {
      type: "object" as const,
      properties: {
        file: {
          type: "string",
          enum: ["llms.txt", "openapi.json", "x402.json"],
          description: "Which discovery file to fetch"
        }
      },
      required: ["file"]
    }
  },
  {
    name: "inspect_x402_challenge",
    description: "Inspect the x402 payment challenge for a paid endpoint without settling. Returns pricing, network, wallet, and Bazaar metadata.",
    inputSchema: {
      type: "object" as const,
      properties: {
        endpoint: {
          type: "string",
          enum: ["sequence-anomaly", "status"],
          description: "Which paid endpoint to inspect"
        }
      },
      required: ["endpoint"]
    }
  },
  {
    name: "detect_sequence_anomaly",
    description: "Score a blockchain event window for sequence anomalies using NASA ARC-16053-1 SequenceMiner. Returns a story label, anomaly score (0-100), novelty level, and the peak anomalous symbol window. Costs $0.05 USDC on Base mainnet.",
    inputSchema: {
      type: "object" as const,
      properties: {
        domain: {
          type: "string",
          enum: ["financial"],
          description: "Event domain. Currently only 'financial' is live."
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
      }
    }
  },
  {
    name: "get_model_status",
    description: "Get SequenceMiner model health and training stats per chain. Costs $0.01 USDC on Base mainnet.",
    inputSchema: {
      type: "object" as const,
      properties: {}
    }
  }
];

async function apiGet(path: string): Promise<unknown> {
  const res = await fetch(`${API_BASE}${path}`);
  if (res.status === 402) {
    const challenge = res.headers.get("payment-required");
    let decoded: unknown = null;
    if (challenge) {
      try { decoded = JSON.parse(Buffer.from(challenge, "base64").toString()); } catch {}
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
      try { decoded = JSON.parse(Buffer.from(challenge, "base64").toString()); } catch {}
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
    case "get_api_status":
      return apiGet("/health");

    case "get_discovery_metadata": {
      const file = args.file as string;
      const pathMap: Record<string, string> = {
        "llms.txt": "/llms.txt",
        "openapi.json": "/openapi.json",
        "x402.json": "/.well-known/x402.json"
      };
      const path = pathMap[file];
      if (!path) return { error: "Unknown file. Use: llms.txt, openapi.json, or x402.json" };
      if (file === "llms.txt") {
        const res = await fetch(`${API_BASE}${path}`);
        return { content: await res.text() };
      }
      return apiGet(path);
    }

    case "inspect_x402_challenge": {
      const ep = args.endpoint as string;
      if (ep === "sequence-anomaly") {
        return apiPost("/api/sequence-anomaly", { domain: "financial", chain: "ethereum", window: "24h" });
      }
      if (ep === "status") {
        return apiGet("/api/sequence-anomaly/status");
      }
      return { error: "Unknown endpoint. Use: sequence-anomaly or status" };
    }

    case "detect_sequence_anomaly":
      return apiPost("/api/sequence-anomaly", {
        domain: (args.domain as string) || "financial",
        chain: (args.chain as string) || "ethereum",
        window: (args.window as string) || "24h"
      });

    case "get_model_status":
      return apiGet("/api/sequence-anomaly/status");

    default:
      return { error: `Unknown tool: ${name}` };
  }
}
