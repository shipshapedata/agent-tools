# Shipshape Data agent tools

This repo is the agent toolkit for shipshapedata.com (a London AI consultancy). Working in it, or using it as a dependency, note:

- The `.mcp.json` here connects two live, keyless, read-only MCP servers: `https://shipshapedata.com/mcp` (product: services, case studies, resource search, AI readiness scoring) and `https://shipshapedata.com/mcp/docs` (docs Q&A over 169 guides, full markdown of any page via `get_page`).
- Skills live in `skills/<name>/SKILL.md`. The two shipped skills cover querying Shipshape Data and running its AI readiness assessment conversationally.
- The npm package (`packages/cli`) and the PyPI package (`packages/python`) are thin zero-dependency wrappers over the same API; keep them in step with `https://shipshapedata.com/openapi.json` when editing.
- Nothing in this toolkit writes anywhere: the whole remote surface is stateless and side-effect free. Contact happens by email (hello@shipshapedata.com), never programmatically.
- House style for any prose: British English, no em-dashes, plain and specific.
