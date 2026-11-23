// Hourly-momentum cbBTC bot for agent-fun/bars-replay/v1.
//
// Idea: 1-minute bars are mostly noise (about 8 bps of typical move) while a
// full-size round trip costs roughly 45 bps in fee, slippage and price impact,
// so a bot that trades every wiggle bleeds out. This bot therefore decides at
// most once an hour, rides the hourly trend while it lasts, and sits in cash
// otherwise:
//
// - Every 60 bars, compare the latest close with the close 60 bars earlier.
//   A trailing 1-hour return above +0.10% is an uptrend: if flat, buy with 99%
//   of equity.
// - While holding, the same hourly check exits when the trailing 1-hour
//   return falls below -0.50%: a clear downtrend, not noise.
// - A hard stop, checked on every bar, sells if the latest close is 1.5%
//   under the close the position was entered on, capping a bad entry.
//
// Sizing is the whole account on one asset (at most one open position, long
// only), orders cap slippage at 100 bps past the close they were decided on,
// and everything is deterministic: closes only, no clock, no network, no
// randomness.

import { runBars, type BarsState, type BuyInput, type SellInput } from './vendor/makefun-bars.ts';

const SYMBOL = 'CBBTC';
const LOOKBACK = 60; // 1 hour of 1-minute bars
const REBALANCE = 60; // decide at most once an hour
const ENTRY_RETURN = 0.001; // buy when the trailing 1h return tops +0.10%
const EXIT_RETURN = -0.005; // sell when it drops under -0.50%
const STOP_NUM = 197; // sell if the close is under 197/200 = 98.5% of the entry close
const STOP_DEN = 200;
const WEIGHT_NUM = 99n; // spend 99% of equity on an entry
const WEIGHT_DEN = 100n;
const SLIP = 100; // max_slippage_bps: 1% past the decision close

const closes: number[] = [];
let entryClose: number | null = null;

await runBars({
  onBatch(state: BarsState, batch) {
    let bar = null;
    for (const b of batch.bars) {
      if (b.symbol === SYMBOL) bar = b;
    }
    if (bar === null) return [];
    const close = Number(bar.c);
    closes.push(close);
    const held = state.positions.get(SYMBOL);

    // Hard stop on every bar: cut a position 1.5% under its entry close.
    if (held !== undefined && held.qty > 0n && entryClose !== null) {
      if (close * STOP_DEN <= entryClose * STOP_NUM) {
        entryClose = null;
        const sell: SellInput = { side: 'sell', symbol: SYMBOL, qty: held.qty, max_slippage_bps: SLIP };
        return [sell];
      }
    }

    // Trend decisions only on rebalance bars, once enough history exists.
    if (state.seq % REBALANCE !== 0 || closes.length <= LOOKBACK) return [];
    const trailing = close / closes[closes.length - LOOKBACK - 1] - 1;

    if (held !== undefined && held.qty > 0n) {
      if (trailing < EXIT_RETURN) {
        entryClose = null;
        const sell: SellInput = { side: 'sell', symbol: SYMBOL, qty: held.qty, max_slippage_bps: SLIP };
        return [sell];
      }
      return [];
    }
    if (trailing > ENTRY_RETURN) {
      let stake = (state.equity * WEIGHT_NUM) / WEIGHT_DEN;
      if (stake > state.cash) stake = state.cash;
      const room = state.weightRoom(SYMBOL);
      if (stake > room) stake = room;
      if (stake >= BigInt(state.hello.fees.min_notional_quote_units)) {
        entryClose = close;
        const buy: BuyInput = { side: 'buy', symbol: SYMBOL, notional_quote_units: stake, max_slippage_bps: SLIP };
        return [buy];
      }
    }
    return [];
  },
});
