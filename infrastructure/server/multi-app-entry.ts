import { startStreamableHTTPServer } from "./main.js";
import { createMultiAppServer } from "./multi-app.js";
import type { AppServerModule } from "./types.js";

// Import all apps (will be added as apps are created)
// import * as echoApp from "../../apps/echo/server.js";
// import * as calculatorApp from "../../apps/calculator/server.js";

async function main() {
  // TODO: Uncomment as apps are migrated
  const apps: AppServerModule[] = [
    // echoApp,
    // calculatorApp,
  ];

  if (apps.length === 0) {
    console.error("❌ No apps configured in multi-app server");
    console.error("   Please run apps individually with ./scripts/start-app.sh <app-name>");
    process.exit(1);
  }

  const createServer = () => createMultiAppServer(apps);

  await startStreamableHTTPServer(createServer);
}

main().catch((e) => {
  console.error("❌ Fatal error:", e);
  process.exit(1);
});
