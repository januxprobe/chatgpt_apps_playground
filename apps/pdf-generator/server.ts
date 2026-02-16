/**
 * PDF Generator MCP App
 *
 * Built with TDD - this code was written to make tests pass!
 */

import {
  registerAppResource,
  registerAppTool,
  RESOURCE_MIME_TYPE,
} from "@modelcontextprotocol/ext-apps/server";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generatePDF } from "../../infrastructure/server/utils/pdf-utils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, "..", "..", "dist", "pdf-generator");

// Detect transport mode: STDIO (Claude Desktop) vs HTTP (ChatGPT)
const isStdio = process.argv.includes("--stdio");

// Export constants for multi-app integration
export const APP_NAME = "PDF Generator";
export const APP_VERSION = "1.0.0";

/**
 * Creates and configures the MCP server with PDF generation tool
 */
export function createServer(): McpServer {
  const server = new McpServer({
    name: APP_NAME,
    version: APP_VERSION,
  });

  // Define UI resource URI
  const resourceUri = "ui://pdf-generator/widget.html";

  // Register the generate_pdf tool
  registerAppTool(
    server,
    "generate_pdf",
    {
      title: "Generate PDF",
      description: "Generates a PDF document from structured data using templates",
      inputSchema: {
        template: z.enum(["simple", "invoice"]).describe("Template to use"),
        data: z.object({
          title: z.string(),
          content: z.string().optional(),
          date: z.string().optional(),
          items: z.array(z.object({
            description: z.string(),
            amount: z.number(),
          })).optional(),
        }).describe("Data to populate the template"),
      },
      annotations: {
        readOnlyHint: true,
        openWorldHint: false,
        destructiveHint: false,
      },
      _meta: {
        ui: {
          resourceUri,
        },
      },
    },
    async (args) => {
      const { template, data } = args;

      console.error(`generate_pdf called with template: ${template}`);

      // Generate PDF using our utilities
      const pdfBuffer = await generatePDF(template, data as any);

      // Convert to Base64 data URL
      const base64 = pdfBuffer.toString('base64');
      const pdfDataUrl = `data:application/pdf;base64,${base64}`;

      // Generate filename from title
      const filename = `${data.title.replace(/\s+/g, '_')}.pdf`;

      // Calculate size in KB
      const sizeKB = (pdfBuffer.length / 1024).toFixed(2);

      return {
        structuredContent: {
          pdfDataUrl,
          filename,
          sizeKB,
          template,
        },
        content: [
          {
            type: "text",
            text: `Generated ${template} PDF: ${data.title} (${sizeKB} KB)`
          }
        ],
      };
    }
  );

  // Register the UI resource (widget)
  registerAppResource(
    server,
    "pdf-generator-widget",
    resourceUri,
    { mimeType: RESOURCE_MIME_TYPE },
    async () => {
      const htmlPath = path.join(DIST_DIR, "widget", "apps", "pdf-generator", "widget", "pdf-generator-widget.html");
      console.error(`Serving UI resource from: ${htmlPath}`);

      // Read the built widget HTML
      const html = await fs.readFile(htmlPath, "utf-8");

      return {
        contents: [
          {
            uri: resourceUri,
            mimeType: RESOURCE_MIME_TYPE,
            text: html,
            _meta: {
              ui: {
                ...(isStdio ? {} : { domain: "pdf-generator" }),
                csp: {
                  connectDomains: [],
                  resourceDomains: ["https://cdn.jsdelivr.net"], // PDF.js worker
                },
              },
            },
          },
        ],
      };
    }
  );

  console.error("PDF Generator MCP server created with 1 tool and 1 resource");

  return server;
}
