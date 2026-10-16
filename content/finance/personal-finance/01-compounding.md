---
title: Compounding — The Only Formula That Matters
description: How money grows on itself, why time dominates rate, what the rule of 72 is for, and why inflation makes the nominal number a lie.
keywords: [compound interest, rule of 72, future value, inflation, real return, time value of money]
updated: 2026-10-04
quiz:
  - q: At 12% a year, roughly how long does money take to double?
    options: ["4 years", "6 years", "9 years", "12 years"]
    answer: 1
    explain: "The rule of 72: 72 ÷ 12 = 6 years. The approximation is good for rates between about 4% and 20%."
  - q: Two people each invest ₹1 lakh a year at 10%. A starts at 25 and stops at 35. B starts at 35 and invests until 60. Who has more at 60?
    options:
      - B, who invested 2.5× as much
      - A, despite investing far less, because the early money compounds for longer
      - They end up equal
      - It depends on the market
    answer: 1
    explain: A's ₹10 lakh compounds for up to 35 years; B's ₹25 lakh for at most 25. Time in the market dominates amount, which is why starting early is the highest-leverage financial decision available.
  - q: Your investment returns 9% while inflation runs at 6%. What is your real return?
    options: ["15%", "9%", "About 3%", "6%"]
    answer: 2
    explain: "Real return ≈ nominal − inflation. Precisely, (1.09 ÷ 1.06) − 1 = 2.8%. Purchasing power is what you can actually spend."
faq:
  - q: Does compounding apply to debt?
    a: Identically, and against you. Credit-card interest at 36% a year doubles a balance in two years if unpaid. The arithmetic does not care which side you are on.
  - q: Is 12% a realistic long-run return?
    a: Indian equity indices have historically delivered roughly 11–13% nominal over long periods, but past returns do not guarantee future ones, and the real (post-inflation) figure is closer to 6–7%. Plan with real returns.
---

:::warning
Educational material, not advice.
:::

Compounding is earning returns on returns. It sounds minor and is not: it is the mechanism behind essentially every large financial outcome, good and bad.

## The formula

```text
FV = PV × (1 + r)ⁿ

FV = future value
PV = present value (what you start with)
r  = return per period, as a decimal
n  = number of periods
```

The thing to notice is that `n` is an **exponent**. Returns grow linearly with the rate and exponentially with time. That asymmetry decides most of what follows.

```text
₹1,00,000 at 10%:
  after 10 years → ₹2,59,374
  after 20 years → ₹6,72,750     (2.6× the 10-year result, not 2×)
  after 30 years → ₹17,44,940    (6.7× the 10-year result)
```

The first decade adds ₹1.6 lakh. The third adds ₹10.7 lakh. Same contribution, same rate — the difference is entirely accumulated base.

## The rule of 72

```text
years to double ≈ 72 ÷ annual return %
```

| Return | Doubling time |
|---|---|
| 4% | 18 years |
| 6% | 12 years |
| 8% | 9 years |
| 12% | 6 years |
| 36% (credit card) | 2 years |

Accurate enough for mental arithmetic between roughly 4% and 20%, and useful for a quick reality check on any product promising to double your money in a stated period: divide 72 by the years and see what return is being implied.

## Time beats amount

The most important demonstration in personal finance:

| | Early Ananya | Late Bhavin |
|---|---|---|
| Invests | ₹1,00,000/yr from age 25 to 35 | ₹1,00,000/yr from age 35 to 60 |
| Years contributing | 10 | 25 |
| Total contributed | **₹10,00,000** | **₹25,00,000** |
| Value at 60 (10%) | **≈ ₹2.13 crore** | **≈ ₹1.08 crore** |

Ananya contributes 40% as much and ends with roughly twice as much. She stopped contributing at 35 and never added another rupee.

:::tip
The practical conclusion: starting is worth more than optimising. Ten years of average returns beginning now beats a perfect strategy beginning in ten years. Waiting to find the best fund is itself a cost, and it is usually larger than the difference between the funds.
:::

## Regular contributions

Most people invest monthly rather than in a lump. The future value of a regular series:

```text
FV = P × [((1 + r)ⁿ − 1) ÷ r]

P = contribution per period
r = return per period  (annual ÷ 12 for monthly)
n = number of periods
```

₹10,000 a month at 12% annual (1% monthly):

| Years | Contributed | Value | Growth |
|---|---|---|---|
| 5 | ₹6,00,000 | ₹8,17,000 | ₹2,17,000 |
| 10 | ₹12,00,000 | ₹23,00,000 | ₹11,00,000 |
| 20 | ₹24,00,000 | ₹99,00,000 | ₹75,00,000 |
| 30 | ₹36,00,000 | ₹3,49,00,000 | ₹3,13,00,000 |

At 30 years, 90% of the corpus is growth rather than contribution. That ratio is the entire argument for long horizons.

## Compounding works against you too

The same formula applied to debt:

| Debt | Rate | ₹1,00,000 unpaid after 3 years |
|---|---|---|
| Credit card | 36% | ₹2,51,000 |
| Personal loan | 15% | ₹1,52,000 |
| Home loan | 8.5% | ₹1,27,700 |

:::danger
Paying down a 36% credit card is a guaranteed, tax-free 36% return. No investment offers that with certainty. **High-interest debt is repaid before anything is invested** — this is not a preference, it is arithmetic.
:::

## Inflation — the number that makes nominal returns a lie

```text
real return ≈ nominal return − inflation
```

More precisely: `(1 + nominal) ÷ (1 + inflation) − 1`.

A fixed deposit at 7% with inflation at 6% returns about 0.9% in purchasing power — and after tax on the full 7% of nominal interest, likely less than zero. The balance grows; what it buys does not.

Run the formula in reverse to see the cost of holding cash:

```text
₹10,00,000 at 6% inflation buys, in today's money:
  after 10 years → ₹5,58,000
  after 20 years → ₹3,12,000
  after 30 years → ₹1,74,000
```

:::warning
"Safe" assets that return less than inflation are not safe — they are a guaranteed slow loss of purchasing power. The risk has been moved from visible volatility to invisible erosion, which is easier to live with and no less real.
:::

Always plan in **real** terms. A retirement target of ₹5 crore in 30 years at 6% inflation is worth about ₹87 lakh in today's money.

## What to remember

- Returns grow linearly with rate and exponentially with time — `n` is the exponent.
- Rule of 72 gives doubling time and sanity-checks any promised return.
- Starting early beats contributing more; ten years of head start is hard to out-save.
- High-interest debt is a guaranteed negative return — clear it first.
- Measure everything in real, post-inflation terms.
