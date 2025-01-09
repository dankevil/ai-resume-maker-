'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ResumeRenderer } from '@/components/resume-renderer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

type ResumeFormProps = {
  initialData: {
    title: string;
    content: {
      personal: {
        fullName: string;
        email: string;
        phone: string;
        location: string;
        aboutMe: string;
        summary: string;
        highlights?: string[];
        achievements?: string[];
      };
      education: Array<{
        school: string;
        degree: string;
        field: string;
        startDate: string;
        endDate?: string;
        highlights?: string[];
        achievements?: string[];
      }>;
      experience: Array<{
        company: string;
        position: string;
        location: string;
        startDate: string;
        endDate?: string;
        description: string;
        highlights?: string[];
        achievements?: string[];
        impact?: string;
      }>;
      skills: string[];
    };
    templateId: "modern" | "minimal" | "professional";
  };
  resumeId: string;
};

export function ResumeForm({ initialData, resumeId }: ResumeFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [formData, setFormData] = useState(initialData);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/resume/${resumeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update resume');
      }

      toast.success('Resume updated successfully');
      router.push(`/resume/${resumeId}/view`);
      router.refresh();
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update resume');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptimize = async () => {
    setIsOptimizing(true);
    try {
      toast.info('Optimizing your resume...');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/resume/optimize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          content: {
            ...formData.content,
            personal: {
              ...formData.content.personal,
              aboutMe: formData.content.personal.aboutMe || '',
            },
            education: formData.content.education.map(edu => ({
              ...edu,
              startDate: edu.startDate || '',
              endDate: edu.endDate || '',
            })),
            experience: formData.content.experience.map(exp => ({
              ...exp,
              startDate: exp.startDate || '',
              endDate: exp.endDate || '',
            })),
          }
        }),
      });

      const result = await response.json();
      console.log('API Response:', result);

      if (!response.ok) {
        const errorMessage = result.error || 'Failed to optimize resume';
        const errorDetails = result.details ? `\n${JSON.stringify(result.details, null, 2)}` : '';
        console.error(`API Error: ${errorMessage}${errorDetails}`);
        throw new Error(errorMessage);
      }

      if (!result.data) {
        console.error('Invalid response format:', result);
        throw new Error('Invalid response format from server');
      }

      setFormData(prev => ({
        ...prev,
        content: result.data,
      }));

      toast.success('Resume optimized successfully! Review the changes and save if you like them.');
    } catch (error) {
      console.error('Optimization error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to optimize resume. Please try again.');
    } finally {
      setIsOptimizing(false);
    }
  };

  const updatePersonal = (field: keyof typeof formData.content.personal, value: string) => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        personal: {
          ...prev.content.personal,
          [field]: value,
        },
      },
    }));
  };

  return (
    <div className="grid grid-cols-2 gap-8">
      <div>
        <Tabs defaultValue="edit" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          <TabsContent value="edit">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Personal Information</h2>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleOptimize}
                    disabled={isOptimizing}
                    className="gap-2"
                  >
                    {isOptimizing && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isOptimizing ? 'Optimizing...' : 'Optimize with AI'}
                  </Button>
                </div>
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={formData.content.personal.fullName}
                      onChange={e => updatePersonal('fullName', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.content.personal.email}
                      onChange={e => updatePersonal('email', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.content.personal.phone}
                      onChange={e => updatePersonal('phone', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.content.personal.location}
                      onChange={e => updatePersonal('location', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="summary">Professional Summary</Label>
                    <Textarea
                      id="summary"
                      value={formData.content.personal.summary}
                      onChange={e => updatePersonal('summary', e.target.value)}
                      rows={4}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="aboutMe">About Me</Label>
                    <Textarea
                      id="aboutMe"
                      value={formData.content.personal.aboutMe}
                      onChange={e => updatePersonal('aboutMe', e.target.value)}
                      rows={4}
                      required
                    />
                  </div>
                  
                  {formData.content.personal.highlights && formData.content.personal.highlights.length > 0 && (
                    <div>
                      <Label>Key Highlights</Label>
                      <ul className="list-disc pl-5 space-y-1">
                        {formData.content.personal.highlights.map((highlight, index) => (
                          <li key={index} className="text-sm">{highlight}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {formData.content.personal.achievements && formData.content.personal.achievements.length > 0 && (
                    <div>
                      <Label>Notable Achievements</Label>
                      <ul className="list-disc pl-5 space-y-1">
                        {formData.content.personal.achievements.map((achievement, index) => (
                          <li key={index} className="text-sm">{achievement}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Education Section */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Education</h2>
                {formData.content.education.map((edu, index) => (
                  <div key={index} className="space-y-4 p-4 border rounded-lg">
                    {/* Existing education fields */}
                    
                    {edu.highlights && edu.highlights.length > 0 && (
                      <div>
                        <Label>Key Highlights</Label>
                        <ul className="list-disc pl-5 space-y-1">
                          {edu.highlights.map((highlight, hIndex) => (
                            <li key={hIndex} className="text-sm">{highlight}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {edu.achievements && edu.achievements.length > 0 && (
                      <div>
                        <Label>Notable Achievements</Label>
                        <ul className="list-disc pl-5 space-y-1">
                          {edu.achievements.map((achievement, aIndex) => (
                            <li key={aIndex} className="text-sm">{achievement}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Experience Section */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Experience</h2>
                {formData.content.experience.map((exp, index) => (
                  <div key={index} className="space-y-4 p-4 border rounded-lg">
                    {/* Existing experience fields */}
                    
                    {exp.highlights && exp.highlights.length > 0 && (
                      <div>
                        <Label>Key Highlights</Label>
                        <ul className="list-disc pl-5 space-y-1">
                          {exp.highlights.map((highlight, hIndex) => (
                            <li key={hIndex} className="text-sm">{highlight}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {exp.achievements && exp.achievements.length > 0 && (
                      <div>
                        <Label>Notable Achievements</Label>
                        <ul className="list-disc pl-5 space-y-1">
                          {exp.achievements.map((achievement, aIndex) => (
                            <li key={aIndex} className="text-sm">{achievement}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {exp.impact && (
                      <div>
                        <Label>Impact</Label>
                        <p className="text-sm mt-1">{exp.impact}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </TabsContent>
          <TabsContent value="preview">
            <Card className="p-6">
              <ResumeRenderer resume={formData} />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <div className="sticky top-8">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Live Preview</h2>
          <div className="border rounded-lg overflow-hidden">
            <div className="scale-75 origin-top">
              <ResumeRenderer resume={formData} />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 