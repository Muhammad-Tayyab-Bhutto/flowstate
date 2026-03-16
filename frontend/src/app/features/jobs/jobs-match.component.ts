import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../core/services/api.service';

export interface JobMatch {
    title: string;
    company: string;
    location: string;
    type: 'Remote' | 'Onsite' | 'Hybrid';
    matchPercentage: number;
    salary?: string;
    reason: string;
}

@Component({
    selector: 'app-jobs-match',
    standalone: true,
    imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, MatProgressSpinnerModule],
    template: `
    <div class="max-w-7xl mx-auto w-full font-body">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 class="text-3xl font-heading font-bold tracking-tight text-text-primary dark:text-gray-100 flex items-center gap-3">
             <mat-icon class="text-primary text-[28px] w-7 h-7">auto_awesome</mat-icon> 
             AI Job Matches
          </h1>
          <p class="text-text-secondary mt-1">Top 10 personalized recommendations based on your profile.</p>
        </div>
        <button mat-raised-button color="primary" class="!rounded-lg !px-6 !py-2 !shadow-sm hover:!shadow-md hover:-translate-y-0.5 transition-all !font-medium" (click)="loadMatches()" [disabled]="loading">
          <div class="flex items-center gap-2"><mat-icon class="text-[20px] w-5 h-5">refresh</mat-icon> Refresh Matches</div>
        </button>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="flex flex-col items-center justify-center py-24 bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/5 rounded-2xl shadow-sm">
        <mat-spinner diameter="48" class="!stroke-primary mb-6"></mat-spinner>
        <h3 class="text-xl font-heading font-semibold text-text-primary dark:text-gray-100">Analyzing Your Profile...</h3>
        <p class="text-text-secondary mt-2 max-w-md text-center">Our AI is scanning thousands of listings to find the perfect matches for your skills, experience, and preferences.</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error && !loading" class="p-6 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 rounded-2xl flex items-start gap-4">
        <mat-icon class="mt-0.5">error_outline</mat-icon>
        <div>
          <h3 class="font-bold mb-1">Could not load matches</h3>
          <p class="text-sm font-medium opacity-80">{{ error }}</p>
        </div>
      </div>

      <!-- Jobs Grid -->
      <div *ngIf="!loading && !error && jobs.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div *ngFor="let job of jobs" class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full group">
          
          <div class="flex justify-between items-start mb-4">
             <div>
               <h2 class="text-xl font-heading font-bold text-text-primary dark:text-gray-100 group-hover:text-primary transition-colors leading-tight mb-1">{{ job.title }}</h2>
               <div class="flex items-center gap-2 text-text-secondary text-sm font-medium">
                  <mat-icon class="text-[16px] w-4 h-4">business</mat-icon> {{ job.company }}
               </div>
             </div>
             <!-- Match Badge -->
             <div class="flex flex-col items-center justify-center p-2 rounded-xl border border-green-200 dark:border-green-500/30 bg-green-50 dark:bg-green-500/10 min-w-[70px]">
                <span class="text-green-700 dark:text-green-400 font-bold text-lg leading-none">{{ job.matchPercentage }}%</span>
                <span class="text-green-600 dark:text-green-500 text-[10px] font-semibold uppercase tracking-wide mt-1">Match</span>
             </div>
          </div>

          <div class="flex flex-wrap gap-2 mb-4">
             <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300">
                <mat-icon class="text-[14px] w-3.5 h-3.5">location_on</mat-icon> {{ job.location }}
             </span>
             <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold"
                   [ngClass]="{
                     'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400': job.type === 'Remote',
                     'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400': job.type === 'Hybrid',
                     'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400': job.type === 'Onsite'
                   }">
                <mat-icon class="text-[14px] w-3.5 h-3.5">{{ job.type === 'Remote' ? 'wifi' : (job.type === 'Hybrid' ? 'corporate_fare' : 'business') }}</mat-icon> {{ job.type }}
             </span>
             <span *ngIf="job.salary" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400">
                <mat-icon class="text-[14px] w-3.5 h-3.5">payments</mat-icon> {{ job.salary }}
             </span>
          </div>

          <div class="flex-1">
             <h4 class="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Why this is a match</h4>
             <p class="text-sm text-text-primary dark:text-gray-300 leading-relaxed">{{ job.reason }}</p>
          </div>

          <div class="mt-6 pt-4 border-t border-gray-100 dark:border-white/5">
             <button mat-raised-button color="accent" class="w-full !rounded-xl !py-6 !shadow-md hover:!shadow-lg hover:-translate-y-0.5 transition-all !font-bold text-base bg-gradient-to-r from-accent to-blue-600" (click)="autoApply(job)">
                <div class="flex items-center justify-center gap-2">
                   <mat-icon class="text-[22px] w-[22px] h-[22px] text-white">smart_toy</mat-icon> 
                   Auto-Apply with Agent
                </div>
             </button>
          </div>
        </div>
      </div>

    </div>
  `,
    styles: []
})
export class JobsMatchComponent implements OnInit {
    api = inject(ApiService);
    router = inject(Router);

    jobs: JobMatch[] = [];
    loading = false;
    error: string | null = null;

    ngOnInit() {
        this.loadMatches();
    }

    loadMatches() {
        this.loading = true;
        this.error = null;

        this.api.get<{ data: JobMatch[] }>('/jobs/matches').subscribe({
            next: (res) => {
                this.jobs = res.data;
                this.loading = false;
            },
            error: (err) => {
                this.error = typeof err.error?.message === 'string' ? err.error.message : 'Error generating matches. Please try again.';
                this.loading = false;
            }
        });
    }

    autoApply(job: JobMatch) {
        // Navigate directly into an agent session to apply for this job
        const searchUrl = 'https://www.linkedin.com/jobs/search/?keywords=' + encodeURIComponent(job.title + ' ' + (job.company || ''));

        this.api.post<{ data: any }>('/sessions', {
            goal: `Apply for ${job.title} at ${job.company}`,
            max_actions: 15,
            initial_url: searchUrl
        }).subscribe({
            next: (res) => {
                this.router.navigate(['/dashboard/sessions', res.data.id]);
            }
        });
    }
}
