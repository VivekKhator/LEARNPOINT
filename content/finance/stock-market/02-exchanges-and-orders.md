---
title: Exchanges, Brokers and Order Types
description: How a trade is actually executed, the order book, market versus limit orders, and the costs that quietly shrink your return.
keywords: [stock exchange, order book, market order, limit order, stop loss, bid ask spread, brokerage, demat]
updated: 2026-10-05
quiz:
  - q: What is the bid-ask spread?
    options:
      - The broker's commission
      - The gap between the highest price a buyer will pay and the lowest a seller will accept
      - The daily price range
      - The tax on a trade
    answer: 1
    explain: It is a real cost you pay on entry and exit. Wide spreads on illiquid stocks can exceed brokerage several times over.
  - q: When is a limit order preferable to a market order?
    options:
      - Always
      - When you care more about the price you get than about being filled immediately — especially on thin or volatile stocks
      - Only for selling
      - Never, they execute identically
    answer: 1
    explain: A market order guarantees execution, not price. On an illiquid stock it can fill far from the last traded price.
  - q: What does a stop-loss order do?
    options:
      - Guarantees you cannot lose more than a set amount
      - Triggers an order once the price crosses a level — the eventual fill price is not guaranteed
      - Cancels all open orders
      - Locks in a profit
    answer: 1
    explain: In a gap down, the stop triggers and fills at whatever the market offers, which can be well below your stop price. It limits exposure; it does not cap losses.
faq:
  - q: What is a demat account?
    a: In India, shares are held electronically in a dematerialised account with a depository (NSDL or CDSL). Your broker is the interface; the depository holds the record. They are separate entities, which is a meaningful protection.
  - q: Why did my order not execute even though the price touched my limit?
    a: Exchanges fill in price-time priority. At your limit price, orders placed before yours are filled first. If the price only briefly touched the level, the queue ahead of you may have absorbed all available volume.
---

:::warning
Educational material, not advice. Costs, taxes and regulations differ by country and change over time — verify current rules with your broker and tax authority.
:::

## The chain

```text
You → Broker → Exchange → Clearing corporation → Depository
```

- The **broker** is your access point. They are a member of the exchange; you are not.
- The **exchange** (NSE, BSE, NYSE, LSE) matches buyers and sellers.
- The **clearing corporation** guarantees settlement, so you do not depend on the counterparty being solvent.
- The **depository** holds the electronic record of who owns what.

That separation matters: your shares sit with the depository, not inside your broker. A broker failure is serious and disruptive, but your holdings are not their asset.

## The order book

At any moment the exchange holds a list of unexecuted orders:

```text
        BIDS (buyers)          ASKS (sellers)
  Qty    Price            Price     Qty
  500    102.40           102.55     300
  1,200  102.35           102.60     900
  800    102.30           102.75   1,500
```

- The **best bid** (102.40) is the most anyone will currently pay.
- The **best ask** (102.55) is the least anyone will currently accept.
- The **spread** is the gap — here ₹0.15, about 0.15%.

A trade happens when someone crosses the spread: a buyer accepts 102.55, or a seller accepts 102.40.

:::note
The spread is a real cost, paid on both entry and exit. On a liquid large cap it might be 0.02%. On an illiquid small cap it can be 1–2%, meaning you are down 2–4% the instant you round-trip — before brokerage, before taxes.
:::

## Order types

### Market order

"Fill me now, at whatever price is available."

Guarantees execution, not price. On a liquid stock with a narrow spread this is fine. On a thin one, your order walks up the book — taking 300 at 102.55, then 900 at 102.60, then 1,500 at 102.75 — and the average fill is far from where you saw the price.

### Limit order

"Fill me at this price or better, otherwise wait."

```text
Buy  100 shares, limit ₹102.00   → executes at ₹102.00 or lower, or not at all
Sell 100 shares, limit ₹103.00   → executes at ₹103.00 or higher, or not at all
```

Guarantees price, not execution. This is the default for anyone who is not in a hurry, and it is strictly better on illiquid names.

### Stop-loss

A resting instruction that becomes a live order when the price crosses a trigger.

```text
Hold at ₹100. Stop-loss trigger ₹90, limit ₹89.50.
Price falls through ₹90 → a sell limit at ₹89.50 enters the book.
```

:::danger
A stop-loss does not cap your loss. If the stock gaps from ₹95 to ₹70 overnight on bad news, your ₹90 trigger fires into a market that is at ₹70. With a stop-*limit* at ₹89.50 you may not be filled at all and will still be holding at ₹70. Stops manage exposure in orderly markets; they offer no protection against a gap.
:::

### Common variations

| Type | Meaning |
|---|---|
| Day order | Cancelled at the close if unfilled |
| GTC / GTT | Good till cancelled, or till a set date |
| IOC | Fill whatever is available immediately, cancel the rest |
| AMO | After-market order, queued for the next open |

## Settlement

India runs **T+1**: a trade on Monday settles on Tuesday, when shares and cash actually change hands. The US moved to T+1 in 2024. Between trade and settlement the position is yours economically, but the delivery is pending — which is why selling a share and withdrawing the cash the same day is usually not possible.

## The costs

Returns are gross; what you keep is net. In India a single equity delivery trade typically carries:

| Cost | Rough scale |
|---|---|
| Brokerage | ₹0 to 0.3% (zero at discount brokers for delivery) |
| STT | 0.1% on both buy and sell |
| Exchange fees | ~0.003% |
| SEBI fees, stamp duty | Small but non-zero |
| GST | 18% on brokerage and exchange fees |
| **Bid-ask spread** | 0.02% to 2%+, depending on liquidity |

The spread is the one people forget, and it is frequently the largest line. It does not appear on a contract note, which is precisely why it is easy to ignore.

:::tip
Costs scale with turnover, returns do not. Someone trading weekly pays these costs roughly fifty times a year; someone holding pays them twice. Over a decade the difference in net return is large enough to overwhelm most differences in stock-picking skill.
:::

## What to remember

- Your shares are held by the depository, not by the broker.
- Market orders guarantee execution; limit orders guarantee price. Default to limit.
- A stop-loss manages exposure and does not survive a gap.
- The bid-ask spread is an invisible cost that dwarfs brokerage on illiquid stocks.
