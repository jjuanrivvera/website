---
title: 'CLIs Over MCPs for AI Tool Integration'
description: 'MCP servers put credentials in JSON configs. CLIs keep them in a keyring. After six months using both, I replaced most MCPs with Go CLIs. Here is why.'
pubDate: 2026-05-04
author: 'Juan Felipe Rivera González'
tags: ['claude-code', 'mcp', 'cli', 'go', 'security']
cover: '@assets/blog/covers/clis-over-mcps-cover.jpg'
coverAlt: 'A split-frame editorial illustration titled MCP vs CLI on a cream background. The left side shows a JSON config snippet with an exposed PASSWORD field highlighted in red, and a cluster of service tiles (database, browser, ticket, cloud, chat) each tagged with a red API_KEY warning, all tangled into a central MCP SERVER box. The right side shows a clean terminal with commands cf zones list, gh pr view, bw get password, a keyring icon with a green check, and the same services arranged in an orderly row connected cleanly to a single CLI BINARY box.'
lang: 'en'
translationKey: 'clis-over-mcps'
draft: false
featured: false
---

Model Context Protocol (MCP) is the standard way to give AI coding assistants access to external services. A MySQL MCP exposes database queries. A Playwright MCP exposes browser automation. A Jira MCP exposes ticket operations. The agent discovers tools, calls them, and works.

The pattern is useful. It also ships with problems that compound at scale: credentials in config files, no rate limiting, no caching, raw error messages, and auth that becomes the integration's problem rather than the service's.

After six months running both in production, I replaced most of my MCP servers with custom Go CLIs. Cloudflare's `cf` CLI, launched April 2026 with 3,000+ operations across 100+ products, validates the same direction: AI agents do well with consistent CLIs, and CLIs scale better than hand-rolled MCP servers when the surface is large.

This post covers what goes wrong with MCPs at scale, what a CLI fixes, the single case where I kept an MCP, and a Go library that lets one binary be both.

## What Breaks First: Credentials

A typical MySQL MCP configuration:

```json
{
  "mcpServers": {
    "MYSQL_BETA": {
      "command": "npx",
      "args": ["@benborla29/mcp-server-mysql"],
      "env": {
        "MYSQL_HOST": "127.0.0.1",
        "MYSQL_PORT": "3306",
        "MYSQL_USER": "beta-user",
        "MYSQL_PASS": "actual-password-here",
        "MYSQL_DB": "my_database"
      }
    }
  }
}
```

The database password lives in a JSON file. If the file sits in the project root, one misconfigured `.gitignore` away from being committed. Even if the `.gitignore` is correct, the credential exists as plaintext on disk, readable by any process under the user. The MCP architecture requires it to be there because the server starts by reading environment variables.

I had five MySQL MCPs across two projects. Each one carried plaintext credentials. The Playwright MCP and the Canvas LMS evaluation had the same pattern: credentials in config, because that is how the protocol works.

## What Else Breaks: Operational Behavior

Credentials are the headline problem. Operationally, MCPs expose raw API calls, which means the AI has to handle concerns that should live closer to the service:

- **No rate limiting.** A thousand `mysql_query` calls in one session hit the database a thousand times. There is no throttle.
- **No caching.** Data that does not change mid-session is fetched repeatedly.
- **Raw pagination.** The agent has to remember `?page=2&per_page=100` or stop reading at the first page.
- **Raw errors.** The response is whatever the API returned, including HTTP status codes the agent then has to interpret.

Each one is a small inefficiency. Across hundreds of calls a day, they add up.

## What a CLI Fixes

A CLI sits between the agent and the service. Auth, rate limiting, caching, pagination, and error translation all live in the CLI. The agent runs commands and reads structured output.

- **Auth stays out of context.** Tokens live in the system keyring. The agent runs `canvas courses list` and never sees an OAuth token. Token refresh, 401 retries, device flows all happen inside the CLI.
- **Rate limiting is built in.** Adaptive throttling based on the API's quota headers.
- **Caching is automatic.** Data that does not change within a session (course metadata, user profiles) comes from a local cache after the first fetch.
- **Pagination disappears.** `canvas assignments list --course 12345` returns all assignments. The agent does not know `per_page` exists.
- **Errors are useful.** "Course 12345 not found" or "Authentication expired, run `canvas auth login`" instead of a 404 JSON blob.

The agent works against a clean surface. The CLI carries the mess.

## canvas-cli as the Open Source Example

