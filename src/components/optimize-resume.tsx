"use client"

import * as React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { FormData } from "@/types/resume"
import { optimizeResume } from "@/lib/ai"

interface OptimizeResumeProps {
  resumeId: string
  content: FormData
  onOptimize: (optimizedContent: FormData) => void
}

export function OptimizeResume({ resumeId, content, onOptimize }: OptimizeResumeProps) {
  const router = useRouter()
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    jobDescription: "",
    targetRole: "",
    industry: "",
    experienceLevel: "",
  })

  const handleOptimize = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isOptimizing) {
      return
    }

    try {
      setIsOptimizing(true)
      toast.loading("Optimizing your resume...", { id: "optimize" })

      if (!content || !resumeId) {
        throw new Error("Invalid resume data")
      }

      const optimizedContent = await optimizeResume(content, {
        provider: "ollama",
        model: "llama3.2:1b",
        ...(formData.jobDescription && { jobDescription: formData.jobDescription }),
        ...(formData.targetRole && { targetRole: formData.targetRole }),
        ...(formData.industry && { industry: formData.industry }),
        ...(formData.experienceLevel && { experienceLevel: formData.experienceLevel }),
      })

      if (!optimizedContent || !optimizedContent.personal || !optimizedContent.experience) {
        throw new Error("Invalid optimization result")
      }

      const response = await fetch(`/api/resume/${resumeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: optimizedContent,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || `Failed to update resume: ${response.status}`)
      }

      onOptimize(optimizedContent)
      toast.success("Resume optimized successfully", { id: "optimize" })
      setShowForm(false)
      router.refresh()

    } catch (error) {
      console.error("Optimization error:", error)
      toast.error(
        error instanceof Error 
          ? error.message 
          : "Failed to optimize resume. Please try again.",
        { id: "optimize" }
      )
    } finally {
      setIsOptimizing(false)
    }
  }

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={() => setShowForm(!showForm)}
        className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
      >
        <svg
          className="-ml-1 mr-2 h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
        Optimize with AI
      </button>

      {showForm && (
        <form onSubmit={handleOptimize} className="mt-4 space-y-4 rounded-lg border p-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Job Description
            </label>
            <textarea
              value={formData.jobDescription}
              onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
              rows={4}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              placeholder="Paste the job description here to optimize your resume for this specific role"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Target Role
            </label>
            <input
              type="text"
              value={formData.targetRole}
              onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              placeholder="e.g., Senior Software Engineer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Industry
            </label>
            <input
              type="text"
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              placeholder="e.g., Technology, Healthcare, Finance"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Experience Level
            </label>
            <select
              value={formData.experienceLevel}
              onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
            >
              <option value="">Select level</option>
              <option value="Entry Level">Entry Level</option>
              <option value="Mid Level">Mid Level</option>
              <option value="Senior Level">Senior Level</option>
              <option value="Executive">Executive</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isOptimizing}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {isOptimizing ? "Optimizing..." : "Optimize Resume"}
            </button>
          </div>
        </form>
      )}
    </div>
  )
} 