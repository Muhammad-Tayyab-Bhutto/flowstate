import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';

@Component({
   selector: 'app-profile',
   standalone: true,
   imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule],
   template: `
    <div class="max-w-5xl w-full font-body pt-4 pb-12">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-heading font-bold tracking-tight text-text-primary dark:text-gray-100">User Profile</h1>
        <p class="text-text-secondary mt-1">Manage your public information and agent context files.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Sidebar Navigation (Mock) -->
        <div class="md:col-span-1">
           <nav class="flex flex-col gap-1">
              <a class="px-4 py-2 bg-primary/10 text-primary dark:bg-primary/20 rounded-lg text-sm font-medium cursor-pointer transition-colors">Personal Info</a>
              <a class="px-4 py-2 text-text-secondary hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg text-sm font-medium cursor-pointer transition-colors">Resume & Files</a>
              <a class="px-4 py-2 text-text-secondary hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg text-sm font-medium cursor-pointer transition-colors">Professional Links</a>
           </nav>
        </div>

        <!-- Main Form -->
        <div class="md:col-span-2 flex flex-col gap-6" *ngIf="auth.currentUser$ | async as user">
           
           <!-- Section 1: Personal Info -->
           <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden pb-6">
             <div class="px-6 py-5 border-b border-gray-200 dark:border-white/5 mb-6 flex justify-between items-center">
               <div>
                 <h2 class="text-lg font-heading font-bold text-text-primary dark:text-gray-100">Personal Information</h2>
                 <p class="text-sm text-text-secondary">Used by agents to fill out forms on your behalf.</p>
               </div>
               <div class="w-12 h-12 rounded-full bg-gradient-to-tr from-accent to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-inner">
                  {{ user.name.charAt(0) || 'U' }}
               </div>
             </div>
             
             <form class="px-6 grid grid-cols-1 sm:grid-cols-2 gap-4" (ngSubmit)="saveProfile()">
                <div class="flex flex-col gap-1.5 sm:col-span-2">
                   <label class="text-sm font-medium text-text-primary dark:text-gray-200">Full Name</label>
                   <div class="relative flex items-center group-focus-within:text-primary">
                      <mat-icon class="absolute left-3 text-gray-400 text-[18px] w-[18px] h-[18px]">person</mat-icon>
                      <input [(ngModel)]="profileData.name" name="name" type="text" class="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-slate-800 text-text-primary dark:text-white focus:ring-2 focus:ring-primary focus:outline-none transition-all text-sm" />
                   </div>
                </div>
                
                <div class="flex flex-col gap-1.5">
                   <label class="text-sm font-medium text-text-primary dark:text-gray-200">Email Address</label>
                   <div class="relative flex items-center">
                      <mat-icon class="absolute left-3 text-gray-400 text-[18px] w-[18px] h-[18px]">email</mat-icon>
                      <input [ngModel]="user.email" disabled name="email" type="email" class="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200/50 dark:border-white/5 bg-gray-100 dark:bg-slate-800/50 text-gray-500 dark:text-gray-400 cursor-not-allowed text-sm" />
                   </div>
                </div>

                <div class="flex flex-col gap-1.5">
                   <label class="text-sm font-medium text-text-primary dark:text-gray-200">Phone Code</label>
                   <div class="relative flex items-center group-focus-within:text-primary">
                      <mat-icon class="absolute left-3 text-gray-400 text-[18px] w-[18px] h-[18px]">phone</mat-icon>
                      <input [(ngModel)]="profileData.phone" name="phone" type="tel" class="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-slate-800 text-text-primary dark:text-white focus:ring-2 focus:ring-primary focus:outline-none transition-all text-sm" />
                   </div>
                </div>

                <div class="sm:col-span-2 flex justify-end mt-2 items-center gap-3">
                   <span *ngIf="messages.profile" class="text-xs font-medium text-green-600 dark:text-green-400">{{ messages.profile }}</span>
                   <button type="submit" [disabled]="loading.profile" mat-raised-button color="primary" class="!rounded-lg !shadow-sm">{{ loading.profile ? 'Saving...' : 'Save Changes' }}</button>
                </div>
             </form>
           </div>

           <!-- Section 2: Portfolio Links -->
           <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden pb-6">
             <div class="px-6 py-5 border-b border-gray-200 dark:border-white/5 mb-6">
               <h2 class="text-lg font-heading font-bold text-text-primary dark:text-gray-100">Professional Links</h2>
               <p class="text-sm text-text-secondary">URLs the agent can extract when applying for roles.</p>
             </div>
             
             <form class="px-6 flex flex-col gap-4" (ngSubmit)="saveLinks()">
                <div class="flex flex-col gap-1.5">
                   <label class="text-sm font-medium text-text-primary dark:text-gray-200">LinkedIn URL</label>
                   <div class="relative flex items-center group-focus-within:text-primary">
                      <mat-icon class="absolute left-3 text-gray-400 text-[18px] w-[18px] h-[18px]">link</mat-icon>
                      <input [(ngModel)]="profileData.linkedin" name="linkedin" type="url" class="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-slate-800 text-text-primary dark:text-white focus:ring-2 focus:ring-primary focus:outline-none transition-all text-sm" />
                   </div>
                </div>
                
                <div class="flex flex-col gap-1.5">
                   <label class="text-sm font-medium text-text-primary dark:text-gray-200">GitHub URL</label>
                   <div class="relative flex items-center group-focus-within:text-primary">
                      <mat-icon class="absolute left-3 text-gray-400 text-[18px] w-[18px] h-[18px]">code</mat-icon>
                      <input [(ngModel)]="profileData.github" name="github" type="url" class="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-slate-800 text-text-primary dark:text-white focus:ring-2 focus:ring-primary focus:outline-none transition-all text-sm" />
                   </div>
                </div>

                <div class="flex flex-col gap-1.5 mt-2">
                   <label class="text-sm font-medium text-text-primary dark:text-gray-200">Top Skills (Comma separated)</label>
                   <input [(ngModel)]="profileData.skills" name="skills" type="text" class="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-slate-800 text-text-primary dark:text-white focus:ring-2 focus:ring-primary focus:outline-none transition-all text-sm" />
                </div>
                
                <div class="flex justify-end mt-2 items-center gap-3">
                   <span *ngIf="messages.links" class="text-xs font-medium text-green-600 dark:text-green-400">{{ messages.links }}</span>
                   <button type="submit" [disabled]="loading.links" mat-raised-button color="primary" class="!rounded-lg !shadow-sm">{{ loading.links ? 'Saving...' : 'Save Links' }}</button>
                </div>
             </form>
           </div>

           <!-- Section 3: Resume Upload -->
           <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden pb-6">
             <div class="px-6 py-5 border-b border-gray-200 dark:border-white/5 mb-6">
               <h2 class="text-lg font-heading font-bold text-text-primary dark:text-gray-100">Resume Upload</h2>
               <p class="text-sm text-text-secondary">Upload your latest PDF so the agent can parse your history.</p>
             </div>
             
             <div class="px-6">
                <div class="w-full border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-primary dark:hover:border-primary rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer group bg-gray-50 dark:bg-slate-800/50">
                   <div class="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <mat-icon>cloud_upload</mat-icon>
                   </div>
                   <h3 class="text-sm font-medium text-text-primary dark:text-gray-200 mb-1">Click to upload or drag and drop</h3>
                   <p class="text-xs text-text-secondary">PDF, DOCX up to 5MB</p>
                </div>
                
                <!-- Uploaded File Mock -->
                <div class="mt-4 p-3 border border-gray-200 dark:border-white/10 rounded-lg flex items-center justify-between bg-white dark:bg-slate-900 group">
                   <div class="flex items-center gap-3">
                      <mat-icon class="text-red-500">picture_as_pdf</mat-icon>
                      <div>
                         <p class="text-sm font-medium text-text-primary dark:text-gray-200">Software_Engineer_Resume.pdf</p>
                         <p class="text-xs text-text-secondary">1.2 MB • Uploaded 2 days ago</p>
                      </div>
                   </div>
                   <button class="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                      <mat-icon class="text-[20px] w-5 h-5">delete</mat-icon>
                   </button>
                </div>
             </div>
           </div>

        </div>
      </div>
    </div>
  `,
   styles: []
})
export class ProfileComponent {
   auth = inject(AuthService);
   api = inject(ApiService);

   profileData: any = {};
   loading = { profile: false, links: false };
   messages = { profile: '', links: '' };

   constructor() {
      // Sync initial load
      this.auth.currentUser$.subscribe(user => {
         if (user) {
            this.profileData = { ...user };
         }
      });
   }

   saveProfile() {
      this.loading.profile = true;
      this.messages.profile = '';
      const payload = { name: this.profileData.name, phone: this.profileData.phone };
      this.api.patch('/user/profile', payload).subscribe({
         next: () => {
            this.loading.profile = false;
            this.messages.profile = 'Profile saved successfully';
            this.auth.checkSession().subscribe(); // Refresh global nav state
            setTimeout(() => this.messages.profile = '', 3000);
         },
         error: () => this.loading.profile = false
      });
   }

   saveLinks() {
      this.loading.links = true;
      this.messages.links = '';
      const payload = { linkedin: this.profileData.linkedin, github: this.profileData.github, skills: this.profileData.skills };
      this.api.patch('/user/profile', payload).subscribe({
         next: () => {
            this.loading.links = false;
            this.messages.links = 'Links saved successfully';
            setTimeout(() => this.messages.links = '', 3000);
         },
         error: () => this.loading.links = false
      });
   }
}
