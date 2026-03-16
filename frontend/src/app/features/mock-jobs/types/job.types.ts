export interface Company {
  name: string;
  logo: string;
  description: string;
  size: string;
  industry: string;
  website: string;
}

export interface Job {
  id: string;
  title: string;
  company: Company;
  location: string;
  salaryMin: number;
  salaryMax: number;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
  experience: 'Entry' | 'Mid' | 'Senior' | 'Lead';
  postedDate: Date;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  skills: string[];
}

export interface ApplicationFormData {
  fullName: string;
  email: string;
  phone: string;
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
  yearsOfExperience: string;
  currentCompany: string;
  noticePeriod: string;
  visaStatus: string;
  expectedSalary: string;
  resumeFile?: File;
  coverLetter: string;
  whyJoinUs: string;
  willingToRelocate: boolean;
}

export interface ApplicationSubmission extends ApplicationFormData {
  jobId: string;
  submittedAt: Date;
  confirmationNumber: string;
}
