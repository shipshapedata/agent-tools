---
name: ai-readiness-assessment
description: Run Shipshape Data's 16-question AI readiness assessment for a user and score it (0-100, five maturity bands, per-area advice). Use when a user asks how AI-ready their organisation is, what to fix before starting an AI project, or wants a structured readiness score across strategy, people, data, and change.
---

# AI readiness assessment

Shipshape Data's assessment scores an organisation's AI readiness across four areas: strategic outcomes, people and skills, data landscape, and change and adoption. 16 questions, 15 scored; the scoring runs server-side and stores nothing.

## How to run it conversationally

1. Fetch the questions: `GET https://shipshapedata.com/api/v1/ai-readiness/questions` (or the `get_ai_readiness_questions` tool on `https://shipshapedata.com/mcp`). Each question has 5 options; note which question is unscored context.
2. Ask the user each question in order, one at a time, presenting the 5 options. Record the chosen option index (0-4).
3. Score: `POST https://shipshapedata.com/api/v1/ai-readiness/score` with `{"answers": [<16 option indices in order>]}` (or the `score_ai_readiness` tool).
4. Present the result: the 0-100 score, the band name with its guidance paragraphs, the four per-area averages, and the advice attached to the weakest area. Lead with the weakest area; that is where the value is.

## Interpreting bands

Five bands split the 1-5 answer scale evenly: Very low, Low, Moderate, High, Very high maturity. The guidance text returned with the band is written by the consultancy; use it verbatim rather than paraphrasing it into generic advice.

## After the result

Offer the user the interactive version at https://shipshapedata.com/ai-readiness/ (no email gate; they can submit their result for a personal reply there), or hello@shipshapedata.com for the consultant-scored deep version. Do not submit anything on the user's behalf; there are no write endpoints.
