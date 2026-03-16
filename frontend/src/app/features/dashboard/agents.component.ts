import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../core/services/api.service';

@Component({
   selector: 'app-agents',
   standalone: true,
   imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule],
   template: `
    <div class="max-w-7xl mx-auto w-full font-body pt-4">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 class="text-3xl font-heading font-bold tracking-tight text-text-primary dark:text-gray-100">Configured Agents</h1>
          <p class="text-text-secondary mt-1">Manage, start, and configure your recurring autonomous web workers.</p>
        </div>
        <button mat-raised-button color="primary" class="!rounded-lg !shadow-sm hover:!shadow-md transition-all">
           <div class="flex items-center gap-2"><mat-icon class="text-[20px] w-5 h-5">add</mat-icon> Create Agent</div>
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Agent List -->
        <div class="lg:col-span-2 flex flex-col gap-4">
           
           <!-- Agent Card 1 -->
           <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/5 rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow relative overflow-hidden group">
              <div class="flex justify-between items-start mb-4">
                 <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                       <mat-icon>work</mat-icon>
                    </div>
                    <div>
                       <h3 class="font-heading font-bold text-lg text-text-primary dark:text-gray-100 group-hover:text-primary transition-colors">LinkedIn Job Applier</h3>
                       <div class="flex items-center gap-2 text-sm text-text-secondary mt-0.5">
                          <span class="inline-flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-green-500"></span> Online</span>
                          <span>•</span>
                          <span>Daily at 9:00 AM</span>
                       </div>
                    </div>
                 </div>
                 <button class="text-gray-400 hover:text-text-primary dark:hover:text-white transition-colors"><mat-icon>more_vert</mat-icon></button>
              </div>
              
              <p class="text-sm text-text-secondary leading-relaxed mb-6">Automatically searches for "Frontend Engineer" remote jobs on LinkedIn, clicks Easy Apply, and submits your resume using the profile configurations.</p>
              
              <div class="grid grid-cols-3 gap-4 py-4 border-t border-b border-gray-100 dark:border-white/5 mb-6">
                 <div class="flex flex-col">
                    <span class="text-xs font-semibold text-text-secondary tracking-wider uppercase mb-1">Success Rate</span>
                    <span class="text-lg font-bold text-text-primary dark:text-gray-200">92%</span>
                 </div>
                 <div class="flex flex-col border-l border-gray-100 dark:border-white/5 pl-4">
                    <span class="text-xs font-semibold text-text-secondary tracking-wider uppercase mb-1">Actions Taken</span>
                    <span class="text-lg font-bold text-text-primary dark:text-gray-200">1,245</span>
                 </div>
                 <div class="flex flex-col border-l border-gray-100 dark:border-white/5 pl-4">
                    <span class="text-xs font-semibold text-text-secondary tracking-wider uppercase mb-1">Avg Runtime</span>
                    <span class="text-lg font-bold text-text-primary dark:text-gray-200">2m 14s</span>
                 </div>
              </div>

              <div class="flex items-center gap-3">
                 <button (click)="startAgent('LinkedIn Job Applier')" [disabled]="starting['LinkedIn Job Applier']" class="bg-primary hover:bg-indigo-600 text-white text-sm font-medium px-5 py-2 rounded-lg transition-all shadow-md shadow-primary/20 hover:shadow-primary/40 flex items-center gap-2">
                    <mat-icon *ngIf="!starting['LinkedIn Job Applier']" class="text-[18px] w-[18px] h-[18px]">play_arrow</mat-icon> {{ starting['LinkedIn Job Applier'] ? 'Starting...' : 'Start Run' }}
                 </button>
                 <button class="bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-transparent dark:border-white/5 text-text-primary dark:text-gray-200 text-sm font-medium px-5 py-2 rounded-lg transition-all">
                    View Logs
                 </button>
              </div>
           </div>

           <!-- Agent Card 2 -->
           <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/5 rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow relative overflow-hidden group">
              <div class="flex justify-between items-start mb-4">
                 <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center border border-orange-500/20">
                       <mat-icon>article</mat-icon>
                    </div>
                    <div>
                       <h3 class="font-heading font-bold text-lg text-text-primary dark:text-gray-100 group-hover:text-primary transition-colors">YCombinator News Scraper</h3>
                       <div class="flex items-center gap-2 text-sm text-text-secondary mt-0.5">
                          <span class="inline-flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></span> Idle</span>
                          <span>•</span>
                          <span>On Demand</span>
                       </div>
                    </div>
                 </div>
                 <button class="text-gray-400 hover:text-text-primary dark:hover:text-white transition-colors"><mat-icon>more_vert</mat-icon></button>
              </div>
              
              <p class="text-sm text-text-secondary leading-relaxed mb-6">Navigates to Hacker News, extracts the top 10 articles including links and point scores, and summarizes them into a Notion document.</p>
              
              <div class="flex items-center gap-3 mt-4">
                 <button (click)="startAgent('YCombinator News Scraper')" [disabled]="starting['YCombinator News Scraper']" class="bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 dark:hover:text-accent border border-transparent dark:border-white/5 text-text-primary dark:text-gray-200 text-sm font-medium px-5 py-2 rounded-lg transition-all flex items-center gap-2">
                    <mat-icon *ngIf="!starting['YCombinator News Scraper']" class="text-[18px] w-[18px] h-[18px]">play_arrow</mat-icon> {{ starting['YCombinator News Scraper'] ? 'Starting...' : 'Start Run' }}
                 </button>
                 <button class="text-text-secondary hover:text-text-primary dark:hover:text-gray-300 text-sm font-medium px-3 py-2 transition-all">
                    Configure
                 </button>
              </div>
           </div>

        </div>

        <!-- Right Side: Action Timeline Panel -->
        <div class="lg:col-span-1">
           <div class="bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-white/5 rounded-2xl p-6 h-[calc(100vh-10rem)] sticky top-24 overflow-y-auto hidden lg:block">
              <div class="flex items-center gap-2 mb-6">
                 <mat-icon class="text-primary text-[20px] w-5 h-5">history</mat-icon>
                 <h3 class="font-heading font-bold text-text-primary dark:text-gray-100">Global Activity</h3>
              </div>
              
              <div class="relative">
                 <div class="absolute left-3 top-2 bottom-2 w-px bg-gray-200 dark:bg-slate-700"></div>
                 
                 <div class="flex gap-4 mb-6 relative">
                    <div class="w-6 h-6 rounded-full bg-green-100 text-green-600 border border-green-200 dark:bg-green-500/20 dark:border-green-500/30 dark:text-green-500 flex items-center justify-center flex-shrink-0 relative z-10 shadow-sm">
                       <mat-icon class="!text-[16px] !w-[16px] !h-[16px] leading-none flex items-center justify-center">check</mat-icon>
                    </div>
                    <div>
                       <p class="text-sm font-medium text-text-primary dark:text-gray-200">LinkedIn Job Applier succeeded</p>
                       <p class="text-xs text-text-secondary mt-0.5">2 mins ago • Applied to 5 roles</p>
                    </div>
                 </div>

                 <div class="flex gap-4 mb-6 relative">
                    <div class="w-6 h-6 rounded-full bg-blue-100 text-blue-600 border border-blue-200 dark:bg-blue-500/20 dark:border-blue-500/30 dark:text-blue-500 flex items-center justify-center flex-shrink-0 relative z-10 shadow-sm">
                       <mat-icon class="!text-[16px] !w-[16px] !h-[16px] leading-none flex items-center justify-center">hardware</mat-icon>
                    </div>
                    <div>
                       <p class="text-sm text-text-primary dark:text-gray-200">System updated browser binaries</p>
                       <p class="text-xs text-text-secondary mt-0.5">3 hours ago • Version 121.0.1</p>
                    </div>
                 </div>

                 <div class="flex gap-4 mb-6 relative">
                    <div class="w-6 h-6 rounded-full bg-red-100 text-red-600 border border-red-200 dark:bg-red-500/20 dark:border-red-500/30 dark:text-red-500 flex items-center justify-center flex-shrink-0 relative z-10 shadow-sm">
                       <mat-icon class="!text-[16px] !w-[16px] !h-[16px] leading-none flex items-center justify-center">close</mat-icon>
                    </div>
                    <div>
                       <p class="text-sm font-medium text-text-primary dark:text-gray-200">X Post Generator failed</p>
                       <p class="text-xs text-text-secondary mt-0.5">1 day ago • Element out of bounds</p>
                    </div>
                 </div>

                 <div class="flex gap-4 relative">
                    <div class="w-6 h-6 rounded-full bg-orange-100 text-orange-600 border border-orange-200 dark:bg-orange-500/20 dark:border-orange-500/30 dark:text-orange-500 flex items-center justify-center flex-shrink-0 relative z-10 shadow-sm">
                       <mat-icon class="!text-[16px] !w-[16px] !h-[16px] leading-none flex items-center justify-center">edit</mat-icon>
                    </div>
                    <div>
                       <p class="text-sm text-text-primary dark:text-gray-200">You edited Agent #1</p>
                       <p class="text-xs text-text-secondary mt-0.5">2 days ago • Changed execution time</p>
                    </div>
                 </div>
              </div>
              
              <button class="w-full mt-8 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary uppercase tracking-wider transition-colors border border-gray-200 dark:border-white/10 rounded-lg">View All Logs</button>
           </div>
        </div>

      </div>
    </div>
  `,
   styles: []
})
export class AgentsComponent {
   api = inject(ApiService);
   router = inject(Router);

