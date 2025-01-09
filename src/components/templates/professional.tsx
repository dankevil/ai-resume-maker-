type ProfessionalTemplateProps = {
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

export function ProfessionalTemplate({ content }: ProfessionalTemplateProps) {
  const { personal, education, experience, skills } = content;

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white">
      {/* Header */}
      <header className="border-b-2 border-gray-300 pb-4 mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">{personal.fullName}</h1>
        <div className="flex items-center gap-4 text-gray-600">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>{personal.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>{personal.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{personal.location}</span>
          </div>
        </div>
      </header>

      {/* Summary */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Professional Summary</h2>
        <p className="text-gray-700 leading-relaxed">{personal.summary}</p>
      </section>

      {/* Experience */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Professional Experience</h2>
        <div className="space-y-6">
          {experience.map((exp, index) => (
            <div key={index} className="border-l-2 border-gray-200 pl-4">
              <div className="flex justify-between items-baseline">
                <h3 className="text-xl font-semibold text-gray-800">{exp.position}</h3>
                <span className="text-gray-600">
                  {exp.startDate} - {exp.endDate || 'Present'}
                </span>
              </div>
              <div className="text-gray-700 font-medium">{exp.company} • {exp.location}</div>
              <p className="mt-2 text-gray-600 leading-relaxed">{exp.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Education */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Education</h2>
        <div className="space-y-4">
          {education.map((edu, index) => (
            <div key={index} className="border-l-2 border-gray-200 pl-4">
              <div className="flex justify-between items-baseline">
                <h3 className="text-xl font-semibold text-gray-800">{edu.degree} in {edu.field}</h3>
                <span className="text-gray-600">
                  {edu.startDate} - {edu.endDate || 'Present'}
                </span>
              </div>
              <div className="text-gray-700 font-medium">{edu.school}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Skills</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {skills.map((skill, index) => (
            <div
              key={index}
              className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-700"
            >
              {skill}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
} 