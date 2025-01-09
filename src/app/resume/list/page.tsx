import * as React from "react"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ResumePreview } from "@/components/resume-renderer"
import { UploadResume } from "@/components/upload-resume"

export default async function ResumeListPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const resumes = await prisma.resume.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      updatedAt: "desc",
    },
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Resumes</h1>
        <Link
          href="/resume/create"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          Create New Resume
        </Link>
      </div>

      {resumes.length === 0 ? (
        <UploadResume />
      ) : (
        <div className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                className="group relative rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="aspect-[3/4] w-full overflow-hidden rounded-md bg-gray-100">
                  <div className="h-full w-full">
                    <ResumePreview
                      data={resume.content}
                      templateId={resume.templateId}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="font-semibold text-gray-900">{resume.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Last updated:{" "}
                    {new Date(resume.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="mt-4 flex space-x-3">
                  <Link
                    href={`/resume/${resume.id}`}
                    className="rounded-md bg-white px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
                  >
                    View
                  </Link>
                  <Link
                    href={`/resume/${resume.id}/edit`}
                    className="rounded-md bg-white px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={async () => {
                      await fetch(`/api/resume/${resume.id}`, {
                        method: "DELETE",
                      })
                      window.location.reload()
                    }}
                    className="rounded-md bg-white px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <h2 className="mb-4 text-xl font-semibold">Upload a Resume</h2>
            <UploadResume />
          </div>
        </div>
      )}
    </div>
  )
} 