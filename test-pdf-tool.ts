/**
 * Quick test to verify PDF generator tool works
 */

import { createServer } from './apps/pdf-generator/server.js';

async function testPDFTool() {
  console.log('Creating PDF Generator server...');
  const server = createServer();

  console.log('\nServer created successfully!');
  console.log('Server name:', (server as any).serverInfo?.name);

  // Try to simulate calling the generate_pdf tool
  console.log('\nAttempting to generate a test PDF...');

  try {
    // Import the generatePDF function directly
    const { generatePDF } = await import('./infrastructure/server/utils/pdf-utils.js');

    const pdfBuffer = await generatePDF('simple', {
      title: 'Test Document',
      content: 'This is a test to verify the PDF generation works'
    });

    console.log('✅ PDF generated successfully!');
    console.log('   Size:', pdfBuffer.length, 'bytes');
    console.log('   Size in KB:', (pdfBuffer.length / 1024).toFixed(2), 'KB');

    // Verify it's a valid PDF
    const header = pdfBuffer.toString('utf8', 0, 4);
    console.log('   PDF header:', header);

    if (header === '%PDF') {
      console.log('✅ Valid PDF format confirmed');
    } else {
      console.log('❌ Invalid PDF format!');
    }

  } catch (error) {
    console.error('❌ Error generating PDF:', error);
  }
}

testPDFTool().catch(console.error);
