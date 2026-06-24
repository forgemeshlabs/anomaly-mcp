# Anomaly Tracker MCP

Blockchain event sequence anomaly detection for AI agents. Detects unusual financial event patterns across Ethereum, Base, and Arbitrum using NASA-derived sequence mining. Returns a story label and anomaly score, not just a number.

This MCP server gives AI agents access to the ForgeMesh Anomaly Tracker API via 5 tools — chain-wide anomaly scanning, single-token analysis, whale alerts, model health, and API status.

Thin client architecture:

`Agent/MCP client -> this MCP server -> ForgeMesh Anomaly Tracker API`

Hosted API: `https://anomaly.forgemesh.io`

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
| `health_check` | API health and uptime | Free |
| `anomaly_scan` | Chain-wide sequence anomaly scan — scores event windows for unusual patterns | $0.05 USDC |
| `token_scan` | Single-token anomaly scan — scores transfer patterns for one token | $0.03 USDC |
| `whale_alerts` | Recent whale movements, CEX flows, bridge activity, stablecoin mints/burns | $0.02 USDC |
| `model_status` | SequenceMiner model health and training stats per chain | $0.01 USDC |

### anomaly_scan

Scan a blockchain for sequence anomalies across all monitored addresses.

- **chain**: `ethereum`, `base`, or `arbitrum` (default: ethereum)
- **window**: `1h`, `4h`, `24h`, or `168h` (default: 24h)

Returns: `sequence_score` (0-100), `story` (human label), `novelty`, `peak_window`, `possible_failure_modes`

### token_scan

Anomaly scan for a single token's recent transfer patterns.

- **token** (required): Contract address (`0x...`) or symbol — `usdt`, `usdc`, `weth`, `wbtc`, `link`, `uni`, `aave`, `steth`, `pepe`, `dai`, `cbeth`, `arb`
- **chain**: `ethereum`, `base`, or `arbitrum` (default: ethereum)
- **window**: `1h`, `4h`, `24h`, or `168h` (default: 24h)

Returns: `sequence_score`, `story`, `novelty`, `peak_window`, `transfers` (recent transfer events with source/direction)

### whale_alerts

Recent whale movements from 12+ monitored addresses: Binance, Coinbase, Kraken, OKX, Bybit, Arbitrum/Optimism/Polygon bridges, Tether Treasury, Circle.

- **chain**: `ethereum`, `base`, or `arbitrum` (default: ethereum)
- **hours**: 1-168 (default: 4)

Returns: `alerts` array with `symbol`, `source`, `amount_eth`/`amount_usd`, `timestamp`

## Symbol Alphabet

The financial domain tracks 16 event types:

`WHALE_BUY`, `WHALE_SELL`, `CEX_INFLOW`, `CEX_OUTFLOW`, `BRIDGE_IN`, `BRIDGE_OUT`, `DEX_SWAP`, `DEX_LIQUIDITY_ADD`, `DEX_LIQUIDITY_REMOVE`, `STABLECOIN_MINT`, `STABLECOIN_REDEEM`, `STABLECOIN_BURN`, `TOKEN_MINT`, `TOKEN_BURN`, `FUNDING_SPIKE`, `LIQUIDATION`

## Payment

Paid tools use x402 protocol. Agents pay per call in USDC on Base mainnet. No API key needed.

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
