import * as React from "react"
import { FormData } from "@/types/resume"

interface ClassicTemplateProps {
  data: FormData
}

export function ClassicTemplate({ data }: ClassicTemplateProps) {
  return (
    <div className="mx-auto max-w-4xl bg-white p-8 shadow-lg">
      {/* Header */}
      <header className="text-center">
        <h1 className="text-4xl font-bold uppercase tracking-wide text-gray-900">
          {data.personal.fullName}
        </h1>
        <div className="mt-4 text-gray-600">
          <p>{data.personal.email} | {data.personal.phone}</p>
          <p>{data.personal.location}</p>
        </div>
      </header>

      {/* Summary */}
      <section className="mt-8 border-b border-gray-300 pb-6">
        <h2 className="mb-4 border-b-2 border-gray-900 text-xl font-bold uppercase">
          Professional Summary
        </h2>
        <p className="text-gray-700">{data.personal.summary}</p>
      </section>

      {/* Experience */}
      <section className="mt-6 border-b border-gray-300 pb-6">
        <h2 className="mb-4 border-b-2 border-gray-900 text-xl font-bold uppercase">
          Professional Experience
        </h2>
        <div className="space-y-6">
          {data.experience.map((exp, index) => (
            <div key={index}>
              <div className="mb-2">
                <h3 className="font-bold text-gray-900">{exp.position}</h3>
                <p className="text-gray-700">
                  {exp.company}, {exp.location}
                </p>
                <p className="text-sm text-gray-600">
                  {exp.startDate} - {exp.endDate || "Present"}
                </p>
              </div>
              <p className="text-gray-700">{exp.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Education */}
      <section className="mt-6 border-b border-gray-300 pb-6">
        <h2 className="mb-4 border-b-2 border-gray-900 text-xl font-bold uppercase">
          Education
        </h2>
        <div className="space-y-4">
          {data.education.map((edu, index) => (
            <div key={index}>
              <h3 className="font-bold text-gray-900">{edu.school}</h3>
              <p className="text-gray-700">
                {edu.degree} in {edu.field}
              </p>
              <p className="text-sm text-gray-600">
                {edu.startDate} - {edu.endDate || "Present"}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section className="mt-6">
        <h2 className="mb-4 border-b-2 border-gray-900 text-xl font-bold uppercase">
          Skills
        </h2>
        <div className="flex flex-wrap gap-x-8 gap-y-2">
          {data.skills.map((skill, index) => (
            <span key={index} className="text-gray-700">
              • {skill}
            </span>
          ))}
        </div>
      </section>
    </div>
  )
} 