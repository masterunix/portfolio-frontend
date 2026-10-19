---
# The /summary page. Only `title` is required; leave out anything you don't want.
#
# title:     the big heading
# tagline:   one line under it
# photo:     an image in public/, e.g. /media/me.jpg (shown round)
# location:  e.g. Bengaluru, India
# jobTitle:  what you do, and school: where you studied (not shown; they tell search
#            engines who you are)
# updated:   a date like 2026-10-18, shown as "Updated Oct 18, 2026"
# facts:     short highlights shown as chips: - { value: 5+ yrs, label: experience }
# links:     buttons under the header: - { label: GitHub, href: https://… }
#
# Below the second --- line is Markdown. On top of normal Markdown (and HTML), you can
# use these blocks; each ends with a line containing just ::: and they don't nest.
#
#   :::callout Optional title    a highlighted box
#   :::cards                     a grid of cards; each starts with ### Card title
#   :::timeline                  a timeline; ### 2021 – 2023 | Role at Company
#   :::columns                   side by side; put a +++ line between columns
title: Vatsal Goyal
tagline: "Full-stack and AI developer, building AxeSuite and RCIS. Open to full-stack and AI engineering roles."
location: Jaipur, India
jobTitle: Full-stack and AI Developer
school: JECRC University
updated: 2026-10-19
facts:
  - { value: Full stack + AI, label: "agents, tool calling, MCP" }
  - { value: 7 apps, label: and a desktop app in AxeSuite }
  - { value: "5", label: Oracle Cloud certifications }
  - { value: 7th, label: Smart India Hackathon }
links:
  - { label: Resume (PDF), href: "/media/resumes/vatsal-resume.pdf" }
  - { label: Email, href: "mailto:vatsalgoyal9999@gmail.com" }
  - { label: LinkedIn, href: "https://www.linkedin.com/in/vatsalgoyal93" }
  - { label: GitHub, href: "https://github.com/masterunix" }
  - { label: Hugging Face, href: "https://huggingface.co/axe-net" }
---

I build full-stack apps, and lately the AI side of them too: agents, tool calling and MCP
servers. Most of my time goes into AxeSuite and my studio, RCIS. Everything about me is on this
page; the rest of the site shows the same things in more detail.

:::callout Open to work
I'm open to **full-stack and AI engineering roles**. Email is the quickest way to reach me:
[vatsalgoyal9999@gmail.com](mailto:vatsalgoyal9999@gmail.com).
:::

## What I'm working on

### [AxeSuite](https://home.axesuite.tech) ⭐

A productivity suite for CS students and engineers, and the project I spend most of my time on:
seven web apps and a desktop app that share one login, one Postgres database and one AI
assistant. I build and run all of it myself.

