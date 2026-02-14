import { App } from "@modelcontextprotocol/ext-apps";

// Initialize the MCP App
const app = new App({
  name: "Hospi-Copilot Widget",
  version: "1.0.0",
});

// Type definitions
type HospState = {
  step:
    | "start"
    | "select_member"
    | "select_hospital"
    | "admission_details"
    | "room_type"
    | "review"
    | "submitted";
  state: {
    memberId?: string;
    memberName?: string;
    hospitalName?: string;
    hospitalCity?: string;
    abroad?: boolean;
    admissionDate?: string;
    reason?: string;
    accident?: boolean;
    roomType?: string;
    notes?: string;
    declarationId?: string;
  };
};

// Handle tool results from server
app.ontoolresult = (result: any) => {
  console.error("📥 Tool result received:", result);
  const data = result.structuredContent as HospState;
  renderStep(data);
};

// Helper to call the journey tool
async function callJourney(
  update: Partial<HospState["state"]>,
  step: HospState["step"]
) {
  try {
    console.error(`🔧 Calling hospital_journey: step=${step}`, update);
    const result = await app.callServerTool({
      name: "hospital_journey",
      arguments: {
        step,
        state: update,
      },
    });
    console.error(`📥 Tool result:`, result);
    const data = result.structuredContent as HospState;
    renderStep(data);
  } catch (error) {
    console.error(`❌ Error calling hospital_journey:`, error);
  }
}

