import puppeteer from "puppeteer"
import { PDFDocument } from "pdf-lib"
import path from "path"
import fs from "fs"

async function assemblePdf(imageBuffers, outputPath) {
  const pdfDoc = await PDFDocument.create()
  for (const imgBuf of imageBuffers) {
    const page = pdfDoc.addPage([1920, 1080])
    const embeddedImg = await pdfDoc.embedPng(imgBuf)
    page.drawImage(embeddedImg, {
      x: 0,
      y: 0,
      width: 1920,
      height: 1080,
    })
  }
  const pdfBytes = await pdfDoc.save()
  fs.writeFileSync(outputPath, pdfBytes)
  console.log(`Saved PDF: ${outputPath} (${imageBuffers.length} slides, ${(pdfBytes.length / 1024 / 1024).toFixed(2)} MB)`)
}

async function main() {
  console.log("Starting PDF generation for presentation slides with SQL queries...")

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--allow-file-access-from-files"]
  })

  // Style to hide floating web controls during capture
  const hideOverlayCss = `
    div[style*="bottom: 24px"],
    div[style*="bottom:24px"],
    div[style*="top: 18px"],
    div[style*="top:18px"] {
      display: none !important;
    }
  `

  // ==========================================
  // 1. Process Presentation 1 (Slides 1 to 4)
  // ==========================================
  console.log("\n--- Processing Presentation 1 (Slides 1 - 4) ---")
  const page1 = await browser.newPage()
  await page1.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 })
  await page1.goto("file://" + path.resolve("presentation1/presentation_part1_slides_1-4.html"), { waitUntil: "networkidle0" })
  await page1.emulateMediaType("screen")
  await page1.addStyleTag({ content: hideOverlayCss })

  const part1Images = []
  const pillCount1 = await page1.evaluate(() => document.querySelectorAll(".nav-pill").length)
  console.log(`Found ${pillCount1} slides in Presentation 1`)

  for (let i = 0; i < pillCount1; i++) {
    await page1.evaluate((idx) => {
      const pills = document.querySelectorAll(".nav-pill")
      if (pills[idx]) pills[idx].click()
    }, i)
    await new Promise(r => setTimeout(r, 1200))
    const buf = await page1.screenshot({ type: "png" })
    part1Images.push(buf)
    console.log(`  ✓ Captured Slide ${i + 1}`)
  }
  await page1.close()

  // ==========================================
  // 2. Process Presentation 2 (Slides 5 to 13)
  // ==========================================
  console.log("\n--- Processing Presentation 2 (Slides 5 - 13 including SQL) ---")
  const page2 = await browser.newPage()
  await page2.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 })
  await page2.goto("file://" + path.resolve("presentation2/presentation_part2_slides_5-9.html"), { waitUntil: "networkidle0" })
  await page2.emulateMediaType("screen")
  await page2.addStyleTag({ content: hideOverlayCss })

  const part2Images = []
  const pillCount2 = await page2.evaluate(() => document.querySelectorAll(".nav-pill").length)
  console.log(`Found ${pillCount2} slides in Presentation 2`)

  for (let i = 0; i < pillCount2; i++) {
    await page2.evaluate((idx) => {
      const pills = document.querySelectorAll(".nav-pill")
      if (pills[idx]) pills[idx].click()
    }, i)
    await new Promise(r => setTimeout(r, 1200))
    const buf = await page2.screenshot({ type: "png" })
    part2Images.push(buf)
    console.log(`  ✓ Captured Presentation 2 Slide ${i + 1} (Overall Slide ${i + 5})`)
  }
  await page2.close()
  await browser.close()

  // ==========================================
  // 3. Assemble and Export PDF Deliverables
  // ==========================================
  console.log("\n--- Assembling PDF Deliverables ---")

  // PDF 1: Presentation 1 (Slides 1 - 4)
  await assemblePdf(part1Images, "presentation1/presentation_part1_slides_1-4.pdf")

  // PDF 2: Presentation 2 Complete (Slides 5 - 13)
  await assemblePdf(part2Images, "presentation2/presentation_part2_slides_5-13.pdf")
  await assemblePdf(part2Images, "presentation2/presentation_part2_slides_5-9.pdf")
  await assemblePdf(part2Images, "presentation2/presentation_part2_slides_5-10.pdf")

  // PDF 3: Complete Unified Presentation (Slides 1 - 13)
  const all13Images = [...part1Images, ...part2Images]
  await assemblePdf(all13Images, "Software_License_Management_Complete_Presentation.pdf")
  await assemblePdf(all13Images, "Software_License_Management_Slides_1-13.pdf")

  console.log("\n✓ All PDF files have been generated and updated successfully!")
}

main().catch(err => {
  console.error("Fatal error generating PDFs:", err)
  process.exit(1)
})
