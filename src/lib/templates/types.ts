import { FormData } from "@/types/resume"

export type TemplateId = "modern" | "classic" | "minimal"

export interface Template {
  id: TemplateId
  name: string
  description: string
  thumbnail: string
}

export const templates: Template[] = [
  {
    id: "modern",
    name: "Modern",
    description: "A clean and contemporary design with a focus on readability",
    thumbnail: "/templates/modern.png",
  },
  {
    id: "classic",
    name: "Classic",
    description: "Traditional and professional layout suitable for all industries",
    thumbnail: "/templates/classic.png",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Simple and elegant design that lets your content stand out",
    thumbnail: "/templates/minimal.png",
  },
] 