---
title: 'I turned my CLI playbook into a factory'
description: 'cliwright is a spec plus a machine-checkable gate. A stock /goal loop took the Telegram Bot API to a signed CLI release in two hours.'
pubDate: 2026-07-03
author: 'Juan Felipe Rivera González'
tags: ['ai-agents', 'cli', 'cliwright', 'golang']
cover: '@assets/blog/covers/cliwright-cli-factory-cover.jpg'
coverAlt: 'High-contrast isometric line-art of a small factory line on an off-white background: terminal windows ride a conveyor belt through a stamping press, with a single amber checkmark gate at the end of the line.'
lang: 'en'
translationKey: 'cliwright-cli-factory'
draft: false
featured: false
---

I keep building CLIs for the APIs I use every day. For a while my method was to ask the agent to build me another CLI like the last one it built, same architecture, same standards. That's how the family grew after [canvas-cli](https://github.com/jjuanrivvera/canvas-cli): [alegra-cli](/blog/how-i-built-an-agent-first-accounting-cli/), then [n8nctl](https://github.com/jjuanrivvera/n8n-cli).

Each one shipped, and each one cost me days after the build. APIs are not the same. Auth is different, pagination is different, the JSON has its own quirks, and the agent didn't know the new API's spec or how much of it the CLI covered. So I kept fixing things a "finished" build got wrong. And "done" was still whatever the agent asserted. I wrote in the alegra post that an agent will tell you the tests pass whether or not they do. Same for "the CLI is complete".

[cliwright](https://github.com/jjuanrivvera/cliwright) is what I built to stop doing that. I took the practices those CLIs already shared and wrote them down as one playbook that works for any REST API, with a definition of done a machine can measure. Instead of trusting what it remembers, it researches the specific API it's pointed at: the OpenAPI or Swagger spec when one exists, the docs when not. Five days after the first commit, a stock `/goal` loop took the Telegram Bot API from nothing to a signed v0.1.0 release in about two hours.

## Not a framework, not an agent loop

cliwright generates no code by itself and runs no loop of its own. Claude Code and Codex already ship `/goal`, and that loop is good. What a loop needs to finish honestly is two things it doesn't have: a complete spec of what to build, and a gate it can't talk its way past.

That's the whole tool. A 900-line `GOAL.md` (the spec) plus a `Makefile` contract (the gate), shipped as a Claude Code plugin and a cross-tool skill. You fill in one block: API name, docs URL, module path. Everything else is fixed.

Every lesson in the spec came from one of those hand-built CLIs. Canvas forced multi-auth: a pasted personal token or OAuth2, behind one interface. Alegra forced flexible JSON types for IDs that arrive as string and number. From n8nctl came multi-instance profiles. cliwright is that experience made explicit.

## What the spec decides

Most of `GOAL.md` exists to remove decisions from the loop.

Research comes first, and it's aimed at the API's own material, not at me. Auth model, base URL, pagination style, rate-limit headers, JSON quirks: these are facts about the API, so the spec tells the agent to fetch whatever the API publishes (an OpenAPI or Swagger spec, an llms.txt, a Postman collection, the docs site) and determine them itself. When the docs are ambiguous it states its assumption and keeps going. The questions that reach me are the ones a web search can't answer.

Then the standard is fixed. Generic typed core, thin per-resource files, tokens in the OS keyring, named profiles, `--dry-run` that prints the redacted curl, table/json/yaml/csv output, an MCP server derived from the command tree, an `agent guard` that generates host-side hooks for destructive commands. None of that is re-litigated per project. The spec even includes determinism rules: same API in, same CLI out.

Same bet as alegra-cli's generic core, one level up: the playbook absorbs the differences between APIs.

## The gate is the definition of done

The part I care most about is the exit condition. The Definition of Done is a checklist, and every atomic item on it is wired into a script:

```make
verify: check spec-check spec-completeness cover-check   # deterministic; CI runs this
accept: verify judge                                     # the /goal loop binds to THIS
```

`spec-check` proves every shipped command maps to a declared resource and verb. `spec-completeness` is the one that catches the memory problem: the API surface gets enumerated from the docs into a manifest with the method count recorded, and the gate fails if the manifest wraps less than roughly 90% of it. A CLI that covers a tenth of the API while looking perfectly consistent no longer passes.

A few criteria can't be proven by a grep: error messages carry hints a human can act on, help text has examples, comments explain why. Those go to an LLM judge with a rubric. The judge costs tokens, so it lives in `make accept`, not in the `make verify` that CI and every dev run hit. I split them in v0.3.0 after paying for judge runs that a formatting commit didn't need.

The last piece is the anti-cheat: the loop's completion promise may fire only after `make accept` exits 0. The agent doesn't get to decide it's finished; the promise is bound to the gate's exit code.

## What came out of the factory

I dogfooded the first version on a throwaway CLI for TheCatAPI, fixed what the run exposed, and released v0.2.0 the same day.

Then the real runs. [tgctl](https://github.com/jjuanrivvera/tgctl), a `gh`-style CLI for the Telegram Bot API: first commit at 1:48 pm, signed v0.1.0 tag at 3:35 pm the same afternoon. [lsqueezy](https://github.com/jjuanrivvera/lemon-squeezy-cli), for the Lemon Squeezy e-commerce API: first commit at 6:34 pm that evening, v0.1.0 an hour later. Both passed the same gate alegra-cli holds itself to: 80% coverage enforced in CI, lint and vulnerability checks clean, MCP server, agent guard, keyring auth, cosign-signed releases with Homebrew and Scoop packaging.

alegra-cli took a week, most of it one long night. tgctl took an afternoon, and I spent it reviewing, not typing.

Two caveats. The adversarial review step still produces findings where about half are false positives, so the human pass survives: verify each finding against the code before acting on it, and refuting one with cited rationale is a valid outcome. And live-testing against a real instance stays behind an explicit opt-in, because mocks miss real-API behavior but live writes are irreversible.

## Where the effort goes now

If you build with agents, the work that compounds is writing down your standard as a spec and turning your definition of done into a gate a machine can check. I did it once, and now every CLI starts from that standard instead of from my memory of the last one.

cliwright is MIT and lives at [github.com/jjuanrivvera/cliwright](https://github.com/jjuanrivvera/cliwright). Install it as a Claude Code plugin (`/plugin marketplace add jjuanrivvera/cliwright`) or as a cross-tool skill (`npx skills add jjuanrivvera/cliwright`) and point it at an API you use.
