"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DocumentPreview } from '@/components/document-preview'

interface Education {
  school: string
  degree: string
  field: string
  startDate: string
  endDate: string
  location: string
}

interface Experience {
  company: string
  position: string
  startDate: string
  endDate: string
  location: string
  description: string
  highlights: string[]
}

interface Personal {
  firstName: string
  lastName: string
  email: string
  phone: string
  location: string
  summary: string
}

interface ParsedData {
  personal: Personal
  education: Education[]
  experience: Experience[]
  skills: string[]
}

export default function UploadResumePage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string>('')
  const [parsedData, setParsedData] = useState<ParsedData | null>(null)
  const [editedData, setEditedData] = useState<ParsedData | null>(null)
  const [activeTab, setActiveTab] = useState('preview')

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/') && selectedFile.type !== 'application/pdf') {
        toast.error('Unsupported file type. Please upload a PDF or image file.')
        return
      }
      
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File is too large. Maximum size is 10MB.')
        return
      }

      setFile(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file) return;

    try {
      setLoading(true);
      setUploadProgress('Preparing file...');

      // Create form data
      const formData = new FormData();
      formData.append('file', file);

      console.log('Uploading file:', {
        name: file.name,
        type: file.type,
        size: file.size
      });

      setUploadProgress('Uploading and processing...');
      
      // Make the request with proper headers
      const response = await fetch('/api/resume/ocr', {
        method: 'POST',
        body: formData,
        // Remove the Accept header as it's not needed for multipart/form-data
        headers: {},
      });

      // Log the response headers for debugging
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      // First check if the response exists
      if (!response) {
        throw new Error('No response from server');
      }

      // Check for non-200 status codes first
      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response:', errorText);
        
        let errorMessage = `Server error: ${response.status} ${response.statusText}`;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorMessage;
        } catch (e) {
          console.error('Error parsing error response:', e);
        }
        throw new Error(errorMessage);
      }

      // Try to parse the response as JSON
      let data;
      try {
        const textResponse = await response.text();
        console.log('Raw response:', textResponse);
        
        if (!textResponse) {
          throw new Error('Empty response from server');
        }
        
        try {
          data = JSON.parse(textResponse);
        } catch (parseError) {
          console.error('Error parsing JSON:', parseError);
          throw new Error('Invalid JSON response from server');
        }
      } catch (error) {
        console.error('Error reading response:', error);
        throw error;
      }

      setUploadProgress('Validating response...');
      console.log('OCR Response:', data);

      // Validate the response data structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format from server');
      }

      if (!data.personal || !data.education || !data.experience || !data.skills) {
        throw new Error('Invalid response data structure from server');
      }

      setParsedData(data);
      setEditedData(data);
      setActiveTab('edit');
      toast.success('Resume processed successfully');
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process resume');
      // Only reset file if it's a file-related error
      if (error instanceof Error && 
          (error.message.includes('file') || error.message.includes('Server error'))) {
        setFile(null);
      }
    } finally {
      setLoading(false);
      setUploadProgress('');
    }
  };

  const handleSave = async () => {
    if (!editedData) return

    try {
      setLoading(true)
      const createResponse = await fetch('/api/resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `${editedData.personal.firstName} ${editedData.personal.lastName}'s Resume`,
          content: {
            personal: {
              ...editedData.personal,
              fullName: `${editedData.personal.firstName} ${editedData.personal.lastName}`,
            },
            education: editedData.education,
            experience: editedData.experience,
            skills: editedData.skills,
          },
          templateId: 'modern',
        }),
      })

      if (!createResponse.ok) {
        throw new Error('Failed to create resume')
      }

      const resume = await createResponse.json()
      router.push(`/resume/${resume.id}`)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to save resume')
    } finally {
      setLoading(false)
    }
  }

  const updatePersonalInfo = (field: keyof Personal, value: string) => {
    if (!editedData) return
    setEditedData({
      ...editedData,
      personal: {
        ...editedData.personal,
        [field]: value
      }
    })
  }

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    if (!editedData) return
    const newEducation = [...editedData.education]
    newEducation[index] = {
      ...newEducation[index],
      [field]: value
    }
    setEditedData({
      ...editedData,
      education: newEducation
    })
  }

  const updateExperience = (index: number, field: keyof Experience, value: string | string[]) => {
    if (!editedData) return
    const newExperience = [...editedData.experience]
    newExperience[index] = {
      ...newExperience[index],
      [field]: value
    }
    setEditedData({
      ...editedData,
      experience: newExperience
    })
  }

  const updateSkills = (skills: string[]) => {
    if (!editedData) return
    setEditedData({
      ...editedData,
      skills
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Upload Your Resume</h1>
        
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left side - Preview */}
          <div className="space-y-4">
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="resume">Choose Resume File</Label>
                  <Input
                    id="resume"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="mt-2"
                    disabled={loading}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Supported formats: PDF, JPG, PNG (max 10MB)
                  </p>
                </div>
                
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Preview:</h3>
                  <DocumentPreview 
                    file={file}
                    className="min-h-[600px] max-h-[800px]"
                  />
                </div>

                <div className="space-y-2">
                  {uploadProgress && (
                    <div className="text-sm text-gray-600 text-center">
                      {uploadProgress}
                    </div>
                  )}
                  <Button
                    onClick={handleUpload}
                    disabled={!file || loading}
                    className="w-full relative"
                  >
                    {loading ? (
                      <>
                        <span className="opacity-0">Upload and Process</span>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        </div>
                      </>
                    ) : (
                      'Upload and Process'
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Right side - Parsed Data & Editor */}
          {editedData && (
            <div>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="edit">Edit</TabsTrigger>
                </TabsList>

                <TabsContent value="preview">
                  <Card className="p-6">
                    <h3 className="font-semibold mb-4">Extracted Information:</h3>
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium">Personal Information</h4>
                        <p>Name: {editedData.personal.firstName} {editedData.personal.lastName}</p>
                        <p>Email: {editedData.personal.email}</p>
                        <p>Phone: {editedData.personal.phone}</p>
                        {editedData.personal.location && (
                          <p>Location: {editedData.personal.location}</p>
                        )}
                      </div>
                      
                      <div>
                        <h4 className="font-medium">Education</h4>
                        {editedData.education.map((edu, index) => (
                          <div key={index} className="mt-2">
                            <p>{edu.school} - {edu.degree}</p>
                            <p className="text-sm text-gray-600">
                              {edu.startDate} - {edu.endDate}
                            </p>
                            {edu.location && (
                              <p className="text-sm text-gray-600">{edu.location}</p>
                            )}
                          </div>
                        ))}
                      </div>

                      <div>
                        <h4 className="font-medium">Experience</h4>
                        {editedData.experience.map((exp, index) => (
                          <div key={index} className="mt-2">
                            <p>{exp.company} - {exp.position}</p>
                            <p className="text-sm text-gray-600">
                              {exp.startDate} - {exp.endDate}
                            </p>
                            {exp.location && (
                              <p className="text-sm text-gray-600">{exp.location}</p>
                            )}
                            {exp.description && (
                              <p className="text-sm mt-1">{exp.description}</p>
                            )}
                          </div>
                        ))}
                      </div>

                      <div>
                        <h4 className="font-medium">Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {editedData.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 rounded text-sm"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="edit">
                  <Card className="p-6">
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium mb-4">Personal Information</h4>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                              id="firstName"
                              value={editedData.personal.firstName}
                              onChange={(e) => updatePersonalInfo('firstName', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                              id="lastName"
                              value={editedData.personal.lastName}
                              onChange={(e) => updatePersonalInfo('lastName', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={editedData.personal.email}
                              onChange={(e) => updatePersonalInfo('email', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                              id="phone"
                              value={editedData.personal.phone}
                              onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <Label htmlFor="location">Location</Label>
                            <Input
                              id="location"
                              value={editedData.personal.location}
                              onChange={(e) => updatePersonalInfo('location', e.target.value)}
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <Label htmlFor="summary">Summary</Label>
                            <Textarea
                              id="summary"
                              value={editedData.personal.summary}
                              onChange={(e) => updatePersonalInfo('summary', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-4">Education</h4>
                        {editedData.education.map((edu, index) => (
                          <div key={index} className="grid gap-4 sm:grid-cols-2 mb-4 pb-4 border-b">
                            <div>
                              <Label htmlFor={`school-${index}`}>School</Label>
                              <Input
                                id={`school-${index}`}
                                value={edu.school}
                                onChange={(e) => updateEducation(index, 'school', e.target.value)}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`degree-${index}`}>Degree</Label>
                              <Input
                                id={`degree-${index}`}
                                value={edu.degree}
                                onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`startDate-${index}`}>Start Date</Label>
                              <Input
                                id={`startDate-${index}`}
                                value={edu.startDate}
                                onChange={(e) => updateEducation(index, 'startDate', e.target.value)}
                                placeholder="YYYY-MM"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`endDate-${index}`}>End Date</Label>
                              <Input
                                id={`endDate-${index}`}
                                value={edu.endDate}
                                onChange={(e) => updateEducation(index, 'endDate', e.target.value)}
                                placeholder="YYYY-MM"
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div>
                        <h4 className="font-medium mb-4">Experience</h4>
                        {editedData.experience.map((exp, index) => (
                          <div key={index} className="grid gap-4 sm:grid-cols-2 mb-4 pb-4 border-b">
                            <div>
                              <Label htmlFor={`company-${index}`}>Company</Label>
                              <Input
                                id={`company-${index}`}
                                value={exp.company}
                                onChange={(e) => updateExperience(index, 'company', e.target.value)}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`position-${index}`}>Position</Label>
                              <Input
                                id={`position-${index}`}
                                value={exp.position}
                                onChange={(e) => updateExperience(index, 'position', e.target.value)}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`expStartDate-${index}`}>Start Date</Label>
                              <Input
                                id={`expStartDate-${index}`}
                                value={exp.startDate}
                                onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                                placeholder="YYYY-MM"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`expEndDate-${index}`}>End Date</Label>
                              <Input
                                id={`expEndDate-${index}`}
                                value={exp.endDate}
                                onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                                placeholder="YYYY-MM"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <Label htmlFor={`description-${index}`}>Description</Label>
                              <Textarea
                                id={`description-${index}`}
                                value={exp.description}
                                onChange={(e) => updateExperience(index, 'description', e.target.value)}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div>
                        <h4 className="font-medium mb-4">Skills</h4>
                        <Textarea
                          value={editedData.skills.join(', ')}
                          onChange={(e) => updateSkills(e.target.value.split(',').map(s => s.trim()))}
                          placeholder="Enter skills separated by commas"
                        />
                      </div>

                      <Button
                        onClick={handleSave}
                        disabled={loading}
                        className="w-full"
                      >
                        {loading ? 'Saving...' : 'Save and Continue'}
                      </Button>
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 