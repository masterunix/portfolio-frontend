---
title: FT7 ⭐
tech: Python, Electron, WebSockets, pandas, AWS, Tailscale
summary: An AI-enabled trading system on Flattrade's API, inside hard limits on risk.
color: "#0f766e"
icon: FT7
order: 40
---

An AI-enabled trading system on [Flattrade](https://flattrade.in)'s API. It uses AI to trade, inside hard limits on position size, trades per day and losses, and a single kill-switch file blocks every script that can place an order. Around it:

- a live market viewer, packaged as a Mac app with Electron, showing every raw API reply next to the charts built from it
- a Python client, with a fix for a login bug in the NorenRestApi library
- an API recorder that called every endpoint and turned the replies into a PDF report, which is how I found the limit of 10 orders a second

Orders go out through a Tailscale exit node on AWS, so they always come from the IP the broker whitelisted. Not public.
