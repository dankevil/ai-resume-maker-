type ModernTemplateProps = {
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

export function ModernTemplate({ content }: ModernTemplateProps) {
  const { personal, education, experience, skills } = content;

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white">
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">{personal.fullName}</h1>
        <div className="text-gray-600 space-x-4">
          <span>{personal.email}</span>
          <span>•</span>
          <span>{personal.phone}</span>
          <span>•</span>
          <span>{personal.location}</span>
        </div>
      </header>

      {/* Summary */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-gray-800">Professional Summary</h2>
        <p className="text-gray-700">{personal.summary}</p>
      </section>

      {/* Experience */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Experience</h2>
        <div className="space-y-6">
          {experience.map((exp, index) => (
            <div key={index}>
              <h3 className="font-semibold">{exp.position}</h3>
              <div className="text-gray-600">
                {exp.company} • {exp.location}
              </div>
              <div className="text-gray-500 text-sm">
                {exp.startDate} - {exp.endDate || 'Present'}
              </div>
              <p className="mt-2 text-gray-700">{exp.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Education */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Education</h2>
        <div className="space-y-4">
          {education.map((edu, index) => (
            <div key={index}>
              <h3 className="font-semibold">{edu.degree} in {edu.field}</h3>
              <div className="text-gray-600">{edu.school}</div>
              <div className="text-gray-500 text-sm">
                {edu.startDate} - {edu.endDate || 'Present'}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section>
        <h2 className="text-xl font-semibold mb-3 text-gray-800">Skills</h2>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <span
              key={index}
              className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
            >
              {skill}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
} 