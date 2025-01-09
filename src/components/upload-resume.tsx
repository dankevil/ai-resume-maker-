"use client"

import * as React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { createWorker } from "tesseract.js"
import toast from "react-hot-toast"
import { FormData } from "@/types/resume"

export function UploadResume() {
  const router = useRouter()
  const { data: session } = useSession()
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)

  const processFile = async (file: File) => {
    try {
      setIsProcessing(true)
      setProgress(0)

      // Initialize Tesseract worker
      const worker = await createWorker({
        logger: (m) => {
          if (m.status === "recognizing text") {
            setProgress(Math.round(m.progress * 100))
          }
        },
      })

      // Load language and recognize text
      await worker.loadLanguage("eng")
      await worker.initialize("eng")
      const { data: { text } } = await worker.recognize(file)
      await worker.terminate()

      // Extract information from the OCR text
      const extractedData = extractResumeData(text)

      // Create resume in database
      const response = await fetch("/api/resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: file.name.replace(/\.[^/.]+$/, ""),
          content: extractedData,
          templateId: "modern",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create resume")
      }

      const resume = await response.json()
      router.push(`/resume/${resume.id}/edit`)
      toast.success("Resume uploaded successfully")
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Failed to process resume")
    } finally {
      setIsProcessing(false)
      setProgress(0)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file type
    const validTypes = ["application/pdf", "image/jpeg", "image/png"]
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a PDF or image file")
      return
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size should be less than 10MB")
      return
    }

    await processFile(file)
  }

  if (!session) {
    return null
  }

  return (
    <div className="rounded-lg border-2 border-dashed border-gray-300 p-12">
      <div className="text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        <div className="mt-4">
          <label
            htmlFor="file-upload"
            className="relative cursor-pointer rounded-md font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500"
          >
            <span>Upload a resume</span>
            <input
              id="file-upload"
              name="file-upload"
              type="file"
              className="sr-only"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              disabled={isProcessing}
            />
          </label>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          PDF or image up to 10MB
        </p>
      </div>

      {isProcessing && (
        <div className="mt-4">
          <div className="relative pt-1">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block text-indigo-600">
                  Processing Resume
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-indigo-600">
                  {progress}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 text-xs flex rounded bg-indigo-200">
              <div
                style={{ width: `${progress}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500 transition-all duration-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function extractResumeData(text: string): FormData {
  // Split text into sections
  const sections = text.split(/\n{2,}/)

  // Initialize resume data
  const resumeData: FormData = {
    personal: {
      fullName: "",
      email: "",
      phone: "",
      location: "",
      summary: "",
    },
    education: [],
    experience: [],
    skills: [],
  }

  // Extract email
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)
  if (emailMatch) {
    resumeData.personal.email = emailMatch[0]
  }

  // Extract phone
  const phoneMatch = text.match(/(\+\d{1,3}[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}/)
  if (phoneMatch) {
    resumeData.personal.phone = phoneMatch[0]
  }

  // Extract name (usually at the beginning)
  if (sections[0]) {
    const possibleName = sections[0].split("\n")[0].trim()
    if (possibleName && !possibleName.includes("@") && !possibleName.match(/\d/)) {
      resumeData.personal.fullName = possibleName
    }
  }

  // Extract location (look for city, state format)
  const locationMatch = text.match(/[A-Z][a-zA-Z\s]+,\s*[A-Z]{2}/)
  if (locationMatch) {
    resumeData.personal.location = locationMatch[0]
  }

  // Extract experience
  const experienceSection = findSection(text, ["experience", "work", "employment"])
  if (experienceSection) {
    const experiences = experienceSection.split(/\n{2,}/).slice(1)
    experiences.forEach((exp) => {
      const lines = exp.split("\n")
      if (lines.length >= 2) {
        resumeData.experience.push({
          company: lines[0].trim(),
          position: lines[1].trim(),
          location: "",
          startDate: "",
          endDate: "",
          description: lines.slice(2).join("\n").trim(),
        })
      }
    })
  }

  // Extract education
  const educationSection = findSection(text, ["education", "academic"])
  if (educationSection) {
    const educations = educationSection.split(/\n{2,}/).slice(1)
    educations.forEach((edu) => {
      const lines = edu.split("\n")
      if (lines.length >= 2) {
        resumeData.education.push({
          school: lines[0].trim(),
          degree: lines[1].trim(),
          field: "",
          startDate: "",
          endDate: "",
        })
      }
    })
  }

  // Extract skills
  const skillsSection = findSection(text, ["skills", "technologies", "competencies"])
  if (skillsSection) {
    const skillsList = skillsSection
      .replace(/skills:?/i, "")
      .split(/[,\n]/)
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0)
    resumeData.skills = skillsList
  }

  return resumeData
}

function findSection(text: string, keywords: string[]): string | null {
  const lines = text.split("\n")
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase()
    if (keywords.some((keyword) => line.includes(keyword))) {
      return lines.slice(i).join("\n")
    }
  }
  return null
} 