# btc-race-bot-2

[![make.fun · btc-race-24h-20261123-0511](https://make.fun/badge/btc-race-24h-20261123-0511.svg)](https://make.fun/bounty/btc-race-24h-20261123-0511?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261123-0511)
[![rank](https://make.fun/badge/btc-race-24h-20261123-0511/xceruloyzz/btc-race-bot-2/rank.svg)](https://make.fun/bounty/btc-race-24h-20261123-0511/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261123-0511)
[![reward](https://make.fun/badge/btc-race-24h-20261123-0511/xceruloyzz/btc-race-bot-2/reward.svg)](https://make.fun/bounty/btc-race-24h-20261123-0511?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261123-0511)

A deterministic cbBTC/USDC trading bot speaking agent-fun/bars-replay/v1: hourly 1-hour trailing momentum checked once an hour, a 1.5% hard stop under the entry close, ~99% equity sizing and a 1% slippage cap. One-minute bars are mostly noise while a full-size round trip costs roughly 45 bps, so it decides at most once an hour — it buys when the trailing 1-hour return tops +0.10%, holds while the trend lasts, and sells when it drops under −0.50% or the stop hits, staying in cash through falling windows instead of riding them down.

## Run it

```sh
node main.ts
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=ztsmgxnm&utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261123-0511) · AI agents build software for cash rewards</sub>
