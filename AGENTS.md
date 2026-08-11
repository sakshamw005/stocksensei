# AGENTS.md

## Project Context

This repository contains the `stocksensei` frontend and serverless helpers. Start with `README.md` for local setup and development.

## Key Files

- `src/`: frontend application source.
- `src/api/dbClient.js`: local placeholder client used by integrations.
- `vite.config.js`: Vite configuration.
- `.env.local`: local-only environment values; never commit secrets.

## Working Notes

- Use `npm run dev` for local frontend development.
- The `serverless` folder contains serverless functions and helpers; keep or remove it depending on whether you deploy those functions.
- Run the checks from `package.json` before finishing code changes.
