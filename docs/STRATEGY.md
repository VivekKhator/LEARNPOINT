# Which other domain should this engine be pointed at?

**Short answer: yes, and the technology vertical is the weakest commercial choice of
the lot.** The engine in this repository is deliberately domain-agnostic because the
defensible money in "learn by reading" sites is no longer in explaining `for` loops.

This document explains the reasoning, ranks six candidate domains against a scoring
model, and gives an execution sequence. The Finance vertical already in `content/`
is the working proof that a new domain costs one config entry and a folder of
Markdown.

---

## 1. The structural problem you must design around first

The W3Schools / JavatPoint business model is: rank for high-volume informational
keywords → serve display ads → monetise at $2–8 RPM. That model is being
compressed from three directions at once:

1. **Answer engines remove the click.** Google AI Overviews, ChatGPT and Perplexity
   answer "what is a python dictionary" in the result surface. Informational
   queries with a single stable factual answer are precisely the ones that lose
   traffic first. Industry zero-click measurements have been trending up for years
   and accelerated sharply after generative results shipped.
2. **The content is already in the model.** An LLM trained on the open web knows
   Python syntax better than any tutorial site. There is no information asymmetry
   left to monetise.
3. **Display ad RPM is the floor of monetisation.** Even winning the traffic game
   yields single-digit dollars per thousand pageviews.

The strategic conclusion is not "don't build this". It is: **choose a domain where
the three pressures above are weakest**, and attach a monetisation layer that is not
display advertising.

### The four properties that survive

| Property | Why it matters now |
|---|---|
| **Volatility** | Content that changes every year (tax rules, regulations, standards) is stale in any model's training data. Freshness is a moat an LLM cannot hold. |
| **Jurisdiction-specificity** | "How is LTCG taxed" has a different answer in India, the UK and the US. General models give confidently wrong, averaged answers. |
| **Credential gating** | If passing an exam unlocks a salary band, people pay for preparation. Nobody pays to learn `for` loops. |
| **Liability** | When being wrong is expensive — compliance, clinical coding, safety — buyers want an accountable source, not a chatbot. A *named, dated, cited* page is the product. |

Score any domain on those four before you score it on search volume.

---

## 2. Six domains, scored

Scored 1–5 (5 is best for an operator). "AI-resistance" is how poorly a general
model answers the domain's core queries without a live, jurisdiction-correct source.

| Domain | Demand | Monetisation ceiling | AI-resistance | Competition (5 = weak) | Content cost (5 = cheap) | **Total** |
|---|---|---|---|---|---|---|
| **Compliance & data/AI regulation** | 4 | **5** | **5** | **5** | 2 | **26** |
| **Healthcare: medical coding & allied certification** | 4 | **5** | 4 | 4 | 2 | **24** |
| **Finance, tax & investing** (shipped here) | **5** | 4 | 4 | 3 | 4 | **24** |
| **Skilled trades & safety certification** | 3 | 4 | **5** | **5** | 2 | **22** |
| **AI / LLM engineering** | **5** | 3 | 2 | 2 | 4 | **19** |
| **Competitive & government exams (India)** | **5** | 2 | 3 | 1 | 3 | **18** |

### Rank 1 — Compliance, privacy and AI regulation

GDPR, India's DPDP Act, HIPAA, SOC 2, ISO 27001, PCI-DSS, the EU AI Act.

- **Why it wins:** the regulation genuinely changes, the answer is
  jurisdiction-specific, being wrong has legal consequences, and the buyer is a
  company rather than a student. B2B willingness to pay for compliance training is
  orders of magnitude above consumer edtech.
- **Monetisation:** team seats, certification with a verifiable certificate,
  policy-template downloads, vendor sponsorship from the compliance-tooling
  category (which has large, well-funded players buying attention).
- **Risk:** you must be, or must retain, a subject-matter expert. Publishing
  incorrect compliance guidance is the one domain here where the liability runs
  back at you. Every page needs a named author, a last-reviewed date and a citation
  to the primary legal text.
