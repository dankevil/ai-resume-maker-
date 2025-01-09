"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PersonalInfo, Education, Experience } from '@/types/resume';
import { TemplateSelector } from '@/components/template-selector';
import { ResumePreview } from '@/components/resume-renderer';
import { TemplateId } from '@/lib/templates/types';
import { OptimizeButton } from '@/components/optimize-button';

const INITIAL_PERSONAL_INFO: PersonalInfo = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  location: '',
};

const INITIAL_EDUCATION: Education = {
  id: '',
  school: '',
  degree: '',
  field: '',
  startDate: '',
  endDate: '',
  location: '',
};

const INITIAL_EXPERIENCE: Experience = {
  id: '',
  company: '',
  position: '',
  startDate: '',
  endDate: '',
  location: '',
  description: '',
  highlights: [],
};

export default function CreateResumePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>(INITIAL_PERSONAL_INFO);
  const [education, setEducation] = useState<Education[]>([INITIAL_EDUCATION]);
  const [experience, setExperience] = useState<Experience[]>([INITIAL_EXPERIENCE]);
  const [skills, setSkills] = useState<string[]>([]);
  const [summary, setSummary] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('modern');

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `${personalInfo.firstName} ${personalInfo.lastName}'s Resume`,
          content: {
            personal: {
              ...personalInfo,
              fullName: `${personalInfo.firstName} ${personalInfo.lastName}`,
              summary
            },
            education,
            experience,
            skills
          },
          templateId: selectedTemplate,
        }),
      });

      if (!response.ok) throw new Error('Failed to create resume');

      const resume = await response.json();
      router.push(`/resume/${resume.id}`);
    } catch (error) {
      console.error('Error creating resume:', error);
    }
  };

  const handleOptimized = (optimizedContent: any) => {
    const { personal, education: newEducation, experience: newExperience, skills: newSkills } = optimizedContent;
    
    setPersonalInfo({
      firstName: personal.firstName,
      lastName: personal.lastName,
      email: personal.email,
      phone: personal.phone,
      location: personal.location,
    });
    setSummary(personal.summary);
    setEducation(newEducation);
    setExperience(newExperience);
    setSkills(newSkills);
  };

  const getCurrentContent = () => ({
    personal: {
      ...personalInfo,
      summary,
    },
    education,
    experience,
    skills,
  });

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={personalInfo.firstName}
                  onChange={(e) =>
                    setPersonalInfo({ ...personalInfo, firstName: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={personalInfo.lastName}
                  onChange={(e) =>
                    setPersonalInfo({ ...personalInfo, lastName: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={personalInfo.email}
                onChange={(e) =>
                  setPersonalInfo({ ...personalInfo, email: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={personalInfo.phone}
                onChange={(e) =>
                  setPersonalInfo({ ...personalInfo, phone: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={personalInfo.location}
                onChange={(e) =>
                  setPersonalInfo({ ...personalInfo, location: e.target.value })
                }
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            {education.map((edu, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>Education {index + 1}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor={`school-${index}`}>School</Label>
                    <Input
                      id={`school-${index}`}
                      value={edu.school}
                      onChange={(e) => {
                        const newEducation = [...education];
                        newEducation[index] = { ...edu, school: e.target.value };
                        setEducation(newEducation);
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`degree-${index}`}>Degree</Label>
                    <Input
                      id={`degree-${index}`}
                      value={edu.degree}
                      onChange={(e) => {
                        const newEducation = [...education];
                        newEducation[index] = { ...edu, degree: e.target.value };
                        setEducation(newEducation);
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`field-${index}`}>Field of Study</Label>
                    <Input
                      id={`field-${index}`}
                      value={edu.field}
                      onChange={(e) => {
                        const newEducation = [...education];
                        newEducation[index] = { ...edu, field: e.target.value };
                        setEducation(newEducation);
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`startDate-${index}`}>Start Date</Label>
                      <Input
                        id={`startDate-${index}`}
                        type="month"
                        value={edu.startDate}
                        onChange={(e) => {
                          const newEducation = [...education];
                          newEducation[index] = { ...edu, startDate: e.target.value };
                          setEducation(newEducation);
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`endDate-${index}`}>End Date</Label>
                      <Input
                        id={`endDate-${index}`}
                        type="month"
                        value={edu.endDate}
                        onChange={(e) => {
                          const newEducation = [...education];
                          newEducation[index] = { ...edu, endDate: e.target.value };
                          setEducation(newEducation);
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor={`location-${index}`}>Location</Label>
                    <Input
                      id={`location-${index}`}
                      value={edu.location}
                      onChange={(e) => {
                        const newEducation = [...education];
                        newEducation[index] = { ...edu, location: e.target.value };
                        setEducation(newEducation);
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => setEducation([...education, INITIAL_EDUCATION])}
            >
              Add Education
            </Button>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            {experience.map((exp, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>Experience {index + 1}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor={`company-${index}`}>Company</Label>
                    <Input
                      id={`company-${index}`}
                      value={exp.company}
                      onChange={(e) => {
                        const newExperience = [...experience];
                        newExperience[index] = { ...exp, company: e.target.value };
                        setExperience(newExperience);
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`position-${index}`}>Position</Label>
                    <Input
                      id={`position-${index}`}
                      value={exp.position}
                      onChange={(e) => {
                        const newExperience = [...experience];
                        newExperience[index] = { ...exp, position: e.target.value };
                        setExperience(newExperience);
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`startDate-${index}`}>Start Date</Label>
                      <Input
                        id={`startDate-${index}`}
                        type="month"
                        value={exp.startDate}
                        onChange={(e) => {
                          const newExperience = [...experience];
                          newExperience[index] = { ...exp, startDate: e.target.value };
                          setExperience(newExperience);
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`endDate-${index}`}>End Date</Label>
                      <Input
                        id={`endDate-${index}`}
                        type="month"
                        value={exp.endDate}
                        onChange={(e) => {
                          const newExperience = [...experience];
                          newExperience[index] = { ...exp, endDate: e.target.value };
                          setExperience(newExperience);
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor={`location-${index}`}>Location</Label>
                    <Input
                      id={`location-${index}`}
                      value={exp.location}
                      onChange={(e) => {
                        const newExperience = [...experience];
                        newExperience[index] = { ...exp, location: e.target.value };
                        setExperience(newExperience);
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`description-${index}`}>Description</Label>
                    <Textarea
                      id={`description-${index}`}
                      value={exp.description}
                      onChange={(e) => {
                        const newExperience = [...experience];
                        newExperience[index] = { ...exp, description: e.target.value };
                        setExperience(newExperience);
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => setExperience([...experience, INITIAL_EXPERIENCE])}
            >
              Add Experience
            </Button>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="skills">Skills (comma-separated)</Label>
              <Input
                id="skills"
                value={skills.join(', ')}
                onChange={(e) => setSkills(e.target.value.split(',').map((s) => s.trim()))}
              />
            </div>
            <div>
              <Label htmlFor="summary">Professional Summary</Label>
              <Textarea
                id="summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="h-32"
              />
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-medium text-gray-900">
                Choose a Template
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Select a template that best suits your professional style
              </p>
            </div>
            <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
              <TemplateSelector
                selectedTemplate={selectedTemplate}
                onSelect={setSelectedTemplate}
              />
              <div className="hidden lg:block">
                <div className="sticky top-8">
                  <h3 className="mb-4 text-sm font-medium text-gray-900">
                    Preview
                  </h3>
                  <ResumePreview
                    data={{
                      personal: {
                        ...personalInfo,
                        fullName: `${personalInfo.firstName} ${personalInfo.lastName}`,
                        summary
                      },
                      education,
                      experience,
                      skills
                    }}
                    templateId={selectedTemplate}
                  />
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Create Your Resume</h1>
        <OptimizeButton 
          content={getCurrentContent()} 
          onOptimized={handleOptimized} 
        />
      </div>
      {renderStep()}
      <div className="mt-6 flex justify-between">
        {step > 1 && (
          <Button onClick={() => setStep(step - 1)}>Previous</Button>
        )}
        {step < 4 ? (
          <Button onClick={() => setStep(step + 1)}>Next</Button>
        ) : (
          <Button onClick={handleSubmit}>Save Resume</Button>
        )}
      </div>
    </div>
  );
} 