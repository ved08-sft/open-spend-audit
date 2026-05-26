# User Research & Interviews — SpendOptima

To build a tool that tech founders and finance managers will actually use, we conducted three 15-minute user interviews with prospective startup buyers. These conversations directly shaped our design decisions and mathematical modeling.

---

## Interview 1: A.K. — VP of Engineering
- **Role & Company Stage**: VP of Engineering at a Series A Developer-Tool Startup (32 engineers).
- **Direct Quotes**:
  - *"We had engineers using GitHub Copilot in VS Code, but then they switched to Cursor. Half of them forgot to cancel their Copilot subscription."*
  - *"I know we are overspending on API keys, but I don't have the time to audit our background parsing pipelines."*
  - *"If a tool tells me to cancel something, I want a bulletproof reason. Don't just say 'Cursor is better than Copilot.' Give me the exact context overlap."*
- **The Most Surprising Insight**: 
  A.K. admitted that although his team standardizes on Cursor, several senior developers insist on using Windsurf. He was willing to tolerate this duplicate IDE spend to keep developers happy, rather than forcing a rigid corporate standard.
- **Resulting Design Change**: 
  Instead of declaring Windsurf as "bad" or forcing an immediate cancelation, the audit engine introduces a **70% realism and friction coefficient**. It presents the duplication as a *consolidation opportunity* rather than an absolute rule, preserving 30% of the cost as a "migration friction buffer" to respect developer preference.

---

## Interview 2: M.R. — Fractional CFO & Finance Advisor
- **Role & Company Stage**: Fractional CFO supporting 8 early-stage startups (ranging from seed to Series A).
- **Direct Quotes**:
  - *"Startups are bleeding runway on 'ghost seats.' They buy a 5-seat Team plan for 2 active developers just because the vendor forces a minimum, or they leave dormant seats active long after an employee departs."*
  - *"Finance people don't know the difference between Claude Sonnet, Opus, or Gemini Flash. We just see credit card bills from Anthropic."*
  - *"Give me a shareable report link. I want to drop a single link into our Slack billing channel and tell the founder, 'Look, we are wasting $300/mo here.'"*
- **The Most Surprising Insight**: 
  M.R. explained that he frequently advises tiny startups to avoid team plans entirely. Startups often buy team tiers thinking they need collaboration tools, when separate individual Pro plans would save them hundreds of dollars per year.
- **Resulting Design Change**:
  Developed a highly custom **Phantom Seat Trap** rule in `src/utils/auditengine.ts`. If a team has <5 members on Claude Team or a single seat on ChatGPT/Cursor Team, the audit engine explicitly flags the minimum floor charge and details exactly how to downgrade to standalone retail Pro accounts. We also added a one-click copy button for the unique anonymized `report/[id]` public URL so CFOs can drop it directly into Slack.

---

## Interview 3: S.T. — Solo Founder & CEO
- **Role & Company Stage**: Solo Founder of an early-stage AI-integrated SaaS (bootstrapped, 2 virtual assistants).
- **Direct Quotes**:
  - *"Every dollar matters to us. I pay $200/mo for ChatGPT Pro Max and Claude because I use them for everything from customer support draft replies to code tweaks."*
  - *"I hate tools that make me log in with Google before showing me any value. Just let me paste my spend, show me the savings, and then I'll happily give you my email to download the PDF."*
  - *"I don't need generic savings advice. Tell me exactly what I can switch to without losing capabilities."*
- **The Most Surprising Insight**:
  S.T. was unaware that she could route her casual copywriting queries through a metered API client for a fraction of the cost, saving almost 75% of flat-rate fees.
- **Resulting Design Change**:
  We structured the funnel strictly to show value first: **no login is required** to input subscriptions and see instant calculations. The email gate is placed *after* the audit numbers are visible, using a highly compelling "CFO AI Critique" and dynamic social share URL as the carrot to capture the lead.
