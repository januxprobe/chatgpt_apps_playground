/**
 * PDF Generator MCP App - Standalone Entry Point
 *
 * Supports both ChatGPT (HTTP) and Claude Desktop (STDIO) transports
 */

import {
  startStreamableHTTPServer,
  startStdioServer,
} from "../../infrastructure/server/main.js";
import { createServer } from "./server.js";

async function main() {
  if (process.argv.includes("--stdio")) {
    // Claude Desktop: STDIO transport
    await startStdioServer(createServer);
  } else {
    // ChatGPT: HTTP transport
    await startStreamableHTTPServer(createServer);
  }
}

main().catch((e) => {
  console.error("❌ Fatal error:", e);
  process.exit(1);
});
