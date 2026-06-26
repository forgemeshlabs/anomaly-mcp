# Anomaly Tracker MCP

[![anomaly-mcp MCP server](https://glama.ai/mcp/servers/forgemeshlabs/anomaly-mcp/badges/card.svg)](https://glama.ai/mcp/servers/forgemeshlabs/anomaly-mcp)

Multi-domain sequence anomaly detection for AI agents. Detects unusual event patterns across blockchain markets, live airspace, and GitHub repositories using NASA-derived sequence mining. Returns a story label and anomaly score, not just a number.

This MCP server gives AI agents access to the ForgeMesh Anomaly Tracker API via 16 tools spanning blockchain, aviation, GitHub, and real-time market monitoring domains.

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
| `anomaly_scan` | Chain-wide sequence anomaly scan | $0.05 USDC |
| `token_scan` | Best-effort single-token transfer anomalies with source status | $0.03 USDC |
| `whale_alerts` | Whale movements, CEX flows, bridge activity | $0.02 USDC |
| `address_scan` | Wallet transaction pattern anomalies | $0.03 USDC |
| `model_status` | SequenceMiner model health per chain | $0.01 USDC |
| `nft_scan` | Best-effort NFT collection anomalies with source status | $0.03 USDC |
| `defi_scan` | DeFi protocol flow anomalies | $0.03 USDC |
| `squawk_alerts` | Best-effort live aviation emergency squawk codes with source status | $0.02 USDC |
| `flight_scan` | Airspace region anomaly analysis | $0.03 USDC |
| `trending_signal` | GitHub repos with anomalous star velocity | $0.02 USDC |
| `repo_scan` | Deep repo velocity/fork anomaly scan | $0.03 USDC |
| `github_watch` | Repo activity stream anomalies | $0.03 USDC |
| `claude_feature_watch` | Anthropic/Claude merged feature alerts | $0.02 USDC |
| `mempool_anomaly` | Real-time mempool anomaly score for 5-second polling | $0.01 USDC |
| `depeg_monitor` | Real-time stablecoin depeg detector for 1-minute polling | $0.01 USDC |

### Blockchain Tools

**anomaly_scan** — Scan a blockchain for sequence anomalies across all monitored addresses.
- **chain**: `ethereum`, `base`, or `arbitrum` (default: ethereum)
- **window**: `1h`, `4h`, `24h`, or `168h` (default: 24h)
- Returns: `sequence_score` (0-100), `story` (human label), `novelty`, `peak_window`, `possible_failure_modes`

**token_scan** — Best-effort anomaly scan for a single token's recent transfer patterns. Paid output includes source status and coverage notes so agents can distinguish "quiet token" from source coverage issues.
- **token** (required): Contract address (`0x...`) or symbol — `usdt`, `usdc`, `weth`, `wbtc`, `link`, `uni`, `aave`, `steth`, `pepe`, `dai`, `cbeth`, `arb`
- **chain**: `ethereum`, `base`, or `arbitrum` (default: ethereum)
- **window**: `1h`, `4h`, `24h`, or `168h` (default: 24h)

**whale_alerts** — Recent whale movements from 12+ monitored addresses: Binance, Coinbase, Kraken, OKX, Bybit, major bridges, Tether, Circle.
- **chain**: `ethereum`, `base`, or `arbitrum` (default: ethereum)
- **hours**: 1-168 (default: 4)

**address_scan** — Scan any wallet address for anomalous transaction patterns.
- **address** (required): Wallet address (`0x...`)
- **chain**: `ethereum`, `base`, or `arbitrum`
- **window**: `1h`, `4h`, `24h`, or `168h`

**nft_scan** — Best-effort anomaly scan for an NFT collection — sweep accumulation, wash trading, mint surges. Paid output includes source status and coverage notes.
- **token** (required): ERC-721/ERC-1155 contract address

**defi_scan** — Anomaly scan for DeFi protocols — unusual flows through Uniswap, Aave, Curve, Compound.
- **protocol** (required): Protocol name or `0x` address

### Aviation Tools

**squawk_alerts** — Best-effort live global sweep of aircraft squawking 7700 (emergency), 7600 (radio failure), or 7500 (hijack). Paid output includes source status, monitored scope, and coverage notes.

**flight_scan** — Sequence anomaly analysis for a named airspace region.
- **region**: `north_atlantic`, `europe`, `north_america`, `asia_pacific`, `middle_east`, `africa`, or `global`

### GitHub Tools

**trending_signal** — GitHub repos with anomalous star velocity — early signals before mainstream discovery.
- **days**: `3`, `7`, `14`, or `30` (default: 7)

**repo_scan** — Deep anomaly scan for a single repository — star velocity, fork ratio, overnight explosion signals.
- **repo** (required): `owner/repo` format

**github_watch** — Watch a repo's activity stream for anomalous development patterns — commit bursts, force pushes, issue floods, merge rushes, bot takeovers.
- **repo** (required): `owner/repo` format

**claude_feature_watch** — Watch Anthropic/Claude repos for recently merged features. Scans anthropic-sdk-python, anthropic-sdk-typescript, claude-code, courses, and anthropic-cookbook.
- **days**: 1-30 (default: 7)

### Real-Time Tools

**mempool_anomaly** — Real-time mempool anomaly score for gas spikes, MEV signals, pending whale swaps, contract deploy bursts, and priority fee wars.
- **chain**: `ethereum` or `base` (default: ethereum)

**depeg_monitor** — Real-time stablecoin depeg detector for USDC, USDT, and DAI micro-deviations, stablecoin spreads, and volume spikes.
- **chain**: `ethereum`, `base`, or `arbitrum` (default: ethereum)

## Symbol Alphabets

**Financial**: `WHALE_BUY`, `WHALE_SELL`, `CEX_INFLOW`, `CEX_OUTFLOW`, `BRIDGE_IN`, `BRIDGE_OUT`, `DEX_SWAP`, `DEX_LIQUIDITY_ADD`, `DEX_LIQUIDITY_REMOVE`, `STABLECOIN_MINT`, `STABLECOIN_REDEEM`, `STABLECOIN_BURN`, `TOKEN_MINT`, `TOKEN_BURN`, `FUNDING_SPIKE`, `LIQUIDATION`

**NFT**: `NFT_MINT`, `NFT_BURN`, `NFT_SALE`, `NFT_SWEEP`, `NFT_WASH_TRADE`

**Aviation**: `ENROUTE`, `SQUAWK_7700`, `SQUAWK_7600`, `SQUAWK_7500`, `RAPID_DESCENT`, `RAPID_CLIMB`, `HIGH_SPEED`, `NEAR_STALL`

**Creator**: `VIRAL_REPO`, `HOT_REPO`, `EMERGING_REPO`, `STEADY_REPO`, `QUIET_REPO`, `FORK_SURGE`, `BOOKMARK_ONLY`, `ISSUE_FLOOD`, `OVERNIGHT_STAR`, `RAPID_GROWTH`

**GitHub Watch**: `COMMIT_PUSH`, `COMMIT_BURST`, `FORCE_PUSH`, `ISSUE_OPEN`, `ISSUE_CLOSE`, `ISSUE_COMMENT`, `ISSUE_FLOOD`, `PR_OPEN`, `PR_MERGE`, `PR_CLOSE`, `PR_REVIEW`, `MERGE_RUSH`, `BRANCH_CREATE`, `BRANCH_DELETE`, `TAG_CREATE`, `RELEASE_PUBLISH`, `FORK_EVENT`, `STAR_EVENT`, `BOT_DOMINATED`, `SOLO_OPERATOR`

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
