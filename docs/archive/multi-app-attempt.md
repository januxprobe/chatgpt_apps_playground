# Multi-App Server Implementation Attempt

## Goal
Serve multiple MCP apps (echo, calculator, hospi-copilot) from a single endpoint so ChatGPT users only need ONE connector with ALL tools available.

## Why This Was Attempted
- Better user experience: One connector instead of three
- Simpler deployment: One server process instead of multiple
- Resource efficiency: Shared port and infrastructure

## Current Status
**NOT IMPLEMENTED** - Individual apps work perfectly, but combining them on a single server is blocked by SDK limitations.

## What Works
✅ Individual apps work perfectly on their own
✅ Each app's `createServer()` returns a fully functional McpServer
✅ All widgets, tools, and resources work correctly
✅ Both HTTP (ChatGPT) and STDIO (Claude Desktop) transports work

## What Doesn't Work
❌ Combining multiple apps on a single MCP server endpoint

## Approaches Attempted

### Approach 1: Copy Internal Tool/Resource Maps
**Method:** Copy `_registeredTools` and `_registeredResources` from app servers to main server

**Result:** ❌ Failed - MCP protocol handlers not initialized

**Reason:** Just copying internal dictionaries doesn't trigger handler setup. The MCP SDK's protocol handlers (initialize, tools/call, resources/read) are initialized during server construction or first connect, not by manipulating internal maps.

### Approach 2: Request Routing
**Method:** Intercept requests and route to correct app server based on tool/resource name

**Result:** ❌ Failed - Too complex, breaks StreamableHTTPServerTransport

**Reason:** HTTP transport expects to own entire request/response cycle. Intercepting and routing breaks the transport's internal state management.

### Approach 3: Merge Before Initialization
**Method:** Merge tool maps before server initialization, hoping handlers would initialize correctly

**Result:** ❌ Failed - Handlers still not initialized correctly

**Reason:** McpServer initialization happens during construction, not during connect(). Merging after construction is too late.

## Root Cause
The MCP SDK's `McpServer` class initializes protocol handlers during construction or first connect. The internal registration maps (`_registeredTools`, `_registeredResources`) are private implementation details, and manipulating them doesn't trigger the proper handler initialization.

## Recommended Solution
**Deploy apps individually** - each on its own endpoint/connector. This is the supported pattern and works flawlessly.

**Benefits of individual deployment:**
- ✅ Fully supported by MCP SDK
- ✅ No complexity or workarounds
- ✅ Each app can be updated independently
- ✅ Clear separation of concerns
- ✅ Easier debugging and monitoring
- ✅ No tool name conflicts possible

## Alternative Architectures Considered

### Multiple Endpoints on One Server
**Pattern:** `/echo`, `/calculator`, `/hospi-copilot` paths on one Express server

**Issue:** Still needs multiple ChatGPT connectors (one per endpoint)

**Verdict:** No advantage over separate deployments

### Proxy Server
**Pattern:** Single entry point that proxies to individual app servers

**Issue:** Adds complexity without solving the core protocol handler issue

**Verdict:** Over-engineered for the problem

### Modified App Pattern
**Pattern:** Rewrite apps to accept an existing McpServer instance instead of creating their own

**Issue:** Requires rewriting all apps, breaks standalone pattern

**Verdict:** Too invasive, loses app independence

## Future Possibilities

If you still want to pursue multi-app server in the future:

1. **Check MCP SDK Updates**: Future SDK versions may officially support this pattern
2. **Research MCP Source**: Dive into SDK source code to find official multi-app support
3. **Experimental Features**: Check if MCP has experimental flags for this use case
4. **Accept Single Endpoint Limitation**: The current "deploy individually" pattern may be canonical

## Lessons Learned

1. **Private Implementation Details**: Don't rely on internal SDK properties (`_registeredTools`, etc.)
2. **Protocol Handler Lifecycle**: Understand when and how framework handlers initialize
3. **Transport Ownership**: Don't try to intercept or route at the transport level
4. **SDK Patterns**: Follow the SDK's intended usage patterns
5. **Simplicity Wins**: Sometimes the simple solution (individual deployment) is the right one

## Production Recommendation

For production deployments:
```bash
# Deploy each app separately
./scripts/start-app.sh echo
./scripts/start-app.sh calculator
./scripts/start-app.sh hospi-copilot
```

Or use separate ports:
```bash
PORT=3001 ./scripts/start-app.sh echo &
PORT=3002 ./scripts/start-app.sh calculator &
PORT=3003 ./scripts/start-app.sh hospi-copilot &
```

Each gets its own ChatGPT connector, which is fine - it's clear and works perfectly.

## Conclusion

The multi-app server attempt was a valuable learning experience. While it didn't work, we now understand:
- The MCP SDK's internal architecture better
- Why individual deployment is the recommended pattern
- What approaches don't work and why

**Current recommendation:** Continue with individual app deployment. It works perfectly, is fully supported, and is simpler to maintain.

---

*Documented: February 2026*
*Status: Archived - Not Implemented*
