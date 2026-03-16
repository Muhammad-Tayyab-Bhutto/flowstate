import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MockJobsDataService } from '../services/mock-jobs-data.service';
import { ApplicationFormData, Job } from '../types/job.types';

@Component({
  selector: 'app-application-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatStepperModule,
    MatCheckboxModule,
    MatRadioModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './application-form.component.html',
  styleUrls: ['./application-form.component.scss']
})
export class ApplicationFormComponent implements OnInit {
  job: Job | undefined;
  jobId: string = '';
  applicationForm!: FormGroup;
  isSubmitting = false;
  currentStep = 0;
  
  // Demo obstacle toggles (can be set via URL params)
  simulateLoginWall = false;
  simulateCaptcha = false;
  simulateExtraFormField = false;
  captchaVerified = false;

  yearsOptions = ['0-1', '2-3', '4-5', '6-8', '9-10', '10+'];
  noticePeriodOptions = ['Immediately', '2 weeks', '1 month', '2 months', '3 months'];
  visaStatusOptions = ['US Citizen', 'Permanent Resident', 'H1-B Visa', 'F1 OPT', 'Require Sponsorship'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private jobsService: MockJobsDataService
  ) {}

  ngOnInit(): void {
    this.jobId = this.route.snapshot.paramMap.get('id') || '';
    this.job = this.jobsService.getJobById(this.jobId);

    // Check URL params for demo obstacles
    this.simulateLoginWall = this.route.snapshot.queryParamMap.get('simulateLoginWall') === 'true';
    this.simulateCaptcha = this.route.snapshot.queryParamMap.get('simulateCaptcha') === 'true';
    this.simulateExtraFormField = this.route.snapshot.queryParamMap.get('simulateExtraFormField') === 'true';

    this.initForm();
  }

  initForm(): void {
    this.applicationForm = this.fb.group({
      // Basic Info
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      linkedinUrl: ['', [Validators.required]],
      githubUrl: ['', []],
      portfolioUrl: ['', []],

      // Professional Info
      yearsOfExperience: ['', [Validators.required]],
      currentCompany: ['', []],
      noticePeriod: ['', [Validators.required]],
      visaStatus: ['', [Validators.required]],
      expectedSalary: ['', [Validators.required]],

      // File Uploads
      coverLetter: ['', []],

      // Additional Questions
      whyJoinUs: ['', []],
      willingToRelocate: [false, []]
    });

    // Add extra field if enabled
    if (this.simulateExtraFormField) {
      this.applicationForm.addControl('referenceName', this.fb.control('', Validators.required));
    }
  }

  get f() {
    return this.applicationForm.controls;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      console.log('File selected:', input.files[0].name);
    }
  }

  verifyCaptcha(): void {
    this.captchaVerified = true;
  }

  onSubmit(): void {
    if (this.applicationForm.invalid) {
      this.applicationForm.markAllAsTouched();
      return;
    }

    if (this.simulateCaptcha && !this.captchaVerified) {
      alert('Please verify the CAPTCHA');
      return;
    }

    this.isSubmitting = true;

    // Simulate API call
    setTimeout(() => {
      const formData: ApplicationFormData = this.applicationForm.value;
      
      const submission = {
        ...formData,
        jobId: this.jobId,
        submittedAt: new Date(),
        confirmationNumber: `APP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      };

      this.jobsService.submitApplication(submission);
      
      this.isSubmitting = false;
      this.router.navigate(['/mock-jobs/success'], {
        queryParams: {
          jobTitle: this.job?.title,
          companyName: this.job?.company.name,
          confirmationNumber: submission.confirmationNumber,
          submittedAt: submission.submittedAt.toISOString()
        }
      });
    }, 2000);
  }

  nextStep(): void {
    if (this.currentStep < 2) {
      // Validate current step before proceeding
      if (this.currentStep === 0) {
        // Validate basic info
        const basicInfoFields = ['fullName', 'email', 'phone', 'linkedinUrl'];
        let isValid = true;
        
        basicInfoFields.forEach(field => {
          const control = this.applicationForm.get(field);
          if (control && control.invalid) {
            control.markAsTouched();
            isValid = false;
          }
        });

        if (isValid) {
          this.currentStep++;
        }
      } else if (this.currentStep === 1) {
        // Validate professional info
        const profInfoFields = ['yearsOfExperience', 'noticePeriod', 'visaStatus', 'expectedSalary'];
        let isValid = true;
        
        profInfoFields.forEach(field => {
          const control = this.applicationForm.get(field);
          if (control && control.invalid) {
            control.markAsTouched();
            isValid = false;
          }
        });

        if (isValid) {
          this.currentStep++;
        }
      }
    }
  }

  previousStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  canProceed(): boolean {
    if (this.currentStep === 0) {
      const basicInfoFields = ['fullName', 'email', 'phone', 'linkedinUrl'];
      return basicInfoFields.every(field => {
        const control = this.applicationForm.get(field);
        return control && control.valid;
      });
    }
    
    if (this.currentStep === 1) {
      const profInfoFields = ['yearsOfExperience', 'noticePeriod', 'visaStatus', 'expectedSalary'];
      return profInfoFields.every(field => {
        const control = this.applicationForm.get(field);
        return control && control.valid;
      });
    }
    
    return true;
  }
}
