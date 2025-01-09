import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { generatePDF } from "@/lib/pdf"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { id } = body

    const resume = await prisma.resume.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!resume) {
      return NextResponse.json(
        { message: "Resume not found" },
        { status: 404 }
      )
    }

    const pdf = await generatePDF({
      title: resume.title,
      content: resume.content,
      templateId: resume.templateId,
    })

    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${resume.title}.pdf"`,
      },
    })
  } catch (error) {
    console.error("PDF generation error:", error)
    return NextResponse.json(
      { message: "Failed to generate PDF" },
      { status: 500 }
    )
  }
} 