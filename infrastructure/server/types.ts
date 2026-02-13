import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * Interface for app server modules
 * Each app exports these to integrate with the playground
 */
export interface AppServerModule {
  /** Human-readable app name */
  APP_NAME: string;

  /** Semantic version */
  APP_VERSION: string;

  /** Factory function that creates the app's MCP server */
  createServer: () => McpServer;
}

/**
 * Configuration for running an app
 */
export interface AppConfig {
  /** App identifier (folder name) */
  id: string;

  /** Display name */
  name: string;

  /** Port to run on (default 3001) */
  port?: number;

  /** Path to server module */
  serverModule: string;
}
