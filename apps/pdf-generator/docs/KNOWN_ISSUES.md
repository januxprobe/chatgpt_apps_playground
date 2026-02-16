# PDF Generator - Known Issues

## Claude Desktop Issues

**Status:** Under Investigation

**Problem:** PDF generator widget does not function properly in Claude Desktop.

**Working Platforms:**
- ✅ ChatGPT (HTTP mode) - Fully functional
  - PDF renders correctly
  - Link copy workflow works
  - Page navigation works

**Not Working:**
- ❌ Claude Desktop (STDIO mode) - Issues detected
  - Needs investigation

**Workaround:**
Use ChatGPT for PDF generation until Claude Desktop issue is resolved.

**Next Steps:**
- [ ] Test with different PDF sizes
- [ ] Check STDIO transport logs
- [ ] Verify widget loading in Claude Desktop
- [ ] Compare working (echo, calculator, hospi-copilot) vs non-working apps
- [ ] Check if PDF.js CDN loading works in Claude Desktop's environment

## Working Features (ChatGPT)

- ✅ Server-side PDF generation (pdfkit)
- ✅ Multiple templates (simple, invoice)
- ✅ PDF.js canvas rendering
- ✅ Multi-page navigation
- ✅ File info display
- ✅ Link generation and copy workflow
- ✅ Sandbox-compatible UX

---

*Last Updated: 2026-02-15*
