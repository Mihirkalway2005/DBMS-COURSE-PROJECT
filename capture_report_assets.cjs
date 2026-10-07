const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

if (!fs.existsSync('report_assets')) {
  fs.mkdirSync('report_assets');
}

async function capture() {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--allow-file-access-from-files"]
  });

  // 1. Capture ER Diagram from Presentation 2
  console.log("Capturing ER Diagram from presentation...");
  const page1 = await browser.newPage();
  await page1.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });
  await page1.goto("file://" + path.resolve("presentation2/presentation_part2_slides_5-9.html"), { waitUntil: "networkidle0" });
  await page1.addStyleTag({
    content: `
      div[style*="bottom: 24px"], div[style*="bottom:24px"],
      div[style*="top: 18px"], div[style*="top:18px"] { display: none !important; }
    `
  });
  await new Promise(r => setTimeout(r, 1200));
  await page1.screenshot({ path: "report_assets/er_diagram.png" });
  console.log("✓ Saved report_assets/er_diagram.png");
  await page1.close();

  // 2. Capture Web App Screens from http://localhost:3333
  console.log("Capturing Live Web App screens...");
  const page2 = await browser.newPage();
  await page2.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page2.goto("http://localhost:3333", { waitUntil: "networkidle0" });
  await new Promise(r => setTimeout(r, 1500));

  // Dashboard screenshot
  await page2.screenshot({ path: "report_assets/fig1_dashboard.png" });
  console.log("✓ Saved report_assets/fig1_dashboard.png");

  // Click on Licenses tab
  const tabs = await page2.$$("nav button, header button, div button");
  console.log(`Found ${tabs.length} buttons on page`);

  // Let's find tabs by text
  await page2.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const licBtn = buttons.find(b => b.textContent.includes("Licenses") || b.textContent.includes("Inventory"));
    if (licBtn) licBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));
  await page2.screenshot({ path: "report_assets/fig2_licenses.png" });
  console.log("✓ Saved report_assets/fig2_licenses.png");

  // Click on Allocations tab
  await page2.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const allocBtn = buttons.find(b => b.textContent.includes("Allocation"));
    if (allocBtn) allocBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));
  await page2.screenshot({ path: "report_assets/fig3_allocations.png" });
  console.log("✓ Saved report_assets/fig3_allocations.png");

  // Click on Compliance tab
  await page2.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const compBtn = buttons.find(b => b.textContent.includes("Compliance") || b.textContent.includes("Audit"));
    if (compBtn) compBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));
  await page2.screenshot({ path: "report_assets/fig4_compliance.png" });
  console.log("✓ Saved report_assets/fig4_compliance.png");

  await page2.close();
  await browser.close();
  console.log("All report assets captured successfully!");
}

capture().catch(err => {
  console.error("Capture failed:", err);
  process.exit(1);
});