   starting: Record<string, boolean> = {};

   startAgent(agentName: string) {
      this.starting[agentName] = true;
      let goal = '';
      let url = '';

      if (agentName === 'LinkedIn Job Applier') {
         goal = 'Navigate to the local mock job platform at http://localhost:3000/mock-jobs, browse available positions, select a React Developer or Frontend Engineer role, and complete the full job application form. Use the data-agent-field markers to identify form fields. Submit the application successfully.';
         url = 'http://localhost:3000/mock-jobs';
      } else if (agentName === 'LinkedIn Job Seeker') {
         goal = 'Navigate to LinkedIn, search for remote "Frontend Engineer" jobs, and click Easy Apply. Fill out the application using my saved resume and profile details.';
         url = 'https://linkedin.com/jobs';
      } else if (agentName === 'YCombinator News Scraper') {
         goal = 'Navigate to Hacker News, extract the top 10 articles including links and point scores, and output a summary.';
         url = 'https://news.ycombinator.com';
      } else {
         goal = `Perform automated tasks for: ${agentName}`;
      }

      this.api.post<{ data: any }>('/sessions', { goal, options: { initial_url: url || undefined, max_actions: 30 } }).subscribe({
         next: (res: any) => {
            this.starting[agentName] = false;
            this.router.navigate(['/dashboard/sessions', res.data.id]);
         },
         error: () => this.starting[agentName] = false
      });
   }
}
