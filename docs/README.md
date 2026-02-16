# Documentation

This directory contains general documentation for the MCP Apps Playground project.

## General Documentation

- **[CLAUDE_DESKTOP_COMPATIBILITY.md](./CLAUDE_DESKTOP_COMPATIBILITY.md)** - Complete guide to Claude Desktop compatibility, setup automation, and platform comparison

## App-Specific Documentation

App-specific documentation is organized under each app's `docs/` folder:

- `apps/echo/docs/` - Echo app documentation
- `apps/calculator/docs/` - Calculator app documentation
- `apps/hospi-copilot/docs/` - Hospitalization Copilot documentation
- `apps/pdf-generator/docs/` - PDF Generator documentation
  - [KNOWN_ISSUES.md](../apps/pdf-generator/docs/KNOWN_ISSUES.md) - Claude Desktop compatibility investigation notes

## Root Documentation

- `README.md` - User-facing project overview and quick start
- `CLAUDE.md` - Developer instructions and MCP Apps patterns

## Documentation Guidelines

### General Documentation (this directory)

Place documentation here if it:
- Applies to the entire project
- Covers cross-cutting concerns (platform compatibility, architecture, etc.)
- Provides project-wide guidance or references

### App-Specific Documentation

Place documentation in `apps/{app-id}/docs/` if it:
- Applies only to a specific app
- Covers app-specific features, issues, or implementation details
- Documents app-specific patterns or design decisions

### Examples

**General documentation:**
- Platform compatibility guides
- Architecture decision records
- Contribution guidelines
- Security policies

**App-specific documentation:**
- Known issues for a specific app
- App-specific API documentation
- Template usage guides
- Feature implementation notes
