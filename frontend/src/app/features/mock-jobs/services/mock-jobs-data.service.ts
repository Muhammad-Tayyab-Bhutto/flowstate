import { Injectable } from '@angular/core';
import { Job, ApplicationSubmission } from '../types/job.types';

@Injectable({
  providedIn: 'root'
})
export class MockJobsDataService {
  private jobs: Job[] = [
    {
      id: '1',
      title: 'React Developer',
      company: {
        name: 'NovaTech',
        logo: 'NT',
        description: 'NovaTech is a leading innovator in cloud-based solutions, transforming how businesses operate in the digital age.',
        size: '500-1000 employees',
        industry: 'Technology',
        website: 'https://novatech.example.com'
      },
      location: 'San Francisco, CA',
      salaryMin: 120000,
      salaryMax: 160000,
      type: 'Full-time',
      experience: 'Mid',
      postedDate: new Date('2026-03-10'),
      description: 'We are seeking a talented React Developer to join our growing frontend team. You will work on cutting-edge web applications that serve millions of users worldwide.',
      responsibilities: [
        'Develop and maintain React components for our flagship product',
        'Collaborate with designers and backend engineers to deliver seamless user experiences',
        'Optimize application performance for maximum speed and scalability',
        'Participate in code reviews and mentor junior developers',
        'Stay up-to-date with emerging React technologies and best practices'
      ],
      requirements: [
        '3+ years of experience with React and modern JavaScript',
        'Strong understanding of state management (Redux, Zustand, or similar)',
        'Experience with TypeScript and RESTful APIs',
        'Proficiency in HTML5, CSS3, and responsive design',
        'Bachelor\'s degree in Computer Science or related field'
      ],
      benefits: [
        'Competitive salary and equity package',
        'Comprehensive health, dental, and vision insurance',
        'Unlimited PTO policy',
        'Remote-friendly work environment',
        'Professional development budget',
        'Gym membership reimbursement'
      ],
      skills: ['React', 'TypeScript', 'JavaScript', 'CSS', 'Redux']
    },
    {
      id: '2',
      title: 'Frontend Engineer',
      company: {
        name: 'CloudScale',
        logo: 'CS',
        description: 'CloudScale provides enterprise-grade cloud infrastructure solutions that power the world\'s most demanding applications.',
        size: '1000-5000 employees',
        industry: 'Cloud Computing',
        website: 'https://cloudscale.example.com'
      },
      location: 'Remote',
      salaryMin: 130000,
      salaryMax: 170000,
      type: 'Remote',
      experience: 'Senior',
      postedDate: new Date('2026-03-08'),
      description: 'Join our frontend team to build intuitive dashboards and tools for managing cloud infrastructure at scale.',
      responsibilities: [
        'Build responsive web applications using Angular or React',
        'Design reusable component libraries',
        'Implement real-time data visualization features',
        'Work closely with UX researchers to improve user experience',
        'Contribute to frontend architecture decisions'
      ],
      requirements: [
        '5+ years of frontend development experience',
        'Expert knowledge of modern JavaScript frameworks',
        'Experience with data visualization libraries (D3, Chart.js)',
        'Strong problem-solving and communication skills',
        'Experience with CI/CD pipelines'
      ],
      benefits: [
        '$2000 home office setup budget',
        'Monthly internet stipend',
        'Health insurance for you and your family',
        'Annual company retreats',
        'Stock options',
        'Flexible working hours'
      ],
      skills: ['Angular', 'React', 'D3.js', 'TypeScript', 'WebSocket']
    },
    {
      id: '3',
      title: 'Full Stack Developer',
      company: {
        name: 'HyperLabs',
        logo: 'HL',
        description: 'HyperLabs builds developer tools that make software teams more productive and efficient.',
        size: '100-500 employees',
        industry: 'Developer Tools',
        website: 'https://hyperlabs.example.com'
      },
      location: 'New York, NY',
      salaryMin: 140000,
      salaryMax: 180000,
      type: 'Full-time',
      experience: 'Mid',
      postedDate: new Date('2026-03-12'),
      description: 'We need a Full Stack Developer to help build the next generation of developer productivity tools.',
      responsibilities: [
        'Develop features across our full technology stack',
        'Build RESTful APIs and microservices',
        'Create intuitive frontend interfaces',
        'Optimize database queries and application performance',
        'Participate in agile development processes'
      ],
      requirements: [
        '4+ years of full stack development experience',
        'Proficiency in Node.js, Python, or Go',
        'Experience with React, Vue, or Angular',
        'Strong database skills (SQL and NoSQL)',
        'Familiarity with containerization and Kubernetes'
      ],
      benefits: [
        'Competitive compensation package',
        'Equity in a fast-growing startup',
        'Premium health plans',
        'Catered lunches and snacks',
        'Learning and development budget',
        'Modern office in Manhattan'
      ],
      skills: ['Node.js', 'React', 'PostgreSQL', 'Docker', 'AWS']
    },
    {
      id: '4',
      title: 'AI Engineer',
      company: {
        name: 'QuantumSoft',
        logo: 'QS',
        description: 'QuantumSoft is pioneering the future of AI-powered enterprise solutions.',
        size: '500-1000 employees',
        industry: 'Artificial Intelligence',
        website: 'https://quantumsoft.example.com'
      },
      location: 'Boston, MA',
      salaryMin: 150000,
      salaryMax: 200000,
      type: 'Full-time',
      experience: 'Senior',
      postedDate: new Date('2026-03-05'),
      description: 'Looking for an AI Engineer to develop machine learning models and integrate them into production systems.',
      responsibilities: [
        'Design and implement machine learning models',
        'Deploy ML models to production environments',
        'Collaborate with data scientists and engineers',
        'Research and apply state-of-the-art AI techniques',
        'Optimize model performance and scalability'
      ],
      requirements: [
        'MS or PhD in Computer Science, AI, or related field',
        '5+ years of experience in machine learning',
        'Strong programming skills in Python and TensorFlow/PyTorch',
        'Experience with MLOps and model deployment',
        'Published research in top-tier conferences is a plus'
      ],
      benefits: [
        'Industry-leading compensation',
        'Access to cutting-edge GPU clusters',
        'Conference and publication support',
        'Comprehensive benefits package',
        'Relocation assistance available',
        'Innovation time for personal projects'
      ],
      skills: ['Python', 'TensorFlow', 'PyTorch', 'MLOps', 'NLP']
    },
    {
      id: '5',
      title: 'Product Engineer',
      company: {
        name: 'BrightEdge',
        logo: 'BE',
        description: 'BrightEdge helps businesses optimize their digital presence with data-driven insights.',
        size: '1000-5000 employees',
        industry: 'Marketing Technology',
        website: 'https://brightedge.example.com'
      },
      location: 'Seattle, WA',
      salaryMin: 135000,
      salaryMax: 175000,
      type: 'Full-time',
      experience: 'Mid',
      postedDate: new Date('2026-03-11'),
      description: 'Join our product engineering team to build features that directly impact customer success.',
      responsibilities: [
        'Own feature development from conception to launch',
        'Work closely with product managers and designers',
        'Build scalable backend services',
        'Create polished frontend experiences',
        'Gather and incorporate user feedback'
      ],
      requirements: [
        '3+ years of product engineering experience',
        'Full stack development expertise',
        'Customer-focused mindset',
        'Experience with A/B testing and analytics',
        'Strong communication skills'
      ],
      benefits: [
        'Competitive salary and bonus',
        'Stock purchase plan',
        'Medical, dental, vision coverage',
        'Parental leave',
        'Commuter benefits',
        'Team building events'
      ],
      skills: ['Ruby on Rails', 'React', 'PostgreSQL', 'Redis', 'GraphQL']
    },
    {
      id: '6',
      title: 'Backend Developer',
      company: {
        name: 'TechFlow',
        logo: 'TF',
        description: 'TechFlow streamlines business workflows through intelligent automation.',
        size: '200-500 employees',
        industry: 'Business Automation',
        website: 'https://techflow.example.com'
      },
      location: 'Austin, TX',
      salaryMin: 125000,
      salaryMax: 165000,
      type: 'Full-time',
      experience: 'Mid',
      postedDate: new Date('2026-03-09'),
      description: 'Seeking a Backend Developer to build robust APIs and services for our automation platform.',
      responsibilities: [
        'Design and implement RESTful APIs',
        'Build event-driven microservices',
        'Optimize database performance',
        'Ensure system reliability and security',
        'Mentor junior engineers'
      ],
      requirements: [
        '4+ years of backend development experience',
        'Expertise in Python, Java, or Go',
        'Experience with message queues (RabbitMQ, Kafka)',
        'Strong SQL and database design skills',
        'Knowledge of security best practices'
      ],
      benefits: [
        'Competitive compensation',
        'Performance bonuses',
        'Health and wellness programs',
        'Flexible PTO',
        'Home office stipend',
        'Austin office with game room'
      ],
      skills: ['Python', 'FastAPI', 'PostgreSQL', 'Kafka', 'Kubernetes']
    },
    {
      id: '7',
      title: 'DevOps Engineer',
      company: {
        name: 'DataPeak',
        logo: 'DP',
        description: 'DataPeak provides big data analytics platforms for enterprise customers.',
        size: '500-1000 employees',
        industry: 'Data Analytics',
        website: 'https://datapeak.example.com'
      },
      location: 'Denver, CO',
      salaryMin: 140000,
      salaryMax: 180000,
      type: 'Full-time',
      experience: 'Senior',
      postedDate: new Date('2026-03-07'),
      description: 'Looking for a DevOps Engineer to manage and scale our cloud infrastructure.',
      responsibilities: [
        'Manage Kubernetes clusters in production',
        'Implement infrastructure as code',
        'Build and maintain CI/CD pipelines',
        'Monitor system performance and reliability',
        'Automate operational tasks'
      ],
      requirements: [
        '5+ years of DevOps/SRE experience',
        'Strong Kubernetes and Docker expertise',
        'Experience with Terraform or CloudFormation',
        'Proficiency in scripting (Bash, Python)',
        'On-call experience and troubleshooting skills'
      ],
      benefits: [
        'Excellent compensation package',
        'Equity grants',
        'Full benefits coverage',
        'Remote work flexibility',
        'Conference attendance budget',
        'Certification reimbursement'
      ],
      skills: ['Kubernetes', 'Terraform', 'AWS', 'Prometheus', 'Jenkins']
    },
    {
      id: '8',
      title: 'ML Engineer',
      company: {
        name: 'AIVision',
        logo: 'AV',
        description: 'AIVision develops computer vision solutions for autonomous systems.',
        size: '100-500 employees',
        industry: 'Computer Vision',
        website: 'https://aivision.example.com'
      },
      location: 'Palo Alto, CA',
      salaryMin: 160000,
      salaryMax: 210000,
      type: 'Full-time',
      experience: 'Senior',
      postedDate: new Date('2026-03-06'),
      description: 'Join our team to develop state-of-the-art computer vision models for autonomous vehicles.',
      responsibilities: [
        'Develop deep learning models for object detection',
        'Train and optimize neural networks',
        'Deploy models to edge devices',
        'Collaborate with robotics engineers',
        'Publish research findings'
      ],
      requirements: [
        'PhD or MS in Computer Vision, Machine Learning',
        'Strong publication record',
        'Expertise in PyTorch or TensorFlow',
        'Experience with CNN architectures',
        'Knowledge of embedded systems is a plus'
      ],
      benefits: [
        'Top-tier compensation',
        'Significant equity stake',
        'Premium healthcare',
        'Relocation package',
        'Visa sponsorship',
        'Cutting-edge hardware access'
      ],
      skills: ['PyTorch', 'Computer Vision', 'Deep Learning', 'Python', 'CUDA']
    },
    {
      id: '9',
      title: 'Software Engineer',
      company: {
        name: 'CodeCraft',
        logo: 'CC',
        description: 'CodeCraft creates collaborative coding tools for distributed teams.',
        size: '50-200 employees',
        industry: 'Developer Tools',
        website: 'https://codecraft.example.com'
      },
      location: 'Chicago, IL',
      salaryMin: 130000,
      salaryMax: 170000,
      type: 'Full-time',
      experience: 'Mid',
      postedDate: new Date('2026-03-13'),
      description: 'Build real-time collaboration features for our innovative code editor.',
      responsibilities: [
        'Implement real-time synchronization features',
        'Develop collaborative editing tools',
        'Optimize editor performance',
        'Integrate with version control systems',
        'Write technical documentation'
      ],
      requirements: [
        '3+ years of software development experience',
        'Strong JavaScript/TypeScript skills',
        'Experience with WebSockets or WebRTC',
        'Understanding of data structures and algorithms',
        'Passion for developer tools'
      ],
      benefits: [
        'Competitive salary',
        'Early-stage equity',
        'Health and dental insurance',
        'Unlimited vacation',
        'Co-located team culture',
        'Latest tech equipment'
      ],
      skills: ['TypeScript', 'WebSockets', 'React', 'Node.js', 'Git']
    },
    {
      id: '10',
      title: 'Platform Engineer',
      company: {
        name: 'ScaleUp',
        logo: 'SU',
        description: 'ScaleUp helps startups scale their technology and operations efficiently.',
        size: '200-500 employees',
        industry: 'Startup Services',
        website: 'https://scaleup.example.com'
      },
      location: 'Miami, FL',
      salaryMin: 135000,
      salaryMax: 175000,
      type: 'Full-time',
      experience: 'Senior',
      postedDate: new Date('2026-03-04'),
      description: 'Build and maintain the platform infrastructure that powers hundreds of startups.',
      responsibilities: [
        'Design scalable platform architecture',
        'Implement monitoring and alerting systems',
        'Automate deployment processes',
        'Ensure high availability and disaster recovery',
        'Support engineering teams with tools and infrastructure'
      ],
      requirements: [
        '5+ years of platform/infrastructure experience',
        'Strong cloud platform knowledge (AWS, GCP, Azure)',
        'Experience with infrastructure as code',
        'Proficiency in multiple programming languages',
        'Excellent problem-solving abilities'
      ],
      benefits: [
        'Attractive compensation package',
        'Equity in growing companies',
        'Comprehensive health benefits',
        'Beach office location',
        'Networking opportunities',
        'Startup ecosystem access'
      ],
      skills: ['AWS', 'Terraform', 'Python', 'Kubernetes', 'Datadog']
    }
  ];

  private applications: ApplicationSubmission[] = [];

  getJobs(): Job[] {
    return this.jobs;
  }

  getJobById(id: string): Job | undefined {
    return this.jobs.find(job => job.id === id);
  }

  searchJobs(query: string, location?: string, type?: string): Job[] {
    let filtered = this.jobs;

    if (query) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(lowerQuery) ||
        job.company.name.toLowerCase().includes(lowerQuery) ||
        job.skills.some(skill => skill.toLowerCase().includes(lowerQuery))
      );
    }

    if (location) {
      filtered = filtered.filter(job =>
        job.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    if (type) {
      filtered = filtered.filter(job => job.type === type);
    }

    return filtered;
  }

  submitApplication(application: ApplicationSubmission): void {
    this.applications.push(application);
    console.log('Application submitted:', application);
  }

  getApplications(): ApplicationSubmission[] {
    return this.applications;
  }
}
