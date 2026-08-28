# Shipshape Data agent tools

The official agent toolkit for [Shipshape Data](https://shipshapedata.com/), the London AI consultancy that builds the data foundation first. Everything here wraps the same keyless, read-only surface: the public API, two MCP servers, and the site's markdown twins.

## What's in here

| Path | What it is |
| --- | --- |
| [`skills/`](skills/) | Agent skills: install with `npx skills add shipshapedata/agent-tools` |
| [`packages/cli/`](packages/cli/) | `shipshape-data` on npm: CLI (`npx shipshape-data readiness`) and Node SDK |
| [`packages/python/`](packages/python/) | `shipshape-data` on PyPI: `shipshape` CLI and Python SDK |
| [`.mcp.json`](.mcp.json), [`.cursor/`](.cursor/) | Drop-in MCP configs for Claude Code and Cursor |
| [`plugin.json`](plugin.json) | Claude Code plugin manifest (MCP servers + skills) |

## The surface it talks to

- **API**: `https://shipshapedata.com/api/v1` (self-describing; [OpenAPI 3.1 spec](https://shipshapedata.com/openapi.json))
- **MCP**: `https://shipshapedata.com/mcp` (services, case studies, resource search, AI readiness scoring) and `https://shipshapedata.com/mcp/docs` (docs Q&A, full markdown of any page)
- **NLWeb**: `POST https://shipshapedata.com/ask`
- **A2A**: [agent card](https://shipshapedata.com/.well-known/agent-card.json)
- **Guides**: [llms.txt](https://shipshapedata.com/llms.txt) | [agents.md](https://shipshapedata.com/agents.md) | [developers](https://shipshapedata.com/developers/)

No auth anywhere, no write endpoints anywhere, fair use 300 requests/minute/IP.

## Quick start

```bash
# MCP in Claude Code
claude mcp add --transport http shipshape-data https://shipshapedata.com/mcp

# Skills
npx skills add shipshapedata/agent-tools

# CLI
npx shipshape-data readiness
pip install shipshape-data && shipshape search data lineage
```

## Why this exists

We tell clients their AI is only as good as the data foundation underneath it, and that their products should be as easy for agents to use as for people. This repo is us doing it to ourselves. If you want your product to work like this, [talk to us](https://shipshapedata.com/#contact).

MIT © Shipshape Data Ltd
