import * as React from "react"
import { FormData } from "@/types/resume"

interface ModernTemplateProps {
  data: FormData
}

export function ModernTemplate({ data }: ModernTemplateProps) {
  return (
    <div className="mx-auto max-w-4xl bg-white p-8 shadow-lg">
      {/* Header */}
      <header className="border-b border-gray-200 pb-6">
        <h1 className="text-4xl font-bold text-gray-900">{data.personal.fullName}</h1>
        <div className="mt-2 flex flex-wrap gap-4 text-gray-600">
          <span>{data.personal.email}</span>
          <span>•</span>
          <span>{data.personal.phone}</span>
          <span>•</span>
          <span>{data.personal.location}</span>
        </div>
        <p className="mt-4 text-gray-700">{data.personal.summary}</p>
      </header>

      {/* Experience */}
      <section className="mt-8">
        <h2 className="mb-4 text-2xl font-semibold text-gray-900">Experience</h2>
        <div className="space-y-6">
          {data.experience.map((exp, index) => (
            <div key={index}>
              <div className="flex justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{exp.position}</h3>
                  <p className="text-gray-700">{exp.company}</p>
                </div>
                <div className="text-right text-gray-600">
                  <p>{exp.location}</p>
                  <p>
                    {exp.startDate} - {exp.endDate || "Present"}
                  </p>
                </div>
              </div>
              <p className="mt-2 text-gray-700">{exp.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Education */}
      <section className="mt-8">
        <h2 className="mb-4 text-2xl font-semibold text-gray-900">Education</h2>
        <div className="space-y-4">
          {data.education.map((edu, index) => (
            <div key={index}>
              <div className="flex justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{edu.school}</h3>
                  <p className="text-gray-700">
                    {edu.degree} in {edu.field}
                  </p>
                </div>
                <div className="text-right text-gray-600">
                  <p>
                    {edu.startDate} - {edu.endDate || "Present"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section className="mt-8">
        <h2 className="mb-4 text-2xl font-semibold text-gray-900">Skills</h2>
        <div className="flex flex-wrap gap-2">
          {data.skills.map((skill, index) => (
            <span
              key={index}
              className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
            >
              {skill}
            </span>
          ))}
        </div>
      </section>
    </div>
  )
} 