---
title: PocketLM
tech: PyTorch, MLX, LoRA, FAISS, TypeScript
summary: How much of a model's worldview comes from its data? Eight small models, trained on a MacBook.
period: "Sep – Dec 2025"
color: "#85db7d"
icon: PLM
github: https://github.com/masterunix/PocketLM
order: 30
---

How much of a model's worldview comes from its data? I trained eight small models on my MacBook, on posts from politically opposite Reddit communities, and compared what they said.

- Six are LiquidAI's LFM2-1.2B, fine-tuned with LoRA (on MLX and PEFT).
- Two are 124M GPT-2s trained from scratch with nanoGPT. For those two, a FAISS deduplication pass kept both datasets clean and the same size.
- A small React and Node app runs the models side by side.

The [code](https://github.com/masterunix/PocketLM) and [weights](https://huggingface.co/axe-net/PocketLM) are open.
