# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Terminal CLI app for curating tech stacks with instructions on how to develop using each stack with Claude Code. Built with OpenTUI (React reconciler for terminal UIs) on Bun.

## Commands

- `bun install` — install dependencies
- `bun dev` — run app in watch mode
- `bun add <pkg>` — add a dependency (never manually edit package.json)

## Architecture

OpenTUI React app. Entry point: `src/index.tsx`. Uses a custom React reconciler (`@opentui/react`) that renders to the terminal instead of the DOM. Layout is flexbox-based via Yoga engine. TSX configured with `jsxImportSource: @opentui/react` in tsconfig.

Core primitives: `<box>` (layout container), `<text>` (styled text), `<ascii-font>` (banner text).

## Conventions

- **Package manager**: Bun only. Always use `bun add` to install packages — never add deps to package.json manually.
- **Skills**: Load the OpenTUI skill (`/opentui`) before implementing any UI work.
- **Code research**: Use `bunx --bun opensrc` (`bunx --bun opensrc --help` to see available commands) to research patterns and usage from open source repos before implementing unfamiliar features.
- **Process exit**: Never call `process.exit()` — use `renderer.destroy()` instead.
- **Text styling**: Use nested modifier elements, not props (React/OpenTUI pattern).
