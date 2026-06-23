# Anomaly Tracker MCP

Blockchain event sequence anomaly detection for MCP clients and x402-powered agents.

This MCP server gives AI agents access to the ForgeMesh Anomaly Tracker API, which detects unusual financial event sequences before they look obvious on a chart. Powered by NASA-derived sequence mining methods. Returns a human-readable story label and anomaly score (0-100), not just a number.

This package is a thin client around the hosted API:

`https://anomaly.forgemesh.io`

Architecture:

`Agent/MCP client -> this MCP server -> ForgeMesh Anomaly Tracker API`

## Install

```bash
npm install -g @forgemeshlabs/anomaly-mcp
```

Or run directly:

```bash
npx -y @forgemeshlabs/anomaly-mcp
```

## Claude Desktop

```json
{
  "mcpServers": {
    "anomaly-tracker": {
      "command": "npx",
      "args": ["-y", "@forgemeshlabs/anomaly-mcp"],
      "env": {
        "ANOMALY_API_BASE": "https://anomaly.forgemesh.io"
      }
    }
  }
}
```

## Tools

| Tool | Description | Cost |
| --- | --- | --- |
| `get_api_status` | API health check | Free |
| `get_discovery_metadata` | Fetch llms.txt, openapi.json, or x402.json | Free |
| `inspect_x402_challenge` | Inspect x402 payment challenge without settling | Free |
| `detect_sequence_anomaly` | Score a blockchain event window for sequence anomalies | $0.05 USDC |
| `get_model_status` | SequenceMiner model health and training stats per chain | $0.01 USDC |

## Anomaly Detection

The `detect_sequence_anomaly` tool accepts:

- **domain**: Event domain (`financial` is currently live)
- **chain**: `ethereum`, `base`, or `arbitrum`
- **window**: Lookback period: `1h`, `4h`, `24h`, or `168h`

Returns:
- **sequence_score**: 0 (normal) to 100 (highly anomalous)
- **story**: Human-readable label like "Supply Expansion", "Exchange Drain", "Normal Activity"
- **novelty**: `low`, `medium`, `high`, or `extreme`
- **peak_window**: The most anomalous symbol sequence found
- **possible_failure_modes**: What could go wrong if this pattern continues

## Symbol Alphabet

The financial domain tracks 16 event types across whale wallets, exchanges, bridges, and stablecoin issuers:

`WHALE_BUY`, `WHALE_SELL`, `CEX_INFLOW`, `CEX_OUTFLOW`, `BRIDGE_IN`, `BRIDGE_OUT`, `DEX_SWAP`, `DEX_LIQUIDITY_ADD`, `DEX_LIQUIDITY_REMOVE`, `STABLECOIN_MINT`, `STABLECOIN_REDEEM`, `STABLECOIN_BURN`, `TOKEN_MINT`, `TOKEN_BURN`, `FUNDING_SPIKE`, `LIQUIDATION`

## Payment

Paid endpoints use x402 protocol. Agents pay per call in USDC on Base mainnet. No API key needed.

By default, paid endpoints return x402 challenge metadata (pricing, network, wallet) without settling. To settle payments, configure a wallet private key in your agent's x402 client.

## Environment Variables

| Variable | Description | Default |
| --- | --- | --- |
| `ANOMALY_API_BASE` | Hosted API base URL | `https://anomaly.forgemesh.io` |

## Links

- Hosted API: https://anomaly.forgemesh.io
- ForgeMesh: https://forgemesh.io
- npm: https://www.npmjs.com/package/@forgemeshlabs/anomaly-mcp
- GitHub: https://github.com/forgemeshlabs/anomaly-mcp

## License

MIT
