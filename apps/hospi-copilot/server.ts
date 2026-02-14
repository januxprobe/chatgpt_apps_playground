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

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.join(__dirname, "..", "..", "dist", "hospi-copilot");

// Export constants for multi-app integration
export const APP_NAME = "Hospitalisation & Care Journey Copilot";
export const APP_VERSION = "1.0.0";

// Zod schema for hospitalization journey state machine
const HospitalJourneyInput = z.object({
  step: z
    .enum([
      "start",
      "select_member",
      "select_hospital",
      "admission_details",
      "room_type",
      "review",
      "submitted",
    ])
    .default("start"),
  state: z
    .object({
      memberId: z.string().optional(),
      memberName: z.string().optional(),
      hospitalName: z.string().optional(),
      hospitalCity: z.string().optional(),
      abroad: z.boolean().optional(),
      admissionDate: z.string().optional(),
      reason: z.string().optional(),
      accident: z.boolean().optional(),
      roomType: z.enum(["multi", "single", "day"]).optional(),
      notes: z.string().optional(),
      declarationId: z.string().optional(),
    })
    .optional(),
});

type HospitalJourneyInputType = z.infer<typeof HospitalJourneyInput>;

/**
 * Creates and configures the MCP server with hospital journey tool and UI resource
 */
export function createServer(): McpServer {
  const server = new McpServer({
    name: APP_NAME,
    version: APP_VERSION,
  });

  // Define UI resource URI (versioned for cache control)
  const resourceUri = "ui://hospi-copilot/widget-v1.html";

  // Register the hospital_journey tool with state machine
  registerAppTool(
    server,
    "hospital_journey",
    {
      title: "Hospital Journey",
      description:
        "Guide the user through a hospital admission flow and return UI state for the widget",
      inputSchema: {
        step: z
          .enum([
            "start",
            "select_member",
            "select_hospital",
            "admission_details",
            "room_type",
            "review",
            "submitted",
          ])
          .default("start")
          .describe("Current step in the hospitalization journey"),
        state: z
          .object({
            memberId: z.string().optional(),
            memberName: z.string().optional(),
            hospitalName: z.string().optional(),
            hospitalCity: z.string().optional(),
            abroad: z.boolean().optional(),
            admissionDate: z.string().optional(),
            reason: z.string().optional(),
            accident: z.boolean().optional(),
            roomType: z.enum(["multi", "single", "day"]).optional(),
            notes: z.string().optional(),
            declarationId: z.string().optional(),
          })
          .optional()
          .describe("Current state data accumulated through the journey"),
      },
      annotations: {
        readOnlyHint: true, // No external state modifications
        openWorldHint: false, // Bounded to this app
        destructiveHint: false, // Non-destructive
      },
      _meta: {
        ui: {
          resourceUri, // Links this tool to the UI widget
        },
      },
    },
    async (args) => {
      const parsed: HospitalJourneyInputType =
        HospitalJourneyInput.parse(args);
      const state = parsed.state ?? {};
      const step = parsed.step;

      let nextStep: HospitalJourneyInputType["step"] = step;
      let message = "";

      // State machine implementation
      switch (step) {
        case "start": {
          nextStep = "select_member";
          message =
            "I'll help you with your hospital admission. For whom is the admission (yourself or a family member)?";
          break;
        }

        case "select_member": {
          nextStep = "select_hospital";
          message =
            "Great! Please provide the patient's name, then we'll select the hospital.";
          break;
        }

        case "select_hospital": {
          nextStep = "admission_details";
          message =
            "Perfect. Now please provide the admission date and the reason (e.g., knee surgery, childbirth).";
          break;
        }

        case "admission_details": {
          nextStep = "room_type";
          message =
            "What type of room would you like? Multi-person room, single room, or day admission?";
          break;
        }

        case "room_type": {
          nextStep = "review";
          message =
            "I'll create a summary of your declaration so you can review everything before we submit.";
          break;
        }

        case "review": {
          nextStep = "submitted";
          // Generate fake declaration ID (HSP- prefix easily customizable per customer)
          const fakeId = `HSP-${Math.floor(Math.random() * 900000) + 100000}`;
          state.declarationId = fakeId;
          message =
            "Your hospitalization has been registered (demo). Use this overview and your member number to inform the hospital.";
          break;
        }

        case "submitted": {
          nextStep = "submitted";
          message =
            "Your demo declaration is complete. You can ask additional questions or simulate extra costs.";
          break;
        }
      }

      console.error(`Hospital journey: step=${step} -> nextStep=${nextStep}`);

      return {
        // All critical data in structuredContent (guaranteed to reach widget)
        structuredContent: {
          step: nextStep,
          state,
        },
        // Narrative for the AI model
        content: [
          {
            type: "text",
            text: message,
          },
        ],
      };
    }
  );

  // Register the UI resource
  registerAppResource(
    server,
    "hospi-copilot-widget",
    resourceUri,
    { mimeType: RESOURCE_MIME_TYPE },
    async () => {
      const htmlPath = path.join(
        DIST_DIR,
        "widget",
        "apps",
        "hospi-copilot",
        "widget",
        "hospi-copilot-widget.html"
      );
      console.error(`Serving UI resource from: ${htmlPath}`);

      const html = await fs.readFile(htmlPath, "utf-8");

      return {
        contents: [
          {
            uri: resourceUri,
            mimeType: RESOURCE_MIME_TYPE,
            text: html,
          },
        ],
      };
    }
  );

  console.error(`${APP_NAME} created with hospital_journey tool and widget`);

  return server;
}