[canvas-cli](https://github.com/jjuanrivvera/canvas-cli) is a Go CLI I maintain for Canvas LMS. It started as a personal tool and now exposes 280+ commands covering courses, assignments, modules, enrollments, submissions, and more.

Auth uses OAuth 2.0 with PKCE and stores tokens in the system keyring. Multi-instance support lets me switch environments: `canvas --instance production courses list` versus `canvas --instance sandbox courses list`. Output formats include JSON, table, and CSV. The agent typically uses `--output json` because it is easier to parse.

No protocol-specific configuration, no special runtime. A single statically linked binary on the PATH. If I switched AI tooling tomorrow, the CLI would work unchanged.

## Internal CLIs With Safety Rails

For my day job I also maintain a Go CLI that handles deployments, database queries, health checks, and service management. It is not open source because it is specific to my work environment, but the safety patterns generalize:

- **`--dry-run`** shows what a command would do without doing it. The agent runs it first on any destructive operation.
- **`--explain`** describes the operation in plain language: which services are affected, what order things happen in, what depends on what.
- **Read-only by default.** Database queries get read-only connections unless the command is explicitly a write. Write operations require an explicit `--write` flag.
- **Query timeouts and result size limits.** An unqualified `SELECT *` on a large table fails early instead of returning a gigabyte to the agent's context.

The agent cannot accidentally run a destructive operation because the CLI rejects it unless the flags say otherwise. Same idea as the permission allowlist from the previous post, at a different layer.

## When the MCP Wins

I did not replace everything. Jira stayed as an MCP.

The reason is functional coverage. My Jira workflow uses worklogs, ADF-formatted comments (bold, multi-paragraph), user account lookups, issue type metadata for programmatic ticket creation, and Rovo AI search. I evaluated both the official Atlassian CLI (ACLI) and the strong open source option (ankitpokhrel/jira-cli, ~5K stars). Neither covers all of those. jira-cli has no worklog support. ACLI has not confirmed it either. Both only support plain text comments, no ADF. Neither exposes issue type field metadata.

The Atlassian MCP via OAuth covers all of it. One browser auth flow, and the agent gets typed tools across the full API surface.

The rule I use: if a well-maintained CLI covers 100% of what the agent needs, use the CLI. If the MCP covers operations the CLI cannot, keep the MCP. The layer closest to the service should own the service's concerns.

## Security: Capability Without Credentials

An MCP server exposes raw access. If the agent can call `mysql_query`, it can run any SQL the database user is authorized for. If the MCP config carries a production password, the agent effectively has production access.

A CLI encapsulates that boundary. The agent gets capability without credentials: it can read courses without touching the OAuth configuration, read rows without running DDL, deploy a service without modifying the pipeline. The boundary between what the agent can do and what still requires a human lives in the command structure itself.

Paired with a permission allowlist (`Bash(canvas courses get:*)` allowed, `Bash(canvas admin:*)` not allowed), that boundary becomes two layers. The allowlist controls which commands are reachable. The CLI controls what those commands can actually do.

## Writing a CLI With Agents in Mind

A few patterns that make a CLI good for AI consumption:

- **Structured output by default, or one flag away.** `--output json` beats parsing table layouts.
- **One operation per command.** `canvas courses list` beats `canvas manage --resource courses --action list`.
- **Flat command space.** Two or three levels of nesting at most. Agents discover commands through `--help`, so deep hierarchies waste tokens.
- **Stable error messages.** Phrases like "Course not found" and "Authentication expired" are more useful than HTTP status codes.
- **Exit codes that mean something.** Success is 0. Argument errors are one class, auth failures another, upstream API errors another.

Go is a good fit for this kind of CLI: single statically linked binary, cross-compilation, fast startup, no runtime dependencies. The CLIs I maintain compile for macOS (ARM and Intel) and Linux (AMD64) from one codebase and deploy by copying the binary.

## One Binary, Two Interfaces

The CLI-versus-MCP framing turns out to be a false choice. You can ship one binary that presents as both.

A Go library called [ophis](https://github.com/njayp/ophis) walks a Cobra command tree and converts every command into an MCP tool. Integrating it into the Canvas CLI took 18 lines:

```go
rootCmd.AddCommand(ophis.Command(&ophis.Config{
    ToolNamePrefix: "canvas",
    Selectors: []ophis.Selector{{
        LocalFlagSelector: ophis.ExcludeFlags("show-token"),
    }},
}))
```

That produced 253 MCP tools from the 280+ CLI commands. Required flags became required JSON Schema properties. Optional flags stayed optional. Descriptions carried over from the Cobra help text. When an MCP client calls a tool, ophis re-invokes the binary with the reconstructed arguments. No shell involved, so no injection risk.

The binary now supports both modes:

```bash
# CLI mode
canvas courses list --instance prod -o json

# MCP mode
canvas mcp start
```

The CLI keeps its advantages: auth, credential security, rate limiting, structured output. MCP mode adds discoverability and schema validation for clients that prefer it. Same binary, same security model, no duplication.

Any other Cobra-based CLI can get the same treatment. If you have a well-structured CLI, exposing it as an MCP is a single library call rather than a rewrite.

## Where This Leads

The enforcement layer (hooks, linters, tests) keeps AI-written code safe inside the editor. The CLI layer keeps it safe outside the editor, in every service the agent touches.

The next step, packaging all of this (context files, hooks, skills, agents, CLIs) into a single distributable unit, is the topic of the capstone post in this series.