- **The asymmetry:** the "learn by reading, chapter by chapter, free" format is
  almost absent in this space. It is currently served by dense law-firm PDFs and
  expensive instructor-led courses. The gap is real.

### Rank 2 — Medical coding and allied-health certification

ICD-10-CM, CPT, HCPCS; CPC, CCS, CPMA exam preparation; also phlebotomy, pharmacy
technician, medical billing.

- **Why it wins:** code sets are revised annually, the work is credential-gated,
  and US salaries make exam prep a clear-return purchase. Search intent is highly
  commercial.
- **Monetisation:** exam-prep subscriptions, practice-question banks (ideal fit for
  this engine's quiz system), employer and training-provider partnerships.
- **Risk:** accuracy requirements are severe, and code sets are licensed — you
  cannot republish CPT verbatim. You teach the *method* and reference the codes.
- **Content cost:** genuinely high. You need a certified coder on the team.

### Rank 3 — Finance, tax and investing *(implemented in this repository)*

- **Why it's here:** the highest-CPM advertising category on the internet, enormous
  and permanently renewing search volume, and tax rules that change every budget
  cycle — so the content both ranks and stays AI-resistant.
- **Monetisation:** broker and fund affiliate programmes, high-CPM display,
  premium calculators and model portfolios, newsletter sponsorship.
- **Risk:** the most regulated of the consumer options. In India, investment advice
  requires SEBI registration; the UK, US and EU have equivalents. **Education is
  legal; recommendations are not.** The chapters in `content/finance/` carry an
  explicit educational-only banner and give no buy/sell guidance. That is a
  deliberate structural choice, not a disclaimer habit.
- **Why it's the right *second* vertical rather than the first:** it is the cheapest
  high-value domain to write, which makes it the best proof that the engine is
  domain-agnostic without committing to a specialist payroll.

### Rank 4 — Skilled trades and safety certification

HVAC and EPA 608, electrical code (NEC), welding (AWS), forklift and OSHA safety.

- **Why it's interesting:** almost nobody is building good web-native content here,
  the workforce is ageing out, and codes are revised on a published cycle. Weak
  competition plus mandatory certification is a rare combination.
- **Risk:** the audience is less online-native and converts differently. Acquisition
  may need trade schools and employers rather than organic search alone.

### Rank 5 — AI / LLM engineering

Highest demand growth of anything on this list — and the worst *durable* position.
The content is what the models are best at explaining, half-life is months, and
every major lab publishes better documentation for free. **Build it as top-of-funnel
for a higher-margin vertical, not as the business.**

### Rank 6 — Competitive and government exams (India)

Vast volume, enormous intent — and a saturated market with funded incumbents
(Unacademy, PhysicsWallah, Testbook) and low ad RPM. Winnable only in a narrow,
neglected exam niche, never head-on.

---

## 3. The monetisation stack, in the order you should add it

Display advertising is the floor, not the plan. Layer upward:

| Layer | Example | Revenue per 1,000 readers |
|---|---|---|
| 1. Display ads | AdSense, Ezoic | $2–8 |
| 2. Affiliate | Broker signup, tool referral, book | $10–60 |
| 3. Email list | Newsletter sponsorship | $20–80 |
| 4. Digital product | Exam-prep bank, templates, cheat-sheet pack | $50–300 |
| 5. Certification | Proctored assessment + verifiable certificate | $200–1,500 |
| 6. **B2B seats** | Team compliance training, SSO, reporting | $1,000–10,000+ |

Each layer needs the one below it as its funnel. The content earns attention; the
layers above capture value from it. A site that only ever reaches layer 1 is the
model under threat from answer engines.

**Build the email list from day one.** It is the only distribution asset that no
algorithm change can take away from you.

---

## 4. Moats, in descending order of durability

1. **Recency and review dates.** Publish a visible *last reviewed* date and keep it
   honest. In a volatile domain this beats any amount of backlink building.
2. **Named expert authorship.** A credentialed author with a bio satisfies search
   quality signals *and* the trust requirement that makes a human prefer you to a
   chatbot.
3. **Interactive tools.** Calculators, quiz banks, the sandbox playground in this
   repo. A tool is a destination; an explanation is a snippet. Answer engines
   summarise prose — they cannot replace a tool the reader operates.
4. **Structured data.** `Course`, `FAQPage`, `TechArticle` and `BreadcrumbList` are
   already emitted by the build. They are how you stay present in AI result
   surfaces even when the blue link gets fewer clicks.
5. **Community and user-generated content.** Comments, corrections, question
   threads. This is what pushed Stack Overflow past every documentation site, and
   it is the asset nobody can scrape into a model as a finished product.

---

## 5. Execution sequence

**Days 1–30 — Prove the niche before you build the library.**
Pick one domain and one *sub*-topic (not "compliance" but "DPDP Act for Indian
SaaS companies"). Publish 15–20 chapters. Instrument search impressions. You are
testing whether anyone is looking, not trying to rank yet.

**Days 31–90 — Depth over breadth.**
Take the one tutorial that shows traction to 40+ chapters with genuine internal
linking. Topical depth in one cluster outranks shallow coverage of ten. Ship the
first interactive tool. Start the email list.

**Days 91–180 — Monetise and widen.**
Add layers 2 and 3. Add the second tutorial in the *same* vertical — not a second
vertical. Recruit or contract a named subject-matter expert and put their byline on
every page.

**Month 7+ — Productise.**
Launch the paid layer the audience has been asking for. Only now add a second
vertical, and only because the first one is at a local ceiling.

**The sequencing error nearly everyone makes** is launching six subjects at twenty
pages each. Search engines reward demonstrated depth in one topic cluster. So do
readers. The engine in this repository makes breadth cheap, which makes the
discipline to stay narrow a conscious decision rather than a technical limit.

---

## 6. Risks to plan for explicitly

| Risk | Mitigation |
|---|---|
| Answer engines take the traffic | Tools and calculators; email list; depth in volatile, jurisdiction-specific content |
| A core-update traffic collapse | Never single-channel. Email, YouTube and community are the hedge |
| Scraped content | Expected. Tools, freshness and brand are what cannot be copied |
| Regulatory exposure (finance, health, legal) | Educational framing, explicit disclaimers, named experts, no individual advice, cited primary sources |
| Content decay | A review date on every page and a scheduled re-audit — this is the *product* in a volatile domain, not maintenance overhead |
| Founder bandwidth | A content system (this repo) so writing is the only variable cost |

---

## 7. Metrics worth tracking

- **Impressions before clicks.** In an AI-results world, impressions tell you about
  relevance earlier than clicks do.
- **Chapters-per-session.** The whole premise is sequential reading. If readers
  consume one chapter and leave, the tutorial structure is not working.
- **Quiz completion rate.** The most honest engagement signal on the site, and the
  one that predicts willingness to pay for an exam-prep product.
- **Email conversion per 1,000 readers.** Your only owned channel.
- **Revenue per 1,000 readers**, tracked per layer — this is what tells you which
  layer to invest in next.

---

## Summary

- The reading-tutorial format is sound; the *ad-funded programming-tutorial* version
  of it is being squeezed by answer engines.
- Pick a domain that is **volatile, jurisdiction-specific, credential-gated and
  liability-bearing**. Compliance and regulation score highest; medical coding and
  finance follow.
- Monetise above display advertising, and build the email list from day one.
- Go **deep in one cluster first**. The engine makes breadth cheap; resist it.
- This repository ships Technology and Finance so the domain-agnostic claim is
  demonstrated rather than asserted — a third vertical is a `site.config.js` entry
  and a `content/` folder.
