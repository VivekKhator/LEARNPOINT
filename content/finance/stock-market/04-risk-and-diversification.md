---
title: Risk, Volatility and Diversification
description: Why volatility and risk are not the same thing, what diversification can and cannot remove, and the arithmetic of a drawdown.
keywords: [investment risk, volatility, diversification, correlation, systematic risk, drawdown, asset allocation]
updated: 2026-10-06
quiz:
  - q: A portfolio falls 50%. What return is needed to get back to even?
    options: ["50%", "75%", "100%", "150%"]
    answer: 2
    explain: "₹100 falling 50% leaves ₹50, and ₹50 must double to reach ₹100. Losses and gains are asymmetric, which is why avoiding large drawdowns matters more than capturing every rally."
  - q: What risk does diversification NOT remove?
    options:
      - The risk of one company failing
      - Market-wide (systematic) risk — a recession or rate shock hits almost everything at once
      - Sector concentration risk
      - Single-country risk
    answer: 1
    explain: Spreading across holdings removes company-specific risk. It cannot remove the risk of the whole market falling, which is exactly why equities are expected to return more than cash.
  - q: Two assets both returned 12% a year, one with 10% volatility and one with 30%. Why might the first be preferable?
    options:
      - It is not, the returns are identical
      - Lower volatility means a smaller maximum drawdown, a higher compounded return from the same average, and a much better chance you hold on through the bad period
      - Volatility does not affect returns
      - The second must be fraudulent
    answer: 1
    explain: Volatility drags on compounded returns and, more importantly, drives the behaviour that destroys them — selling at the bottom.
faq:
  - q: How many stocks do I need to be diversified?
    a: Research puts most of the company-specific risk reduction at 20–30 holdings across different sectors. Beyond that, benefit flattens quickly. The harder problem is that 30 holdings require 30 ongoing judgements, which is why index funds exist.
  - q: Is gold a good diversifier?
    a: Its correlation with equities is low and sometimes negative in crises, which is the property you want. It also produces no cash flow, so its long-run real return has been far lower than equities. A diversifier, not an engine.
---

:::warning
Educational material, not advice.
:::

## Volatility is not risk

**Volatility** is how much a price moves around. **Risk** is the chance of a permanent loss of capital. They overlap but are not the same.

- A fund that swings ±30% a year and recovers is volatile. If you hold it for twenty years, the swings are noise.
- A company that goes bankrupt was risky. Its volatility before the end may have been unremarkable.
- An unlisted asset with no daily quote has volatility you cannot see. That is not an absence of risk; it is an absence of measurement.

Volatility gets used as a proxy for risk because it is measurable and risk is not. Keep the distinction in mind when someone describes an investment as "low risk" on the basis of a smooth price line.

## The arithmetic of losses

| Fall | Gain needed to recover |
|---|---|
| −10% | +11% |
| −20% | +25% |
| −33% | +50% |
| −50% | +100% |
| −80% | +400% |

The asymmetry is not intuitive and it is the whole argument for position sizing. A portfolio that avoids catastrophic drawdowns compounds better than one that captures every rally and occasionally halves.

```text
Portfolio A: +30%, −30%, +30%, −30%   →  final value 0.83×  (a 17% loss)
Portfolio B: +8%,  +8%,  +8%,  +8%    →  final value 1.36×
```

Portfolio A has an arithmetic average return of 0%. It still lost money, because gains and losses compound multiplicatively. This gap between the arithmetic average and the compounded (geometric) return widens with volatility — the "volatility drag".

## Types of risk

| Risk | Example | Diversifiable? |
|---|---|---|
| **Company-specific** | A fraud, a failed product, a factory fire | Yes |
| **Sector** | Regulation hits one industry | Yes, across sectors |
| **Market (systematic)** | Recession, rate shock, pandemic | **No** |
| **Currency** | Your home currency strengthens against foreign holdings | Partly, by hedging |
| **Liquidity** | You cannot sell without moving the price | Partly |
| **Inflation** | Returns do not keep up with prices | Partly, via real assets |
| **Behavioural** | You panic-sell at the bottom | Only by planning in advance |

The last one is the most consequential and the least discussed. Study after study finds that investor returns trail the returns of the funds they hold, because money arrives after good years and leaves after bad ones.

## What diversification does

Combining assets that do not move together reduces the volatility of the whole without proportionally reducing the expected return. It is the one genuinely free improvement available.

**Correlation** measures co-movement, from +1 (identical) to −1 (opposite):

| Pair | Typical correlation |
|---|---|
| Two large banks in one country | ~0.8 |
| Equities and government bonds | ~0 to −0.3 |
| Domestic and international equities | ~0.6–0.8 |
| Equities and gold | ~0 |

:::danger
Correlations rise in a crisis. Assets that looked independent in calm markets often fall together when everyone is selling to raise cash. Diversification helps most of the time and helps least exactly when you most want it to.
:::

Holding twelve technology companies is not diversification. They share customers, funding conditions, talent markets and regulatory exposure — and they will fall together.

## Diminishing returns

Going from 1 holding to 10 removes most company-specific risk. From 10 to 30 removes most of the rest. Beyond 30 the benefit is marginal, while the effort of tracking them is not.

This is the practical argument for broad index funds: one purchase gives exposure to hundreds of companies across every sector, at a cost measured in basis points, with no ongoing judgements required.

## Position sizing

A simple rule that survives contact with reality: **no single holding should be able to do permanent damage.** If a position going to zero would change your financial life, it is too large — regardless of how confident you are. Confidence is not information.

## Time horizon changes everything

Equity volatility matters enormously over one year and much less over twenty. Historically, the range of annual outcomes for broad equity markets has been roughly −40% to +50%; the range of 20-year *annualised* outcomes has been far narrower and, in major markets, positive.

The corollary is the rule that makes this practical: **money you need within about five years does not belong in equities.** Not because equities are bad, but because the timing of your need is unrelated to the timing of the market's recovery.

## What to remember

- Volatility is movement; risk is permanent loss. Treat them separately.
- A 50% fall needs a 100% gain — avoiding large drawdowns beats chasing every rally.
- Diversification removes company and sector risk, never market risk, and weakens in a crisis.
- 20–30 uncorrelated holdings capture nearly all the benefit; an index fund gives it in one line.
- Money needed within five years should not be in equities.
