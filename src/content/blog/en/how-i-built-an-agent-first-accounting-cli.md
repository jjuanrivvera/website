---
title: 'How I built an agent-first CLI for an accounting system'
description: 'I built alegra-cli in a week with Claude Code. The speed came from high standards, enforcement in CI, and two workflows: /goal and /code-review.'
pubDate: 2026-06-21
author: 'Juan Felipe Rivera González'
tags: ['claude-code', 'go', 'ai-agents', 'cli', 'alegra']
cover: '@assets/blog/covers/agent-first-cli-cover.jpg'
coverAlt: 'A clean flat illustration on a cream background: a terminal window at the center, encircled by a clockwise loop of two teal arrows. A bullseye target icon and a magnifying glass over a checklist sit on the loop, with small invoice and coin glyphs nearby, sketching an automated build-and-review cycle.'
lang: 'en'
translationKey: 'alegra-cli-agent-first'
draft: true
featured: false
---

I built `alegra-cli` in a week with Claude Code. [Alegra](https://alegra.com) is a cloud accounting and invoicing platform used across Latin America; the CLI is a command-line client for its API. Most of it came together in a single night. The crucial step came right after: I validated it against Alegra's entire OpenAPI, then made conformance to that spec mandatory in CI, so the code can't drift from the documented API. The rest of the week went to tests, releases, docs, and hardening: 125 commits, 310 tests, and a CI suite enforcing all of it.

Most of it ran as an agentic loop. I used `/goal` to set a target the agent works toward on its own, and `/code-review` to find what it got wrong. Set a goal, review the result, fold the review into the next goal. Around that loop I kept the quality bar high and wired the standards into CI so they got checked on every commit.

I wrote before about [the enforcement layer](/blog/ship-fast-and-safe-with-ai-agents/), why hooks and commits matter when an agent does the typing. This post is the case study: the architecture, the standards, and that loop, across a whole project.

## The architecture that made speed cheap

`alegra-cli` wraps the Alegra API. The core is a generic typed client, `Resource[T]`. Each resource (a contact, an invoice, a product, a payment) is exactly three files: a data type, a command, and zero edits to shared code. The twenty-seventh resource is as cheap to add as the first.

That keeps the agent fast without breaking things. When pagination, auth, retries, and output formatting all live in one place, the agent can't introduce a wrong variant on resource number twenty-seven. The architecture absorbs the mistakes.

Alegra's API returns some values in more than one shape. Some IDs come as integers, others as strings; some fields are an `{id, name}` object, sometimes just a number. A few flexible Go types absorb those variations before they reach any business logic, so the agent never had to handle them case by case.

From day one the CLI is also an MCP server: `alegra mcp` exposes every command as an agent tool. That was the goal the whole time, something agents could drive directly. (I make the broader case for CLIs over MCPs in [a separate post](/blog/clis-over-mcps/).)

## Keeping the bar high

The rule I worked by was simple: never accept "it works."

Every time the agent finished something, I asked what was still wrong with it, had it fix that, and asked again. When a review came back strong, I read it as a list of gaps to close. So I closed them and ran the review again. The next score was higher, and I asked again.

It sounds like a personality thing. Really it's just a loop, and most of it runs on its own once you set it up. The next two sections are how.

## Enforcement the agent can't argue with

Standards only hold if a machine checks them, because an agent will tell you the tests pass whether or not they do.

So the standards became gates:

- **80% coverage gate** that fails CI if it drops. Coverage went from 39.8% to over 80% in the first week and stayed there.
- **golangci-lint** clean on every commit, enforced by a pre-commit hook.
- **Race detector** on Linux, macOS, and Windows.
- **Fuzz tests** on the value types. They found a `NaN`/`Inf` bug in minutes that an example-based test would have missed.
- **Contract tests** against Alegra's documented schemas, plus a spec-drift guardrail that runs without touching the network.
- Signed releases with an SBOM, and `govulncheck` in CI.

The agent can claim anything. The gate is what I actually trust, and it's what makes it safe to let the agent move fast.

## /goal: set a target, let it run

`/goal` sets a stop condition on the session. I give it a target I can verify (reach 80% coverage, finish issue #22, fix every finding from the last review) and the agent keeps working until the condition is true. Inside that goal it makes its own calls: which tests to write first, how to structure the edge cases, which files to touch.

This is what let me iterate without babysitting. My job became setting targets and checking results. The targets have to be ones a machine can confirm, which is why the gates above matter so much. CI can prove "80% coverage," so it works as a goal. "Make it better" gives the agent nothing to hit.

## /code-review: a review panel on demand

The other workhorse was the `/code-review:code-review` skill. It fans out several agents in parallel, each hunting a different class of problem (bugs, removed guards, cross-file breakage, language footguns), then has them adversarially verify every finding before it reports, so most of the noise gets filtered out before it reaches me.

I ran it on every meaningful PR. On the security release it earned its keep: it caught a guard hook that failed _open_, one that would have let a destructive command through on a specific input. That would have shipped. Each review then fed the next `/goal`: fix everything it found, don't stop until it's clean.

Those four pieces stack on each other. I define what good means, a machine checks it, the agent works toward it, and a separate pass verifies the result.

## Security from the start

The CLI keeps the API token in the OS keyring, never in a config file. `--dry-run` prints the exact curl before sending anything. Deletes ask for confirmation. Later I added `alegra agent guard`, which generates PreToolUse hooks that block irreversible operations at the agent host, before the command ever reaches the CLI. The MCP layer also marks write tools so hosts that understand them ask first.

## Why it was fast and still safe

Moving that fast sounds like skipping steps. I didn't. Every change went through a PR to `develop`, CI had to be green before merge, tags triggered the release, and `main` was promoted cleanly. One time the agent committed straight to `develop`. I reverted it and sent the work through a PR like everything else.

The speed came from three things stacked together: an architecture where extending is nearly free, enforcement that made it safe to move, and `/goal` plus `/code-review` for autonomy and verification. The system around the model is what produced the pace.

If you've built with an agent and got mediocre output, the model probably wasn't the problem. What matters is how well you direct it and how strong your guardrails are. That part is on you.

---

`alegra-cli` is MIT and lives at [github.com/jjuanrivvera/alegra-cli](https://github.com/jjuanrivvera/alegra-cli). Install it with Homebrew, Scoop, Docker, or `go install`. If you use Alegra and work with agents, it's a starting point.