// Main render function
function renderStep(data: HospState) {
  const container = document.getElementById("hospi-step-container");
  if (!container) return;

  const { step, state } = data;

  console.error(`🎨 Rendering step: ${step}`);

  // Clear existing content
  container.innerHTML = "";

  if (step === "select_member") {
    container.innerHTML = `
      <div class="hospi-card">
        <h3>Step 1: Who is being admitted?</h3>
        <div class="hospi-field">
          <label>Patient Name</label>
          <input id="memberName" placeholder="E.g., yourself or child" value="${
            state.memberName ?? ""
          }" />
        </div>
        <div class="hospi-actions">
          <button id="memberNext" class="hospi-btn hospi-btn-primary">Next</button>
        </div>
      </div>
    `;
    document
      .getElementById("memberNext")
      ?.addEventListener("click", () => {
        const memberName = (
          document.getElementById("memberName") as HTMLInputElement
        ).value;
        callJourney(
          {
            ...state,
            memberName,
          },
          "select_member"
        );
      });
    return;
  }

  if (step === "select_hospital") {
    container.innerHTML = `
      <div class="hospi-card">
        <h3>Step 2: Hospital Selection</h3>
        <div class="hospi-field">
          <label>Hospital Name</label>
          <input id="hospitalName" placeholder="E.g., UZ Leuven" value="${
            state.hospitalName ?? ""
          }" />
        </div>
        <div class="hospi-field">
          <label>City / Municipality</label>
          <input id="hospitalCity" placeholder="City or municipality" value="${
            state.hospitalCity ?? ""
          }" />
        </div>
        <div class="hospi-field">
          <label>Abroad?</label>
          <select id="abroad">
            <option value="false" ${
              state.abroad ? "" : "selected"
            }>No, Belgium</option>
            <option value="true" ${
              state.abroad ? "selected" : ""
            }>Yes, outside Belgium</option>
          </select>
        </div>
        <div class="hospi-actions">
          <button id="hospitalNext" class="hospi-btn hospi-btn-primary">Next</button>
        </div>
      </div>
    `;
    document
      .getElementById("hospitalNext")
      ?.addEventListener("click", () => {
        const hospitalName = (
          document.getElementById("hospitalName") as HTMLInputElement
        ).value;
        const hospitalCity = (
          document.getElementById("hospitalCity") as HTMLInputElement
        ).value;
        const abroad =
          (document.getElementById("abroad") as HTMLSelectElement).value ===
          "true";
        callJourney(
          {
            ...state,
            hospitalName,
            hospitalCity,
            abroad,
          },
          "select_hospital"
        );
      });
    return;
  }

  if (step === "admission_details") {
    container.innerHTML = `
      <div class="hospi-card">
        <h3>Step 3: Admission Details</h3>
        <div class="hospi-field">
          <label>Admission Date</label>
          <input id="admissionDate" placeholder="E.g., 24/03/2026" value="${
            state.admissionDate ?? ""
          }" />
        </div>
        <div class="hospi-field">
          <label>Reason for Admission</label>
          <input id="reason" placeholder="E.g., knee surgery, childbirth" value="${
            state.reason ?? ""
          }" />
        </div>
        <div class="hospi-field">
          <label>Is this the result of an accident?</label>
          <select id="accident">
            <option value="false" ${
              state.accident ? "" : "selected"
            }>No</option>
            <option value="true" ${
              state.accident ? "selected" : ""
            }>Yes</option>
          </select>
        </div>
        <div class="hospi-actions">
          <button id="detailsNext" class="hospi-btn hospi-btn-primary">Next</button>
        </div>
      </div>
    `;
    document
      .getElementById("detailsNext")
      ?.addEventListener("click", () => {
        const admissionDate = (
          document.getElementById("admissionDate") as HTMLInputElement
        ).value;
        const reason = (
          document.getElementById("reason") as HTMLInputElement
        ).value;
        const accident =
          (document.getElementById("accident") as HTMLSelectElement).value ===
          "true";
        callJourney(
          {
            ...state,
            admissionDate,
            reason,
            accident,
          },
          "admission_details"
        );
      });
    return;
  }

  if (step === "room_type") {
    container.innerHTML = `
      <div class="hospi-card">
        <h3>Step 4: Room Type</h3>
        <div class="hospi-field">
          <label>Room Type</label>
          <select id="roomType">
            <option value="multi" ${
              state.roomType === "multi" || !state.roomType ? "selected" : ""
            }>Multi-person room</option>
            <option value="single" ${
              state.roomType === "single" ? "selected" : ""
            }>Single room</option>
            <option value="day" ${
              state.roomType === "day" ? "selected" : ""
            }>Day admission</option>
          </select>
        </div>
        <div class="hospi-actions">
          <button id="roomNext" class="hospi-btn hospi-btn-primary">Review</button>
        </div>
      </div>
    `;
    document.getElementById("roomNext")?.addEventListener("click", () => {
      const roomType = (
        document.getElementById("roomType") as HTMLSelectElement
      ).value;
      callJourney(
        {
          ...state,
          roomType,
        },
        "room_type"
      );
    });
    return;
  }

  if (step === "review" || step === "submitted") {
    const roomTypeLabel =
      state.roomType === "multi"
        ? "Multi-person room"
        : state.roomType === "single"
        ? "Single room"
        : state.roomType === "day"
        ? "Day admission"
        : "-";

    container.innerHTML = `
      <div class="hospi-card">
        <h3>Overview: Hospitalization (Demo)</h3>
        ${
          state.declarationId
            ? `<div class="hospi-declaration-id">
                Declaration ID: ${state.declarationId}
              </div>`
            : ""
        }
        <ul class="hospi-summary">
          <li><strong>Patient</strong><span>${
            state.memberName ?? "-"
          }</span></li>
          <li><strong>Hospital</strong><span>${state.hospitalName ?? "-"}${
      state.hospitalCity ? " (" + state.hospitalCity + ")" : ""
    }</span></li>
          <li><strong>Admission Date</strong><span>${
            state.admissionDate ?? "-"
          }</span></li>
          <li><strong>Reason</strong><span>${state.reason ?? "-"}</span></li>
          <li><strong>Accident</strong><span>${
            state.accident ? "Yes" : "No or unknown"
          }</span></li>
          <li><strong>Room Type</strong><span>${roomTypeLabel}</span></li>
        </ul>
        <p class="hospi-note">
          💡 In production, this would also show your member number and information about third-party payment arrangements.
        </p>
      </div>
    `;
    return;
  }
}

// Connect to MCP host
console.error("🔌 Connecting Hospi-Copilot Widget to MCP host...");
app.connect();
console.error("✅ Hospi-Copilot Widget initialized");
