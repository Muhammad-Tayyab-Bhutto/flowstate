import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-sessions-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="max-w-7xl mx-auto w-full font-body">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 class="text-3xl font-heading font-bold tracking-tight text-text-primary dark:text-gray-100">Sessions</h1>
          <p class="text-text-secondary mt-1">Review past and currently active workflow autonomous runs.</p>
        </div>
        <button mat-raised-button color="primary" class="!rounded-lg !px-6 !py-2 !shadow-sm hover:!shadow-md transition-all !font-medium" (click)="startSession()">
          <div class="flex items-center gap-2"><mat-icon class="text-[20px] w-5 h-5">add</mat-icon> New Run</div>
        </button>
      </div>

      <!-- Sessions Table / List -->
      <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/5 rounded-2xl flex flex-col shadow-sm overflow-hidden mb-8">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-text-secondary font-body">
            <thead class="bg-gray-50 dark:bg-slate-800/50 text-xs uppercase text-gray-500 dark:text-gray-400 font-medium">
              <tr>
                <th class="px-6 py-4 font-semibold tracking-wider">Session Goal / ID</th>
                <th class="px-6 py-4 font-semibold tracking-wider">Status</th>
                <th class="px-6 py-4 font-semibold tracking-wider hidden sm:table-cell">Duration</th>
                <th class="px-6 py-4 font-semibold tracking-wider text-right">Started At</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-white/5">
              <tr *ngFor="let session of sessions" class="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer group" [routerLink]="['/dashboard/sessions', session.id]">
                <td class="px-6 py-4">
                   <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-xl border border-gray-200 dark:border-white/10 flex items-center justify-center bg-gray-50 dark:bg-slate-800 text-text-secondary group-hover:text-primary transition-colors">
                         <mat-icon class="text-[20px] w-5 h-5">psychology</mat-icon>
                      </div>
                      <div class="flex flex-col min-w-0">
                         <span class="font-medium text-text-primary dark:text-gray-200 truncate">{{ session.goal || 'No specific goal' }}</span>
                         <span class="text-xs text-text-secondary border border-gray-200 font-mono px-1.5 py-0.5 mt-1 rounded dark:border-white/10 truncate w-fit">{{ session.id.substring(0, 8) }}...</span>
                      </div>
                   </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                   <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold capitalize"
                         [ngClass]="{
                           'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400': session.status === 'completed',
                           'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400': session.status === 'failed',
                           'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400': session.status === 'running' || session.status === 'paused'
                         }">
                      <span *ngIf="session.status === 'running' || session.status === 'paused'" class="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                      {{ session.status }}
                   </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                   -- 
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-xs">
                   {{ session.created_at | date:'medium' }}
                </td>
              </tr>
              <!-- Empty State Fillers -->
               <tr *ngIf="sessions.length === 0 && !loading">
                 <td colspan="4" class="px-6 py-16 text-center text-text-secondary">
                    <div class="flex flex-col items-center justify-center">
                       <div class="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4">
                          <mat-icon class="text-[32px] w-8 h-8 text-gray-400">history</mat-icon>
                       </div>
                       <h3 class="text-lg font-medium text-text-primary dark:text-gray-200 mb-1">No sessions yet</h3>
                       <p class="text-sm">Start an agent session from your dashboard.</p>
                       <button mat-flat-button color="primary" class="!mt-4" (click)="startSession()">Start First Run</button>
                    </div>
                 </td>
               </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class SessionsListComponent implements OnInit {
  api = inject(ApiService);
  router = inject(Router);
  sessions: any[] = [];
  loading = true;

  ngOnInit() {
    this.api.get<{ data: any[] }>('/sessions').subscribe({
      next: res => { this.sessions = res.data; this.loading = false; },
      error: () => this.loading = false
    });
  }

  startSession() {
    this.api.post<{ data: any }>('/sessions', { goal: 'New Agent Session', max_actions: 15, initial_url: 'https://example.com' }).subscribe({
      next: (res) => this.router.navigate(['/dashboard/sessions', res.data.id])
    });
  }
}
