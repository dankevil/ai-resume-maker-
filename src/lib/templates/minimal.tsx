import * as React from "react"
import { FormData } from "@/types/resume"

interface MinimalTemplateProps {
  data: FormData
}

export function MinimalTemplate({ data }: MinimalTemplateProps) {
  return (
    <div className="mx-auto max-w-4xl bg-white p-8 shadow-lg">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-light text-gray-900">
          {data.personal.fullName}
        </h1>
        <div className="mt-2 text-sm text-gray-600">
          <p>{data.personal.email}</p>
          <p>{data.personal.phone}</p>
          <p>{data.personal.location}</p>
        </div>
      </header>

      {/* Summary */}
      <section className="mt-8">
        <p className="text-gray-700">{data.personal.summary}</p>
      </section>

      {/* Experience */}
      <section className="mt-8">
        <h2 className="mb-4 text-lg font-medium text-gray-900">Experience</h2>
        <div className="space-y-6">
          {data.experience.map((exp, index) => (
            <div key={index} className="grid grid-cols-[1fr,2fr] gap-4">
              <div className="text-sm text-gray-600">
                <p>{exp.startDate} -</p>
                <p>{exp.endDate || "Present"}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{exp.position}</h3>
                <p className="text-sm text-gray-700">
                  {exp.company}, {exp.location}
                </p>
                <p className="mt-2 text-gray-700">{exp.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Education */}
      <section className="mt-8">
        <h2 className="mb-4 text-lg font-medium text-gray-900">Education</h2>
        <div className="space-y-4">
          {data.education.map((edu, index) => (
            <div key={index} className="grid grid-cols-[1fr,2fr] gap-4">
              <div className="text-sm text-gray-600">
                <p>{edu.startDate} -</p>
                <p>{edu.endDate || "Present"}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{edu.school}</h3>
                <p className="text-sm text-gray-700">
                  {edu.degree} in {edu.field}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section className="mt-8">
        <h2 className="mb-4 text-lg font-medium text-gray-900">Skills</h2>
        <div className="flex flex-wrap gap-1">
          {data.skills.map((skill, index) => (
            <span
              key={index}
              className="rounded-sm bg-gray-50 px-2 py-1 text-sm text-gray-700"
            >
              {skill}
            </span>
          ))}
        </div>
      </section>
    </div>
  )
} 