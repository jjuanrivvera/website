---
title: 'Git Worktrees for Parallel AI-Assisted Development'
description: 'Branch switching loses more than uncommitted changes when an AI agent is in the loop. The agent loses its session context too. Git worktrees prevent both.'
pubDate: 2026-06-06
author: 'Juan Felipe Rivera González'
tags: ['claude-code', 'git', 'worktrees', 'docker', 'workflow']
cover: '@assets/blog/covers/worktree-strategy-cover.jpg'
coverAlt: 'Cinematic photograph of a warm home-office workspace: three curved monitors on a wooden desk, each displaying a different code-editor theme (amber, teal, and purple) representing three parallel development contexts running side by side'
lang: 'en'
translationKey: 'worktree-strategy'
draft: false
featured: false
---

Context switching between branches has always been expensive. `git stash`, a branch checkout, and re-running the local environment eats five to fifteen minutes. You lose your train of thought, the files you had open are stale, and the database state you were debugging is gone. The usual fix is to be disciplined about stashing and to keep a clean working tree. That works fine when you're the only one holding the context.

With an AI agent in the loop, the cost grows in a way that doesn't get enough attention. AI coding agents (Claude Code, Codex, Gemini CLI, OpenCode) build an in-session understanding of your codebase. Over minutes to hours they accumulate context: which files matter for the task at hand, the plan they're partway through, the invariants they've inferred about a subsystem, the tests they've learned to trust. None of that is written down anywhere. It lives in the session, anchored to the files on disk.

When the working directory changes, a branch switch that replaces every tracked file, the agent's context loses its anchor. A file it had been reading still exists at the same path, so nothing errors, but the code in it may have been rewritten. The plan the agent was executing assumed a version of the codebase that's no longer on disk. The safest thing for the agent to do is re-read critical files before proceeding. That costs time, tokens, and attention. We got good at making agents productive and forgot that branch management caps that productivity.

The fix is older than the agents. A git worktree gives each branch its own directory, and a thin setup script turns that directory into a working environment instead of a bare checkout. This post is about both halves, and about why the worktree commands built into Claude Code and Codex only do the first one.

## What a Worktree Is

`git worktree` lets you check out multiple branches of the same repository, each in its own directory, without cloning the repo a second time. The underlying `.git` history is shared: commits, branches, and remotes are one store. Working files are not.

```
# Traditional branch switch
git stash
git checkout hotfix-branch
# ... work ...
git checkout feature-branch
git stash pop

# Worktree equivalent
cd project/.worktrees/hotfix-branch/
# ... work ...
cd project/
# feature branch is still there, untouched
```

No stashing. No switching. Both branches exist on disk at the same time, and both can be worked on in parallel. The part that matters most for AI work: each branch has its own directory, so each branch can host its own agent session, and that session stays stable no matter what happens in the other directory.

## The Missing Piece That Native Worktree Features Don't Solve

Claude Code has `EnterWorktree`. Codex can create worktrees. Both are useful. They do the raw `git worktree add` step. But raw `git worktree add` gives you a directory with a branch checked out. It does not give you a working development environment.

Consider what a freshly checked-out branch needs:

- **Docker setup**: unique ports so two worktrees don't collide, a separate Compose project name, dependencies installed.
- **Environment files**: `.env` values scoped to the worktree (database URLs, API keys that point to the right local port).
- **Dependency installation**: what differs between the base branch and the feature branch may need `npm ci`, `composer install`, or `uv sync`.
- **AI agent context**: the CLAUDE.md, skills, hooks, and agent configs that live in the main project directory. Without them, the agent inside a worktree behaves like a new hire on day one.

Native worktree tools skip all of this. They solve the _git_ problem but not the _development environment_ problem, and for practical AI-assisted work the environment problem is the hard part.

This is not theoretical. The worktree skill in my main workspace carries a note explaining that its config-linking step exists precisely to repair worktrees created by Claude Code's `EnterWorktree`, which come up without the AI config symlinks. The builtin creates the directory. You still have to make it habitable. That gap is the entire reason a wrapper exists.

