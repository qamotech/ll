# AI Context Hub

> A lightweight, dependency-free Node.js server that bundles local codebase context into AI-readable formats.

## Core Architecture
- **Backend:** Native Node.js `http`, `fs`, and `path` modules. Zero external dependencies.
- **Frontend:** Semantic HTML5 and Vanilla JS.
- **API Endpoints:**
  - `GET /api/context`: Returns the current directory's codebase bundled into a single XML string, optimized for LLM token limits.
  - `GET /api/llms.txt`: Serves this metadata file.

## Developer Workflow
This hub runs locally. Autonomous coding agents should fetch `/api/context` to understand the full project state before attempting to write or refactor code.