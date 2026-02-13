import { App } from "@modelcontextprotocol/ext-apps";

// Initialize the MCP App
const app = new App({
  name: "Calculator Widget",
  version: "1.0.0",
});

// DOM elements
const equationEl = document.getElementById("equation") as HTMLElement;
const resultEl = document.getElementById("result") as HTMLElement;
const operationEl = document.getElementById("operation") as HTMLElement;
const timestampEl = document.getElementById("timestamp") as HTMLElement;
const errorContainerEl = document.getElementById("error-container") as HTMLElement;

const addBtn = document.getElementById("add-btn") as HTMLButtonElement;
const subtractBtn = document.getElementById("subtract-btn") as HTMLButtonElement;
const multiplyBtn = document.getElementById("multiply-btn") as HTMLButtonElement;
const divideBtn = document.getElementById("divide-btn") as HTMLButtonElement;

// Store current operands for "Calculate Again" functionality
let currentA = 5;
let currentB = 3;

/**
 * Formats ISO timestamp to readable format
 */
function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString();
}

/**
 * Shows an error message
 */
function showError(message: string): void {
  errorContainerEl.innerHTML = `<div class="error-message">❌ ${message}</div>`;
  setTimeout(() => {
    errorContainerEl.innerHTML = "";
  }, 5000);
}

/**
 * Updates the UI with calculation results
 */
function updateUI(result: any): void {
  try {
    const data = result.structuredContent;

    if (!data) {
      showError("No data received from tool");
      return;
    }

    // Update display
    if (data.equation) {
      equationEl.textContent = data.equation;
    }

    if (data.error) {
      resultEl.textContent = data.error;
      resultEl.classList.add("error");
    } else if (data.result !== undefined && data.result !== null) {
      resultEl.textContent = String(data.result);
      resultEl.classList.remove("error");
    }

    if (data.operation) {
      operationEl.textContent = data.operation;
    }

    if (data.timestamp) {
      timestampEl.textContent = formatTimestamp(data.timestamp);
    }

    // Store operands for next calculation
    if (data.operand1 !== undefined) currentA = data.operand1;
    if (data.operand2 !== undefined) currentB = data.operand2;

    console.error("✅ Calculator UI updated:", data);
  } catch (error) {
    console.error("❌ Error updating UI:", error);
    showError("Failed to update UI");
  }
}

/**
 * Calls a calculator tool with current operands
 */
async function calculate(operation: string): Promise<void> {
  try {
    console.error(`🧮 Calculating: ${operation}(${currentA}, ${currentB})`);

    const result = await app.callServerTool({
      name: operation,
      arguments: {
        a: currentA,
        b: currentB,
      },
    });

    console.error("📥 Tool result:", result);
    updateUI(result);
  } catch (error) {
    console.error("❌ Error calling tool:", error);
    showError(`Failed to execute ${operation}`);
  }
}

// Set up event listeners for operation buttons
addBtn.addEventListener("click", () => calculate("add"));
subtractBtn.addEventListener("click", () => calculate("subtract"));
multiplyBtn.addEventListener("click", () => calculate("multiply"));
divideBtn.addEventListener("click", () => calculate("divide"));

// Handle tool results from ChatGPT
app.ontoolresult = (result) => {
  console.error("📥 Tool result received from ChatGPT:", result);
  updateUI(result);
};

// Connect to MCP host
console.error("🔌 Connecting Calculator Widget to MCP host...");
app.connect();

console.error("✅ Calculator Widget initialized");
