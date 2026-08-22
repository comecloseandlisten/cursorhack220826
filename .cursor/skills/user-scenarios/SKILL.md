---
name: user-scenarios
description: >-
  Canonical user scenarios and message contract: send in web UI, tag bot in
  chat for digest, DM the bot, comment, react, filter by date/text/image
  object; message fields (text style, revealAnimation, media, canvasId,
  dateTimeReveal, senderId, parentMessageId threads, canvasPosition, tag).
  Use when implementing or changing product, UI, bot, ingest, digest, canvas,
  search, API, schema, tests, or demo.
---

# Product sources of truth

Before writing product, UI, bot, API, schema, or test code:

1. Read [`docs/user-scenarios.md`](../../../docs/user-scenarios.md) — six flows only.
2. Read [`docs/message-contract.md`](../../../docs/message-contract.md) — message shape. Do not add fields.

Comment (US-4) is a `Message` with `parentMessageId` set. Parent is chosen like Obsidian: explicit selection / reply, never inferred. Same `canvasId`, no cycles.

If a request conflicts with these docs, follow the docs and say so.
