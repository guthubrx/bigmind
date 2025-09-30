/* eslint-disable */
// Render an SVG file to a square PNG using Playwright (Chromium)
const path = require('path');
const fs = require('fs');
const { chromium } = require('@playwright/test');

async function renderSvgToPng(svgPath, outPngPath, size = 1024) {
  const absSvg = path.resolve(svgPath);
  const absOut = path.resolve(outPngPath);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: size, height: size } });

  const svgContent = fs.readFileSync(absSvg, 'utf8');
  const html = `<!doctype html><html><head><meta charset="utf-8"></head>
  <body style="margin:0;background:transparent;display:flex;align-items:center;justify-content:center;">
  <div id="wrap" style="width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;">
  ${svgContent}
  </div>
  <script>
    const svg = document.querySelector('svg');
    if (svg) {
      svg.setAttribute('width', '${size}px');
      svg.setAttribute('height', '${size}px');
      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      document.body.style.background = 'transparent';
    }
  </script>
  </body></html>`;

  await page.setContent(html, { waitUntil: 'networkidle' });
  const el = await page.$('#wrap');
  await el.screenshot({ path: absOut, type: 'png' });
  await browser.close();
  console.log('PNG generated at', absOut);
}

if (require.main === module) {
  const [,, svg, out, size] = process.argv;
  if (!svg || !out) {
    console.error('Usage: node scripts/render-icon-from-svg.js <input.svg> <output.png> [size=1024]');
    process.exit(1);
  }
  renderSvgToPng(svg, out, size ? parseInt(size, 10) : 1024).catch((e) => {
    console.error(e);
    process.exit(1);
  });
}


