type MinimalTemplateProps = {
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

export function MinimalTemplate({ content }: MinimalTemplateProps) {
  const { personal, education, experience, skills } = content;

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-light mb-2">{personal.fullName}</h1>
        <div className="text-gray-600 text-sm space-y-1">
          <div>{personal.email}</div>
          <div>{personal.phone}</div>
          <div>{personal.location}</div>
        </div>
      </header>

      {/* Summary */}
      <section className="mb-8">
        <h2 className="text-lg font-medium border-b pb-1 mb-3">About</h2>
        <p className="text-gray-700 leading-relaxed">{personal.summary}</p>
      </section>

      {/* Experience */}
      <section className="mb-8">
        <h2 className="text-lg font-medium border-b pb-1 mb-4">Experience</h2>
        <div className="space-y-6">
          {experience.map((exp, index) => (
            <div key={index}>
              <div className="flex justify-between items-baseline">
                <h3 className="font-medium">{exp.position}</h3>
                <span className="text-sm text-gray-500">
                  {exp.startDate} - {exp.endDate || 'Present'}
                </span>
              </div>
              <div className="text-gray-600 text-sm">{exp.company} • {exp.location}</div>
              <p className="mt-2 text-gray-700 text-sm leading-relaxed">{exp.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Education */}
      <section className="mb-8">
        <h2 className="text-lg font-medium border-b pb-1 mb-4">Education</h2>
        <div className="space-y-4">
          {education.map((edu, index) => (
            <div key={index}>
              <div className="flex justify-between items-baseline">
                <h3 className="font-medium">{edu.degree} in {edu.field}</h3>
                <span className="text-sm text-gray-500">
                  {edu.startDate} - {edu.endDate || 'Present'}
                </span>
              </div>
              <div className="text-gray-600 text-sm">{edu.school}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section>
        <h2 className="text-lg font-medium border-b pb-1 mb-3">Skills</h2>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-700">
          {skills.map((skill, index) => (
            <span key={index}>{skill}</span>
          ))}
        </div>
      </section>
    </div>
  );
} 