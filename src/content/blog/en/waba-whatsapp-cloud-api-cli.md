---
title: 'waba: A WhatsApp Cloud API CLI That Never Retries a Send'
description: "A Go CLI for Meta's WhatsApp Cloud API: 102 of 105 documented operations, enforced by CI. It retries reads with jitter and never retries a message send."
pubDate: 2026-08-19
author: 'Juan Felipe Rivera González'
tags: ['whatsapp', 'cli', 'go', 'api', 'automation']
cover: '@assets/blog/covers/waba-cli-cover.jpg'
coverAlt: 'Two message paths on a dark terminal background: a green hexagonal chat bubble whose line runs unbroken to a target, and below it a grey ghost of the same bubble whose dashed line is crossed out and fades away before arriving'
lang: 'en'
translationKey: 'waba-whatsapp-cloud-api-cli'
draft: true
featured: false
---

Every WhatsApp Business integration starts the same way. You read Meta's docs, you copy a curl command, and it works. Then you need to send a template instead of a text. Then you need to upload media, and media needs its own upload session. Then you need to check why a message never arrived, and that lives behind a different endpoint with a different shape.

Six months later you have a folder of shell scripts with a token pasted in three of them.

I built `waba` to stop doing that. It's a Go CLI for Meta's WhatsApp Cloud API: messaging, media, templates, phone numbers, the business profile, QR codes, Flows, Calling, groups, analytics, and account management.

```console
$ waba send text --to 573001112233 "Your order shipped!"
MESSAGE_ID           WA_ID
wamid.HBgLNTcz...    573001112233
```

## The number is verifiable

Meta documents 105 operations. `waba` wraps 102 of them.

That claim would be worthless if I maintained it by hand, so I don't. The operations live in `api-manifest.json`, generated from the spec, and CI fails when coverage drops below the threshold. If Meta ships an endpoint and I don't wrap it, the build tells me before a user does.

The three that aren't wrapped are group join-request moderation. For those, and for anything Meta ships tomorrow, there's a raw path:

```console
$ waba api GET me -q fields=id,name
```

A CLI that forces you to wait for a release every time the upstream API grows is a CLI you'll abandon. The escape hatch means you never have to.

## Sends are never retried

This is the design decision I care most about.

Most HTTP clients retry on timeout. That's correct for a GET and dangerous for `POST /messages`. When the request times out, you don't know whether Meta processed it. Retrying can deliver the same message twice, and the person on the other end sees two identical messages from a business that looks broken.

So `waba` retries idempotent reads, with jitter and respecting `Retry-After`, and it never automatically retries a send. If a send times out, you get the error and you decide. It also reads `X-Business-Use-Case-Usage` to stay inside Meta's throttling rather than discovering the limit by hitting it.

The tradeoff is real: you'll occasionally handle an ambiguous timeout yourself. I'd rather do that than explain a double charge to someone's customers.

## Credentials stay out of the config

The token goes in your OS keyring: Keychain on macOS, Secret Service on Linux, Credential Manager on Windows. The config file holds the WABA id, the default phone number id, and the app id. Nothing secret.

Headless boxes don't have a keyring, so there's an encrypted-file fallback with AES-256-GCM and a PBKDF2 key at 600,000 iterations, written `0600` through an atomic rename. For CI, `WABA_ACCESS_TOKEN` overrides everything.

Two smaller rules that have saved me: `--dry-run` prints the exact curl equivalent with the token redacted, and plain HTTP is refused for any non-loopback host.

## Built to be handed to an agent

`waba mcp` turns the command tree into an MCP server, so an assistant can drive it without shelling out. `waba agent guard` generates host configuration that blocks irreversible operations and gates writes.

Here's what that looks like in practice. Template analytics have to be enabled once per account, and Meta documents that as irreversible through the API:

```console
$ waba account enable-insights
error: Enable template analytics? Meta documents this as irreversible via the API.
refused: not a terminal, pass --yes to confirm non-interactively
```

An agent running that command in a pipeline gets a refusal instead of a permanent change to someone's account. Classification matters more than tooling here: every operation is tagged read, write, or destructive, and the guard reads those tags.

## Install

```console
brew install jjuanrivvera/waba-cli/waba-cli
scoop install waba-cli
go install github.com/jjuanrivvera/waba-cli/cmd/waba@latest
```

Then `waba init` walks you through the token, verifies it, and picks a default phone number. `waba doctor` tells you what's broken when something is.

The source is at [github.com/jjuanrivvera/waba-cli](https://github.com/jjuanrivvera/waba-cli), MIT licensed. If you find an operation I got wrong, open an issue: the manifest makes it easy to prove.