Not every project suffers from this. Go projects compile fast and have no local dev environment to speak of. A single `go run` and you're on the new branch. Infrastructure scripts, dbt models, quick SQL changes: none of these need worktree tooling. The payoff shows up when your project has a non-trivial local setup that takes minutes to rebuild between branches.

## How I Solve the Environment Problem

Everything below is the `wt` wrapper I wrote for my own projects. Read it as a worked example, not a tool to install. Your stack will want a different mix of these pieces, and the value is in seeing which pieces exist and when each one earns its place.

The wrapper does whatever the project type needs and nothing it doesn't. A heavy Docker stack needs ports and Compose names. A Go project needs almost nothing. The trick is one tool that scales from "do everything" down to "do nothing" depending on the project, so you only ever maintain one workflow.

### Port Assignment

Docker port conflicts are the first thing that breaks when two copies of a project run on the same machine. The wrapper assigns ports deterministically:

```
my-api/                          # main: port 8000
my-api/.worktrees/FEAT-101/      # worktree: port 8001
my-api/.worktrees/BUG-204/       # worktree: port 8002
```

The main working directory keeps the project's default port. Each new worktree gets the next free port. If a port is already taken by anything on the machine, the wrapper skips it and picks the next one. When a worktree is removed, its port goes back into the pool.

Each worktree also gets its own Docker Compose project name, derived from the branch name:

```bash
COMPOSE_PROJECT_NAME=worktree-bug-204
```

