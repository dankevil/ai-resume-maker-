import puppeteer from "puppeteer"
import { FormData } from "@/types/resume"
import { TemplateId } from "@/lib/templates/types"

interface GeneratePDFOptions {
  title: string
  content: FormData
  templateId: TemplateId
}

export async function generatePDF({ title, content, templateId }: GeneratePDFOptions): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: "new",
  })
  const page = await browser.newPage()

  // Set viewport to A4 size
  await page.setViewport({
    width: 794, // A4 width in pixels at 96 DPI
    height: 1123, // A4 height in pixels at 96 DPI
    deviceScaleFactor: 2,
  })

  // Generate HTML content
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          body {
            font-family: 'Inter', sans-serif;
            margin: 0;
            padding: 40px;
            box-sizing: border-box;
          }

          * {
            box-sizing: border-box;
          }

          .page {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
          }

          .header {
            margin-bottom: 2rem;
          }

          .header h1 {
            margin: 0 0 0.5rem;
            font-size: 2rem;
            color: #111827;
          }

          .contact-info {
            display: flex;
            gap: 1rem;
            color: #4B5563;
            font-size: 0.875rem;
          }

          .section {
            margin-bottom: 2rem;
          }

          .section-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: #111827;
            margin: 0 0 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid #E5E7EB;
          }

          .experience-item, .education-item {
            margin-bottom: 1.5rem;
          }

          .item-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.5rem;
          }

          .item-title {
            font-weight: 600;
            color: #111827;
          }

          .item-subtitle {
            color: #4B5563;
          }

          .item-date {
            color: #6B7280;
            font-size: 0.875rem;
          }

          .item-description {
            color: #4B5563;
            font-size: 0.875rem;
            line-height: 1.5;
          }

          .skills {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
          }

          .skill {
            background-color: #F3F4F6;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.875rem;
            color: #374151;
          }
        </style>
      </head>
      <body>
        <div class="page">
          <header class="header">
            <h1>${content.personal.fullName}</h1>
            <div class="contact-info">
              <span>${content.personal.email}</span>
              <span>•</span>
              <span>${content.personal.phone}</span>
              <span>•</span>
              <span>${content.personal.location}</span>
            </div>
            <p class="item-description">${content.personal.summary}</p>
          </header>

          <section class="section">
            <h2 class="section-title">Experience</h2>
            ${content.experience.map(exp => `
              <div class="experience-item">
                <div class="item-header">
                  <div>
                    <div class="item-title">${exp.position}</div>
                    <div class="item-subtitle">${exp.company} - ${exp.location}</div>
                  </div>
                  <div class="item-date">
                    ${exp.startDate} - ${exp.endDate || 'Present'}
                  </div>
                </div>
                <p class="item-description">${exp.description}</p>
              </div>
            `).join('')}
          </section>

          <section class="section">
            <h2 class="section-title">Education</h2>
            ${content.education.map(edu => `
              <div class="education-item">
                <div class="item-header">
                  <div>
                    <div class="item-title">${edu.school}</div>
                    <div class="item-subtitle">${edu.degree} in ${edu.field}</div>
                  </div>
                  <div class="item-date">
                    ${edu.startDate} - ${edu.endDate || 'Present'}
                  </div>
                </div>
              </div>
            `).join('')}
          </section>

          <section class="section">
            <h2 class="section-title">Skills</h2>
            <div class="skills">
              ${content.skills.map(skill => `
                <span class="skill">${skill}</span>
              `).join('')}
            </div>
          </section>
        </div>
      </body>
    </html>
  `

  // Set content and wait for render
  await page.setContent(html, {
    waitUntil: "networkidle0",
  })

  // Generate PDF
  const pdf = await page.pdf({
    format: "a4",
    printBackground: true,
    margin: {
      top: "40px",
      right: "40px",
      bottom: "40px",
      left: "40px",
    },
  })

  await browser.close()

  return pdf
} 