"use client"

import * as React from "react"
import Image from "next/image"
import { templates, TemplateId } from "@/lib/templates/types"

interface TemplateSelectorProps {
  selectedTemplate: TemplateId
  onSelect: (templateId: TemplateId) => void
}

export function TemplateSelector({
  selectedTemplate,
  onSelect,
}: TemplateSelectorProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {templates.map((template) => (
        <div
          key={template.id}
          className={`cursor-pointer rounded-lg border p-4 transition-all hover:shadow-md ${
            selectedTemplate === template.id
              ? "border-indigo-600 bg-indigo-50"
              : "border-gray-200"
          }`}
          onClick={() => onSelect(template.id)}
        >
          <div className="aspect-[3/4] w-full overflow-hidden rounded-md bg-gray-100">
            <Image
              src={template.thumbnail}
              alt={template.name}
              width={300}
              height={400}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="mt-4">
            <h3 className="font-semibold text-gray-900">{template.name}</h3>
            <p className="mt-1 text-sm text-gray-600">{template.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
} 