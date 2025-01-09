'use client';

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { ResumeRenderer } from "@/components/resume-renderer"
import { OptimizeResume } from "@/components/optimize-resume"

interface ResumeViewPageProps {
  params: Promise<{
    id: string
  }>
}

export default function ResumeViewPage({ params }: ResumeViewPageProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [resume, setResume] = React.useState<any>(null)
  const resolvedParams = React.use(params)

  React.useEffect(() => {
    if (!session) {
      router.push("/login")
      return
    }

    const fetchResume = async () => {
      try {
        const response = await fetch(`/api/resume?id=${resolvedParams.id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch resume")
        }
        const data = await response.json()
        setResume(data)
      } catch (error) {
        console.error("Error fetching resume:", error)
        router.push("/resume/list")
      }
    }

    fetchResume()
  }, [resolvedParams.id, router, session])

  if (!resume) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-medium">Loading resume...</h2>
          <p className="mt-2 text-sm text-gray-500">Please wait</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{resume.title}</h1>
            <p className="mt-1 text-sm text-gray-500">
              Last updated: {new Date(resume.updatedAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex space-x-4">
            <Link
              href={`/resume/${resume.id}/edit`}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              Edit Resume
            </Link>
            <Button
              onClick={async () => {
                const response = await fetch("/api/resume/export", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ id: resume.id }),
                })

                if (response.ok) {
                  const blob = await response.blob()
                  const url = window.URL.createObjectURL(blob)
                  const a = document.createElement("a")
                  a.href = url
                  a.download = `${resume.title}.pdf`
                  document.body.appendChild(a)
                  a.click()
                  window.URL.revokeObjectURL(url)
                  document.body.removeChild(a)
                }
              }}
              variant="outline"
            >
              Download PDF
            </Button>
          </div>
        </div>

        <div className="mt-6">
          <OptimizeResume
            resumeId={resume.id}
            content={resume.content}
            onOptimize={(optimizedContent) => {
              setResume({ ...resume, content: optimizedContent })
            }}
          />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
        <div className="rounded-lg border bg-white p-8 shadow-sm">
          <ResumeRenderer data={resume.content} templateId={resume.templateId} />
        </div>
        <div className="space-y-6">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-medium">Download Options</h2>
            <div className="mt-4 space-y-3">
              <Button
                onClick={async () => {
                  const response = await fetch("/api/resume/export", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ id: resume.id }),
                  })

                  if (response.ok) {
                    const blob = await response.blob()
                    const url = window.URL.createObjectURL(blob)
                    const a = document.createElement("a")
                    a.href = url
                    a.download = `${resume.title}.pdf`
                    document.body.appendChild(a)
                    a.click()
                    window.URL.revokeObjectURL(url)
                    document.body.removeChild(a)
                  }
                }}
                className="w-full"
                variant="outline"
              >
                Download as PDF
              </Button>
              <Button
                onClick={async () => {
                  // TODO: Implement DOC export
                  alert("DOC export coming soon!")
                }}
                className="w-full"
                variant="outline"
              >
                Download as DOC
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 