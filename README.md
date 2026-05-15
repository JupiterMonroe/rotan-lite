# ROTAN Lite
> Runtime Verification for AI Coding Assistants

In Malaysia, "kena rotan" means you got disciplined for misbehaving.
ROTAN disciplines AI when it tries to make stuff up.

## What is ROTAN?
A runtime verification layer that intercepts AI coding assistant responses, validates claims against live ecosystem data, and flags stale knowledge or hallucinated APIs before developers accept them.

## How It Works
1. Developer asks AI assistant a question
2. AI responds (potentially with stale or hallucinated information)
3. ROTAN intercepts and verifies claims against live sources (npm, GitHub)
4. ROTAN scores confidence vs evidence alignment
5. ROTAN gates output: PASS / HEDGE / CLARIFY / BLOCK

## Key Finding
AI coding assistants don't just hallucinate — they confidently deny real technologies based on stale training data. We tested IBM Bob and found it repeatedly claimed Next.js 16 does not exist, when it is publicly released on npm.

## Tech Stack
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Zustand (state management)
- Framer Motion (animations)

## Run Locally
```bash
npm install
npm run dev
```

## Built With IBM Bob
This entire codebase was written using IBM Bob. Bob was also the AI assistant being verified in the demo.

## IBM Bob Report
See /bob-report/ for exported session reports.

## Author
IBM Hackathon 2026