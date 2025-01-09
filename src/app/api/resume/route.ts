import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

const createResumeSchema = z.object({
  title: z.string(),
  content: z.object({
    personal: z.object({
      fullName: z.string(),
      email: z.string().email(),
      phone: z.string(),
      location: z.string(),
      summary: z.string(),
    }),
    education: z.array(
      z.object({
        school: z.string(),
        degree: z.string(),
        field: z.string(),
        startDate: z.string(),
        endDate: z.string().optional(),
      })
    ),
    experience: z.array(
      z.object({
        company: z.string(),
        position: z.string(),
        location: z.string(),
        startDate: z.string(),
        endDate: z.string().optional(),
        description: z.string(),
      })
    ),
    skills: z.array(z.string()),
  }),
  templateId: z.string(),
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const resumes = await prisma.resume.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        id: true,
        title: true,
        updatedAt: true,
        templateId: true,
      },
    })

    return NextResponse.json({ data: resumes })
  } catch (error) {
    console.error("Resume fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch resumes" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { title, content, templateId } = createResumeSchema.parse(body)

    const resume = await prisma.resume.create({
      data: {
        title,
        content,
        templateId,
        userId: session.user.id,
      },
      select: {
        id: true,
        title: true,
        updatedAt: true,
        templateId: true,
      },
    })

    return NextResponse.json({ data: resume })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 422 }
      )
    }

    console.error("Resume creation error:", error)
    return NextResponse.json(
      { error: "Failed to create resume" },
      { status: 500 }
    )
  }
} 