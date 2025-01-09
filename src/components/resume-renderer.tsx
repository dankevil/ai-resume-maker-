'use client';

import { ModernTemplate } from '@/components/templates/modern';
import { MinimalTemplate } from '@/components/templates/minimal';
import { ProfessionalTemplate } from '@/components/templates/professional';

const templates = {
  modern: ModernTemplate,
  minimal: MinimalTemplate,
  professional: ProfessionalTemplate,
} as const;

type ResumeRendererProps = {
  resume: {
    templateId: keyof typeof templates;
    content: {
      personal: {
        fullName: string;
        email: string;
        phone: string;
        location: string;
        summary: string;
      };
      education: Array<{
        school: string;
        degree: string;
        field: string;
        startDate: string;
        endDate?: string;
      }>;
      experience: Array<{
        company: string;
        position: string;
        location: string;
        startDate: string;
        endDate?: string;
        description: string;
      }>;
      skills: string[];
    };
  };
};

export function ResumeRenderer({ resume }: ResumeRendererProps) {
  const Template = templates[resume.templateId] || templates.modern;

  if (!Template) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">Template not found. Please select a different template.</p>
      </div>
    );
  }

  return <Template content={resume.content} />;
}

export function ResumePreview({
  data,
  templateId,
}: ResumeRendererProps) {
  return (
    <div className="overflow-hidden rounded-lg border bg-white shadow">
      <div className="relative">
        <div className="absolute inset-0 bg-gray-100/50" />
        <div className="scale-[0.4] transform-gpu">
          <ResumeRenderer data={data} templateId={templateId} />
        </div>
      </div>
    </div>
  )
} 