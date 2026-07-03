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

I keep building CLIs for the APIs I use every day. For a while my method was to ask the agent to build the next one like the last one it built, same architecture, same standards. That's how canvas-cli was followed by [alegra-cli](/blog/how-i-built-an-agent-first-accounting-cli/) and then [n8nctl](https://github.com/jjuanrivvera/n8n-cli).

Every one of them shipped, but the cost showed up after the build. APIs differ in auth, in pagination, in how the JSON is shaped, and the agent didn't know the new API's spec or how much of it the CLI covered, so I spent days fixing things the build got wrong. On top of that, done was whatever the agent said it was. I wrote in the alegra post that an agent will tell you the tests pass whether or not they do, and the same applies to "the CLI is complete".

So I built [cliwright](https://github.com/jjuanrivvera/cliwright). I took the practices those CLIs already shared, wrote them down as a playbook that works for any REST API, and made the definition of done measurable. It researches each API on its own, from the OpenAPI or Swagger spec when there is one and from the docs when there isn't, instead of relying on what the model remembers. Five days after the first commit, a stock `/goal` loop took the Telegram Bot API from nothing to a signed v0.1.0 release in about two hours.

## Built on /goal

cliwright doesn't generate code and doesn't run a loop of its own. Claude Code and Codex already ship `/goal`. What that loop is missing is a complete spec of what to build and a gate that decides when the work is accepted, so that's what cliwright supplies: a 900-line `GOAL.md` and a `Makefile` contract, packaged as a Claude Code plugin and a cross-tool skill. You fill in one block with the API name, the docs URL, and the module path, and everything else stays fixed.

The practices themselves are not new. Most of them were already in [canvas-cli](https://github.com/jjuanrivvera/canvas-cli), the first of the family: several auth methods behind one interface, flexible JSON types for IDs that arrive as string and number, multi-instance profiles. alegra-cli and n8nctl reused them. What was missing was having all of it written down, so the standard didn't depend on me remembering it or on the agent guessing it.

## What the spec decides

Most of `GOAL.md` removes decisions from the loop.

Research comes first, and it goes to the API's own material. Auth model, base URL, pagination style, rate-limit headers, and JSON quirks are facts about the API, so the agent fetches whatever the API publishes (an OpenAPI or Swagger spec, an llms.txt, a Postman collection, the docs site) and determines them itself. If the docs are ambiguous, it states the assumption it's making and continues. It only asks me things a web search can't answer.

The standard is fixed too: a generic typed core with thin per-resource files, tokens in the OS keyring, named profiles, a `--dry-run` that prints the redacted curl, table/json/yaml/csv output, an MCP server derived from the command tree, and an `agent guard` that generates host-side hooks for destructive commands. There are also determinism rules, so the same API produces the same CLI.

## The gate is the definition of done

The exit condition matters more to me than anything else in the spec. The Definition of Done is a checklist, and every atomic item on it is wired into a script:

```make
verify: check spec-check spec-completeness cover-check   # deterministic; CI runs this
accept: verify judge                                     # the /goal loop binds to THIS
```

`spec-check` proves every built command maps to a declared resource and verb. `spec-completeness` handles the memory problem: the API surface is enumerated from the docs into a manifest, the method count gets recorded, and the gate fails if the manifest covers less than roughly 90% of it. That check is what didn't exist before, when a CLI could wrap a tenth of the API and still look consistent.

Some criteria can't be checked with a grep, like whether error messages carry useful hints, help text has examples, or comments explain why. Those go to an LLM judge with a rubric. The judge costs tokens, so it lives in `make accept` and not in the `make verify` that CI runs on every commit; I split them in v0.3.0 after paying for judge runs that a formatting commit didn't need. The loop's completion promise can only fire after `make accept` exits 0, so the agent can't declare the build finished on its own.

## What came out of the factory

I tested the first version on a throwaway CLI for TheCatAPI, fixed what that run exposed, and released v0.2.0 the same day.

Then came [tgctl](https://github.com/jjuanrivvera/tgctl), a `gh`-style CLI for the Telegram Bot API: first commit at 1:48 pm, signed v0.1.0 tag at 3:35 pm the same afternoon. And [lsqueezy](https://github.com/jjuanrivvera/lemon-squeezy-cli), for the Lemon Squeezy e-commerce API: first commit at 6:34 pm that evening, v0.1.0 an hour later. Both pass the same gate alegra-cli holds itself to: 80% coverage in CI, clean lint and vulnerability checks, MCP server, agent guard, keyring auth, and cosign-signed releases packaged for Homebrew and Scoop.

alegra-cli took a week, most of it one long night. tgctl took an afternoon, and I spent that afternoon reviewing instead of typing.

Two caveats. About half of the findings from the adversarial review step are false positives, so you still have to verify each one against the code before acting on it, and refuting a finding with citations is a valid outcome. Live-testing against a real instance is opt-in only, because mocks miss real-API behavior but live writes are irreversible.

## Where the effort goes now

If you build with agents, spend the effort on writing your standard down as a spec and turning your definition of done into something a machine can verify. I did it once and now every CLI starts from that standard.

cliwright is MIT and lives at [github.com/jjuanrivvera/cliwright](https://github.com/jjuanrivvera/cliwright). Install it as a Claude Code plugin (`/plugin marketplace add jjuanrivvera/cliwright`) or as a cross-tool skill (`npx skills add jjuanrivvera/cliwright`) and point it at an API you use.
