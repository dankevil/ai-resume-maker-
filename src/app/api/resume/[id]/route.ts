import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

// Schema for resume content validation
const ResumeContentSchema = z.object({
  personal: z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
    location: z.string().optional(),
    summary: z.string(),
  }),
  education: z.array(z.object({
    school: z.string(),
    degree: z.string(),
    field: z.string(),
    startDate: z.string(),
    endDate: z.string().optional(),
    description: z.string().optional(),
  })),
  experience: z.array(z.object({
    company: z.string(),
    position: z.string(),
    startDate: z.string(),
    endDate: z.string().optional(),
    description: z.string(),
  })),
  skills: z.array(z.string()),
})

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    // Await params before using
    const { id } = await context.params

    const body = await request.json()
    const validatedContent = ResumeContentSchema.parse(body)

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

    const updatedResume = await prisma.resume.update({
      where: {
        id,
      },
      data: {
        content: validatedContent,
      },
    })

    return NextResponse.json(updatedResume)
  } catch (error) {
    console.error("Error updating resume:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid request data", errors: error.errors },
        { status: 422 }
      )
    }
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    // Await params before using
    const { id } = await context.params

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

    await prisma.resume.delete({
      where: {
        id,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("Resume deletion error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
} 