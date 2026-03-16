import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatSlideToggleModule],
  template: `
    <div class="max-w-5xl w-full font-body pt-4">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-heading font-bold tracking-tight text-text-primary dark:text-gray-100">Preferences</h1>
        <p class="text-text-secondary mt-1">Manage your platform workspace styling and agent operational limits.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <!-- Sidebar Navigation (Mock) -->
        <div class="md:col-span-1">
           <nav class="flex flex-col gap-1">
              <a class="px-4 py-2 bg-primary/10 text-primary dark:bg-primary/20 rounded-lg text-sm font-medium cursor-pointer transition-colors">Theme & Interface</a>
              <a class="px-4 py-2 text-text-secondary hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg text-sm font-medium cursor-pointer transition-colors">Notifications</a>
              <a class="px-4 py-2 text-text-secondary hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg text-sm font-medium cursor-pointer transition-colors">API Keys</a>
              <a class="px-4 py-2 text-text-secondary hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg text-sm font-medium cursor-pointer transition-colors">Security</a>
           </nav>
        </div>

        <!-- Main Settings Form -->
        <div class="md:col-span-2 flex flex-col gap-6">
           <!-- Section 1 -->
           <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden pb-6">
             <div class="px-6 py-5 border-b border-gray-200 dark:border-white/5 mb-6">
               <h2 class="text-lg font-heading font-bold text-text-primary dark:text-gray-100">Appearance</h2>
               <p class="text-sm text-text-secondary">Customize how FlowState looks on your device.</p>
             </div>
             
             <div class="px-6 flex items-center justify-between">
                <div>
                  <h3 class="text-sm font-medium text-text-primary dark:text-gray-200">Dark Mode</h3>
                  <p class="text-xs text-text-secondary mt-1">Enable sleek dark theme globally.</p>
                </div>
                <mat-slide-toggle [checked]="isDarkMode" (change)="toggleTheme()"></mat-slide-toggle>
             </div>
           </div>

           <!-- Section 2 -->
           <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden pb-6">
             <div class="px-6 py-5 border-b border-gray-200 dark:border-white/5 mb-6">
               <h2 class="text-lg font-heading font-bold text-text-primary dark:text-gray-100">Security</h2>
               <p class="text-sm text-text-secondary">Update your account password.</p>
             </div>
             
             <form (ngSubmit)="updatePassword()" class="px-6 flex flex-col gap-4">
                
                <div class="flex flex-col gap-1.5">
                   <label class="text-sm font-medium text-text-primary dark:text-gray-200">Current Password</label>
                   <input [(ngModel)]="passwords.current" name="current" type="password" class="px-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-slate-800 text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow text-sm" placeholder="Enter current password" />
                </div>
                
                <div class="flex flex-col gap-1.5 mt-2">
                   <label class="text-sm font-medium text-text-primary dark:text-gray-200">New Password</label>
                   <input [(ngModel)]="passwords.new" name="new" type="password" class="px-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-slate-800 text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow text-sm" placeholder="At least 8 characters" />
                </div>
                
                <div class="flex items-center gap-4 mt-4">
                   <button mat-raised-button color="primary" type="submit" class="!rounded-lg !px-6 !py-2 !shadow-sm hover:!shadow-md transition-all !font-medium">Save Password</button>
                   
                   <span *ngIf="success" class="text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                     <mat-icon class="text-[16px] w-4 h-4">check_circle</mat-icon> {{ success }}
                   </span>
                   
                   <span *ngIf="error" class="text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                     <mat-icon class="text-[16px] w-4 h-4">error</mat-icon> {{ error }}
                   </span>
                </div>
             </form>
           </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class SettingsComponent {
  api = inject(ApiService);
  passwords = { current: '', new: '' };
  success = '';
  error = '';
  isDarkMode = document.documentElement.classList.contains('dark');

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  updatePassword() {
    this.success = '';
    this.error = '';
    this.api.post('/auth/password', this.passwords).subscribe({
      next: () => {
        this.success = 'Password updated successfully';
        this.passwords = { current: '', new: '' };
      },
      error: (res) => this.error = res.error?.error || 'Update failed'
    });
  }
}