So `docker compose up -d` in two worktrees produces two independent copies of the service that never collide on containers or ports. (If both point at the same shared dev database, that's a separate decision, not a side effect of worktrees. More on that below.)

### Project-Type-Specific Setup

Languages differ, so a one-size-fits-all setup doesn't work. The wrapper detects the project type and runs the right bootstrap:

- **PHP (Docker Compose)**: sets a unique `APP_PORT` in `.env`, a matching `APP_SSL_PORT`, a sanitized `COMPOSE_PROJECT_NAME`, and removes hardcoded port bindings from `docker-compose.yml` so Compose uses the `.env` values. Composer dependencies install inside Docker.
- **Python (Django)**: creates a fresh virtual environment, installs requirements, runs migrations.
- **Python (uv-based)**: runs `uv sync`.
- **JavaScript/TypeScript**: runs `pnpm install` (or `npm ci`).
- **Go**: no setup needed. Go handles dependencies per-module.

The wrapper is just a shell or Go script kept with the project. Each project defines its own setup function, and the wrapper dispatches on a project-type hint.

### AI Config Symlinks

Agent context files are the piece most worktree tutorials skip, and they are the piece that lets a worktree session stand on its own. A worktree created with `git worktree add` lacks the `.claude/skills/`, the `AGENTS.md`, the `.mcp.json`, and the hooks that make the agent effective.

This matters more than it looks. When Claude Code or Codex create a worktree for you, the agent working in it is still the parent session. The skills, agents, hooks, and MCP config live in the directory you launched from, not in the worktree. So the worktree is useful only while that parent session stays alive. You can't close it and pick the work back up later as a fresh, self-contained session inside the worktree.

Symlinking the AI framework into the worktree removes that dependency. The wrapper links skill directories, agent configs, command registries, instruction files (CLAUDE.md, AGENTS.md), and MCP server configs into every worktree at creation time. One file gets copied rather than symlinked: the local settings file that carries port-specific values. Now the worktree carries its own full AI setup. Paired with its own dev environment, you can open a brand-new agent session straight in the worktree, in its own terminal, and it has everything the main directory has. It runs independently of the parent. You can close the session that created it, or keep several going at once, each one its own long-lived session.

The agent doesn't know, and doesn't need to know, that it's in a worktree. The hooks fire as usual, and so does the quality pipeline.

### Port Recycling on Removal

When a worktree is removed, the wrapper stops its Docker containers and frees the port. The next worktree creation sees the freed port and may assign it. This keeps the port range compact over a long development cycle.

A separate cleanup command scans all worktrees, removes those whose branches already merged into `main`, and stops their containers:

```bash
wt cleanup my-api     # one project
wt cleanup            # all projects in the workspace
```

Run weekly, this stops worktrees from piling up without touching active work.

## Match the Setup to What Your Stack Needs

The same `wt create <project> <branch>` command runs across every project, but what it _does_ should track the stack. Every piece of setup is a cost, so add it only where the stack forces you to and your worktrees stay cheap. Two examples mark the range.

A Go project needs almost nothing. The module cache is global, there are no local services to start, and there's no port to assign. The setup function is empty. You still get the whole point of worktrees: an independent session per branch and isolated compilation. Even at zero setup, the same wrapper handles the project, so you don't keep a second tool around for the easy case.

A modern JavaScript app sits one step up, and it teaches the opposite lesson: don't write machinery you don't need. A Vite-based app needs none of the Docker port-collision logic, because the dev server already picks a free port on its own. Assigning ports by hand here is effort spent fighting a problem the tooling already solved. What's worth doing is symlinking `node_modules` back to the main checkout so each worktree doesn't reinstall hundreds of megabytes of dependencies.

The heavy end is a Docker Compose stack with several services and fixed ports in the compose file. That's where the full treatment earns its keep: assign a free port, set a unique Compose project name, patch the hardcoded port bindings, install dependencies in the container. By hand this is ten to fifteen minutes of careful, error-prone setup every time you start a parallel task. Automated, it's a few seconds.

The same principle covers databases and any other shared service. Give a worktree its own database when the work needs the isolation; otherwise let it share the parent's. Worktrees isolate files and processes, not external state, so isolating that state is an extra step you take only when the work calls for it. Do the least your stack requires.

## Making It Your Own

The project-specific setup is the key design choice. Rather than one monolithic script that knows about every project type, the wrapper is extensible: adding support for a new stack means writing a small function that handles `setup` and `teardown` for that project type.

This is what lets one tool cover stacks that look nothing alike:

- A team with pure Go microservices writes nothing. The empty setup function is the whole story.
- A team running Docker focuses on the port and Compose logic and ignores everything else.
- A Django team adds virtualenv creation and migration steps without touching anyone else's config.

The pattern is: `wt create <project> <branch>` does the git work, then asks the project's registered setup function to prepare the environment. The project registration is a config file, one line per project.

So the takeaway isn't my script. It's the split: do the git work once, then hand control to a per-project setup step you write for your own stack. I built `wt` around the projects I happen to work on. You should build yours around the ones you do, with setup functions for the stacks you use and nothing for the ones you don't. It's a few hundred lines of shell, not a framework. The worktree is the universal part; the setup is always going to be yours.

## Where Worktrees Pay Off Most

| Scenario                                                                                                          | Payoff                                       |
| ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| Docker-heavy stacks where local setup takes minutes (PHP APIs, Django portals, JS apps with large `node_modules`) | High                                         |
| Go projects, infrastructure scripts, quick one-off changes                                                        | Low (but parallel agent sessions still help) |
| Cross-project tickets that touch multiple services at once                                                        | Maximum                                      |

The highest-payoff scenario is a cross-project ticket that touches a PHP API, a JavaScript frontend, and a Python service at once. You spin up a worktree in each, every one on its own ports with its own agent session, and move between them by changing directory. Nothing collides. The alternative is juggling three branches and rebuilding three environments by hand, painful enough to discourage parallel work entirely.

Worktrees take that cost away. Each ticket lives in a directory of its own, with whatever Docker environment and agent session it needs sitting right beside it. Close one terminal, open another, and everything is where you left it. The branch switch becomes a directory change, and the agent doesn't lose its place.

A human juggling two branches pays for it in focus. An agent pays for it in correctness: quietly, because it acts on a codebase that moved out from under it. Worktrees are how you stop making it pay.
