export interface Resume {
  id: string;
  title: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  personalInfo: PersonalInfo;
  education: Education[];
  experience: Experience[];
  skills: string[];
  summary: string;
  templateId: string;
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  fullName?: string;
  email: string;
  phone: string;
  location: string;
  summary?: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  location?: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate?: string;
  description: string;
  highlights?: string[];
}

export interface Personal {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  summary: string;
}

export interface FormData {
  personal: Personal;
  education: Education[];
  experience: Experience[];
  skills: string[];
}

export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
} 