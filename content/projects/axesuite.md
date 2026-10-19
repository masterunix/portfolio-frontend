---
title: AxeSuite
tech: Next.js, TypeScript, Postgres, LangGraph, MCP, Electron
summary: "A productivity suite for CS students and engineers: seven web apps and a desktop app, with one login and one AI assistant."
visit: https://home.axesuite.tech
color: "#1b1b24"
icon: AS
logo: /media/logos/axesuite.png
logoFill: true
order: 10
---

A productivity suite for CS students and engineers, and the project I spend most of my time on. It's seven web apps and a desktop app that share one login, one Postgres database and one AI assistant. I build and run all of it myself.

- [AxeTasker](https://tasker.axesuite.tech): a week-by-week planner with task cards, timers, streaks and notes
- [AxeDSA](https://dsa.axesuite.tech): tracks your LeetCode, Codeforces and HackerRank practice, with ready-made problem packs
- [Axe Design](https://design.axesuite.tech): system design practice; you draw an architecture and a simulator load-tests it
- [AxeFeed](https://feed.axesuite.tech): a calm daily feed of blogs, newsletters and papers; paste any link and it finds the feed
- [AxeAI](https://ai.axesuite.tech): AxeBot, the assistant inside the apps, plus an MCP server so Claude, ChatGPT or Cursor can use your data
- [Axe Home](https://home.axesuite.tech) and [AxeTips](https://tips.axesuite.tech): sign-in, dashboard, blog and payments, and the user guides
- **AxeSuite Desktop**: an Electron app for macOS, Windows and Linux that works offline

**How it's built**

- **One login for everything.** Sign in once with Google and every app on axesuite.tech knows it's you; the desktop app signs in through your browser (RFC 8252 with PKCE).
- **The AI follows the apps' rules.** The apps publish typed actions; their pages and AxeAI call the same ones, with short-lived signed tokens.
- **Bring your own AI.** The MCP server (OAuth 2.1, 40 tools) works with Claude, ChatGPT or Cursor. AxeBot runs on LangGraph with any model you pick.
- **Works offline.** Tasker, DSA and AxeAI keep your changes on the device and sync them when you're back.

Next.js, React, TypeScript, Tailwind, Postgres (Neon), LangChain, LangGraph, MCP, Electron, Vitest, Playwright, Vercel. The code is private (500+ commits so far), but every app is live.
