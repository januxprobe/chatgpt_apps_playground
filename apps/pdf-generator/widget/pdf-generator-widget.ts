/**
 * PDF Generator Widget - PDF.js Implementation
 *
 * Based on official pdf-server example from modelcontextprotocol/ext-apps
 * Uses PDF.js for rendering and Blob for downloads
 */

import { App } from "@modelcontextprotocol/ext-apps";
import * as pdfjsLib from "pdfjs-dist";

// Configure PDF.js worker - use CDN for bundled version
pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

// Initialize the MCP App bridge
const app = new App({
  name: "PDF Generator Widget",
  version: "1.0.0",
});

// Connect to the host
app.connect();

// Get DOM elements
const loading = document.getElementById('loading')!;
const canvasContainer = document.getElementById('canvas-container')!;
const canvas = document.getElementById('pdf-canvas') as HTMLCanvasElement;
const infoBar = document.getElementById('info-bar')!;
const filenameDisplay = document.getElementById('filename-display')!;
const sizeDisplay = document.getElementById('size-display')!;
const templateDisplay = document.getElementById('template-display')!;
const prevPageBtn = document.getElementById('prev-page') as HTMLButtonElement;
const nextPageBtn = document.getElementById('next-page') as HTMLButtonElement;
const pageInfo = document.getElementById('page-info')!;
const linkContainer = document.getElementById('link-container')!;
const linkInput = document.getElementById('link-input') as HTMLInputElement;

// Debug mode - set to false for production
const DEBUG = false;
const debugEl = DEBUG ? (() => {
  const el = document.createElement('div');
  el.style.cssText = 'position: fixed; top: 10px; right: 10px; background: #333; color: #0f0; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px; z-index: 9999;';
  el.textContent = 'Widget initialized';
  document.body.appendChild(el);
  return el;
})() : { textContent: '', style: { background: '', color: '' } };

// State
let pdfDocument: pdfjsLib.PDFDocumentProxy | null = null;
let currentPdfBlob: Blob | null = null;
let currentFilename: string | null = null;
let currentPage = 1;
let totalPages = 0;

/**
 * Convert base64 data URL to Uint8Array
 */
function dataURLToUint8Array(dataUrl: string): Uint8Array {
  // Remove data URL prefix (e.g., "data:application/pdf;base64,")
  const base64 = dataUrl.split(',')[1];

  // Decode base64 to binary string
  const binaryString = atob(base64);

  // Convert binary string to Uint8Array
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes;
}

/**
 * Render the current page to canvas
 */
async function renderPage() {
  if (!pdfDocument) return;

  try {
    const page = await pdfDocument.getPage(currentPage);
    const viewport = page.getViewport({ scale: 1.5 });

    // Set canvas dimensions
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    console.log(`Canvas dimensions: ${canvas.width}x${canvas.height}`);
    console.log(`Canvas visible:`, canvas.offsetWidth, canvas.offsetHeight);

    const context = canvas.getContext('2d')!;

    // Clear canvas first
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Set white background for PDF
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Try PDF.js rendering with error handling
    try {
      const renderTask = page.render({
        canvasContext: context,
        viewport: viewport,
      } as any);

      console.log('PDF.js render task started...');

      await renderTask.promise;

      console.log('PDF.js render completed successfully!');
    } catch (error) {
      console.error('PDF.js render error:', error);

      // Show error on canvas
      context.fillStyle = '#ffcccc';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = '#ff0000';
      context.font = '24px Arial';
      context.fillText(`PDF.js Error: ${error}`, 50, 100);

      debugEl.textContent = `PDF.js error: ${error}`;
      debugEl.style.background = '#f00';
    }

    // Update page info
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

    // Update navigation buttons
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;

    console.log(`Rendered page ${currentPage}/${totalPages} - Canvas: ${canvas.width}x${canvas.height}`);
    debugEl.textContent = `Rendered page ${currentPage}/${totalPages} (${canvas.width}x${canvas.height})`;

  } catch (error) {
    console.error('Error rendering page:', error);
    debugEl.textContent = `Render error: ${error}`;
    debugEl.style.background = '#f00';
  }
}

/**
 * Handle tool result from server
 */
app.ontoolresult = async (result) => {
  console.log('Received PDF data:', result);
  debugEl.textContent = 'Received tool result!';

  // Check if structuredContent exists
  if (!result.structuredContent) {
    debugEl.textContent = 'ERROR: No structuredContent in result!';
    debugEl.style.background = '#f00';
    debugEl.style.color = '#fff';
    console.error('Missing structuredContent in result');
    return;
  }

  try {
    // Extract data from structured content
    const { pdfDataUrl, filename, sizeKB, template } = result.structuredContent as {
      pdfDataUrl: string;
      filename: string;
      sizeKB: string;
      template: string;
    };

    debugEl.textContent = `Processing: ${filename}`;

    // Validate required fields
    if (!pdfDataUrl || !filename) {
      console.error('Missing required PDF data');
      debugEl.textContent = 'ERROR: Missing PDF data!';
      debugEl.style.background = '#f00';
      debugEl.style.color = '#fff';
      return;
    }

    // Store filename for download
    currentFilename = filename;

    // Convert data URL to Uint8Array
    const pdfBytes = dataURLToUint8Array(pdfDataUrl);

    // Create Blob for download
    currentPdfBlob = new Blob([pdfBytes as any], { type: 'application/pdf' });

    // Load PDF with PDF.js
    pdfDocument = await pdfjsLib.getDocument({ data: pdfBytes }).promise;
    totalPages = pdfDocument.numPages;

    console.log(`PDF loaded: ${totalPages} pages`);

    // Update info displays
    filenameDisplay.textContent = filename;
    sizeDisplay.textContent = `${sizeKB} KB`;
    templateDisplay.textContent = template;

    // Show PDF viewer and hide loading
    loading.classList.add('hidden');
    canvasContainer.classList.remove('hidden');
    infoBar.classList.remove('hidden');

    // Ensure canvas is visible
    canvasContainer.style.display = 'flex';
    canvas.style.display = 'block';

    // Show link immediately
    linkInput.value = URL.createObjectURL(currentPdfBlob);
    linkContainer.classList.remove('hidden');

    // Render first page
    currentPage = 1;
    await renderPage();

    // Debug: Success
    debugEl.textContent = `PDF ready! ${totalPages} page(s)`;
    debugEl.style.background = '#0a0';
    debugEl.style.color = '#fff';

  } catch (error) {
    console.error('Error processing PDF:', error);
    debugEl.textContent = `ERROR: ${error}`;
    debugEl.style.background = '#f00';
    debugEl.style.color = '#fff';
  }
};

/**
 * Download button handler - uses Blob
 */
/**
 * Previous page button
 */
prevPageBtn.onclick = async () => {
  if (currentPage > 1) {
    currentPage--;
    await renderPage();
  }
};

/**
 * Next page button
 */
nextPageBtn.onclick = async () => {
  if (currentPage < totalPages) {
    currentPage++;
    await renderPage();
  }
};

console.log('PDF Generator widget initialized with PDF.js');