- [AxeTasker](https://tasker.axesuite.tech): a week-by-week planner with task cards, timers, streaks and notes
- [AxeDSA](https://dsa.axesuite.tech): tracks LeetCode, Codeforces and HackerRank practice, with problem packs
- [Axe Design](https://design.axesuite.tech): system design practice, with a simulator that load-tests your architecture
- [AxeFeed](https://feed.axesuite.tech): a calm daily feed of blogs, newsletters and papers
- [AxeAI](https://ai.axesuite.tech): AxeBot, the assistant inside the apps, plus an MCP server (OAuth 2.1, 40 tools) for Claude, ChatGPT or Cursor
- [Axe Home](https://home.axesuite.tech) and [AxeTips](https://tips.axesuite.tech): sign-in, dashboard, blog, payments and guides
- **AxeSuite Desktop**: an Electron app for macOS, Windows and Linux that works offline

One Google sign-in for every app, AI that calls the same typed actions as the apps' own pages,
and offline sync. Next.js, React, TypeScript, Tailwind, Postgres (Neon), LangChain, LangGraph,
MCP, Electron, Vitest, Playwright. The code is private (500+ commits), but every app is live.

### [RCIS](https://rcis-systems.vercel.app) ⭐

My web development studio: a website delivered in 10 minutes, with no lock-in, and a real
developer who can step in whenever it's needed. We also build the systems behind websites, like
order management, dashboards and internal tools. The studio site's night sky is a shader I wrote
in raw GLSL, and clients and partners get their own portals. Next.js, TypeScript, WordPress,
Elementor, GLSL, Supabase, Python.

### [PocketLM](https://github.com/masterunix/PocketLM)

How much of a model's worldview comes from its data? I trained eight small models on my MacBook,
on posts from politically opposite Reddit communities, and compared what they said: six LiquidAI
LFM2-1.2B models fine-tuned with LoRA (MLX and PEFT), and two 124M GPT-2s trained from scratch
with nanoGPT, on FAISS-deduplicated data. [Code](https://github.com/masterunix/PocketLM) and
[weights](https://huggingface.co/axe-net/PocketLM) are open. PyTorch, MLX, LoRA, FAISS, TypeScript.

### FT7 ⭐

An AI-enabled trading system on Flattrade's API, inside hard limits on position size, trades per
day and losses, with a kill switch that blocks every script able to place an order. Includes a
live market viewer (Electron), a Python client with a fix for a NorenRestApi login bug, and an
API recorder. Orders go out through a Tailscale exit node on AWS. Not public. Python, Electron,
WebSockets, pandas, AWS, Tailscale.

### [Gleck](https://github.com/masterunix/gleck) (in development)

My personal AI agent. It's meant to keep my resumes and portfolio up to date, hunt for jobs,
send mail and help with research, all running locally. LangGraph, LangChain, MCP.

## Other things I've built

:::cards
### [GlobalFreight AI](https://github.com/masterunix/FOURTH-AGENT)
Built solo for Pratham Software's company-wide AI hackathon, where it cleared all four rounds. A RAG policy assistant up to Planner, Executor and Auditor agents over MCP. Flask, LangGraph, ChromaDB, Next.js 16.

### [vatsalgoyal.com](https://github.com/masterunix/portfolio-v2)
This portfolio: glass hexagons over a single WebGL shader, no animation libraries, written in Markdown.

### [JobNest](https://github.com/masterunix/JobNest-v1)
A job portal built during my internship at Xebia. MERN, JWT auth, Stripe and Razorpay, Socket.io.

### [450 House of Sourdough](https://450-hos-static.vercel.app)
Client work for a bakery: the storefront, plus a Flask and SQLite system for orders, subscriptions and B2B accounts.

### AxeServer
An old PC turned into a 24/7 Ubuntu server on Tailscale, where I test agents like Gleck.

### [AshaKiran](https://www.ashakiransanstha.org)
A website for an NGO, built with React, Node and Postgres.
:::

Smaller things: [movie.fy](https://github.com/masterunix/Fluttter-Movie-App) (Flutter),
[Flapper](https://github.com/masterunix/flapper) (a Flappy Bird-style game for iOS, with
Capacitor) and a [VS Code setup](https://github.com/masterunix/VS-Code-DSA-Setup) that runs DSA
code in seven languages with one shortcut. [See every project →](/projects)

## Experience

:::timeline
### Jan – Aug 2026 | Full-stack Development Intern, Pratham Software (PSI)
Worked on an internal application using the PERN stack (PostgreSQL, Express, React and Node).

### Jun – Nov 2025 | IT Consultant, 450 House of Sourdough
Built and deployed the bakery's web platform: online orders, payments and inventory.

### Jun – Jul 2025 | Full-stack Intern, Xebia
Built [JobNest](https://github.com/masterunix/JobNest-v1), a full-stack job portal.

### Jul 2023 – Jul 2024 | Part-time Web Developer, Digispheres
Built and deployed websites for clients.

### 2022 – 2023 | Core Team Member, JECRC Incubation Centre
Represented the Centre's NEC-winning team at IIT Bombay E-Summit 2023, and helped run SISFS
startup evaluations.
:::

## Education

**B.Tech in Computer Science and Engineering**, specialising in full-stack development.
JECRC University, Jaipur, 2022 – 2026.

## Achievements and certifications

- **Oracle Cloud certifications (2025):** Generative AI Professional, AI Vector Search, AI
  Foundations, Data Platform Foundations and OCI Foundations.
- **Smart India Hackathon:** 7th place in the inter-college competition.
- **College coding contests:** 1st place in Code-O-Mania and Algo vs Logic.

## Tools I use

:::columns
- **Languages:** TypeScript, JavaScript, Python, C++, Swift
- **Web:** React, Next.js, Tailwind, Node.js, Express, Flask, Vite
- **Data:** PostgreSQL, Supabase, MongoDB, SQLite

+++

- **AI:** PyTorch, LangChain, LangGraph, MCP, RAG, MLX, LoRA, FAISS, ChromaDB
- **Apps and infrastructure:** Electron, Flutter, AWS, Vercel, Docker, GitHub Actions, Linux, Tailscale
- **Also:** WebGL and GLSL, Vitest, Playwright, Git, Bash, LaTeX
:::

## Coding profiles

[LeetCode](https://leetcode.com/u/vatsalgoyal05/) ·
[Codeforces](https://codeforces.com/profile/vatsalgoyal05) ·
[HackerRank](https://www.hackerrank.com/profile/vatsalgoyal05) ·
[AtCoder](https://atcoder.jp/users/vatsalgoyal05)

## Contact

If you're hiring, or want to build something together:
[vatsalgoyal9999@gmail.com](mailto:vatsalgoyal9999@gmail.com) ·
[LinkedIn](https://www.linkedin.com/in/vatsalgoyal93) ·
[GitHub](https://github.com/masterunix) ·
[Hugging Face](https://huggingface.co/axe-net) ·
[Resume (PDF)](/media/resumes/vatsal-resume.pdf)
