import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { ApiService } from '../../core/services/api.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, TranslateModule],
  template: `
    <div class="max-w-7xl mx-auto w-full font-body">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 class="text-3xl font-heading font-bold tracking-tight text-text-primary dark:text-gray-100">Overview</h1>
          <p class="text-text-secondary mt-1">Welcome back. Here's what's happening with your agents today.</p>
        </div>
        <button mat-raised-button color="primary" class="!rounded-lg !px-6 !py-2 !shadow-sm hover:!shadow-md hover:-translate-y-0.5 transition-all !font-medium" (click)="startSession()">
          <div class="flex items-center gap-2"><mat-icon class="text-[20px] w-5 h-5">play_arrow</mat-icon> New Agent Run</div>
        </button>
      </div>
      
      <!-- Metrics Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Metric 1 -->
        <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div class="flex justify-between items-center mb-4">
             <h3 class="text-sm font-medium text-text-secondary">Active Agents</h3>
             <div class="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-500/20 text-accent flex items-center justify-center">
                <mat-icon class="text-[18px] w-[18px] h-[18px]">smart_toy</mat-icon>
             </div>
          </div>
          <p class="text-3xl font-heading font-bold text-text-primary dark:text-gray-100">{{ usage?.active_agents || 0 }}</p>
          <p class="text-xs text-green-500 mt-2 flex items-center gap-1 font-medium"><mat-icon class="text-[14px] w-3.5 h-3.5">arrow_upward</mat-icon> 100% online</p>
        </div>
        
        <!-- Metric 2 -->
        <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div class="flex justify-between items-center mb-4">
             <h3 class="text-sm font-medium text-text-secondary">Tasks Completed</h3>
             <div class="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-primary/20 text-primary flex items-center justify-center">
                <mat-icon class="text-[18px] w-[18px] h-[18px]">task_alt</mat-icon>
             </div>
          </div>
          <p class="text-3xl font-heading font-bold text-text-primary dark:text-gray-100">{{ usage?.tasks_this_month || 0 }}</p>
          <p class="text-xs text-green-500 mt-2 flex items-center gap-1 font-medium"><mat-icon class="text-[14px] w-3.5 h-3.5">arrow_upward</mat-icon> +12% this week</p>
        </div>

        <!-- Metric 3 -->
        <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div class="flex justify-between items-center mb-4">
             <h3 class="text-sm font-medium text-text-secondary">Success Rate</h3>
             <div class="w-8 h-8 rounded-lg bg-purple-100 dark:bg-secondary/20 text-secondary flex items-center justify-center">
                <mat-icon class="text-[18px] w-[18px] h-[18px]">trending_up</mat-icon>
             </div>
          </div>
          <p class="text-3xl font-heading font-bold text-text-primary dark:text-gray-100">{{ usage?.success_rate || '0%' }}</p>
          <p class="text-xs text-text-secondary mt-2 flex items-center gap-1">Averaged across last 100 runs</p>
        </div>

        <!-- Metric 4 -->
        <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div class="flex justify-between items-center mb-4">
             <h3 class="text-sm font-medium text-text-secondary">Sessions Today</h3>
             <div class="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-500/20 text-amber-500 flex items-center justify-center">
                <mat-icon class="text-[18px] w-[18px] h-[18px]">calendar_today</mat-icon>
             </div>
          </div>
          <p class="text-3xl font-heading font-bold text-text-primary dark:text-gray-100">{{ usage?.sessions_today || 0 }}</p>
          <p class="text-xs text-text-secondary mt-2">2 currently running</p>
        </div>
      </div>

      <!-- Recent Sessions Table -->
      <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/5 rounded-2xl flex flex-col shadow-sm overflow-hidden">
        <div class="px-6 py-5 border-b border-gray-200 dark:border-white/5 flex justify-between items-center">
          <h2 class="text-lg font-heading font-bold text-text-primary dark:text-gray-100">Recent Agent Sessions</h2>
          <a routerLink="/dashboard/sessions" class="text-sm font-medium text-primary hover:text-primary-hover">View all</a>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-text-secondary font-body">
            <thead class="bg-gray-50 dark:bg-slate-800/50 text-xs uppercase text-gray-500 dark:text-gray-400 font-medium">
              <tr>
                <th class="px-6 py-4 font-semibold tracking-wider">Agent Name</th>
                <th class="px-6 py-4 font-semibold tracking-wider">Status</th>
                <th class="px-6 py-4 font-semibold tracking-wider">Actions</th>
                <th class="px-6 py-4 font-semibold tracking-wider hidden sm:table-cell">Success Rate</th>
                <th class="px-6 py-4 font-semibold tracking-wider text-right">Started At</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-white/5">
              <tr *ngFor="let session of sessions" class="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer" [routerLink]="['/dashboard/sessions', session.id]">
                <td class="px-6 py-4 whitespace-nowrap">
                   <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded border border-gray-200 dark:border-white/10 flex items-center justify-center bg-gray-50 dark:bg-slate-800">
                         <mat-icon class="text-[16px] w-4 h-4 text-primary">smart_toy</mat-icon>
                      </div>
                      <span class="font-medium text-text-primary dark:text-gray-200">{{ session.goal | slice:0:30 }}{{ session.goal.length > 30 ? '...' : '' }}</span>
                   </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                   <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold"
                         [ngClass]="{
                           'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400': session.status === 'completed',
                           'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400': session.status === 'failed',
                           'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400': session.status === 'running' || session.status === 'paused'
                         }">
                      <span *ngIf="session.status === 'running' || session.status === 'paused'" class="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                      {{ session.status | titlecase }}
                   </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-text-primary dark:text-gray-300">{{ session.max_actions || 15 }} acts</td>
                <td class="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                   <div class="flex items-center gap-2">
                      <div class="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1.5 max-w-[4rem]">
                         <div class="bg-accent h-1.5 rounded-full" style="width: 100%"></div>
                      </div>
                      <span class="text-xs">100%</span>
                   </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-xs">{{ session.created_at | date:'short' }}</td>
              </tr>
              <!-- Empty State Fillers -->
               <tr *ngIf="sessions.length === 0">
                 <td colspan="5" class="px-6 py-12 text-center text-text-secondary">
                    No recent sessions found. Start an agent run to see metrics here.
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
export class DashboardComponent implements OnInit {
  api = inject(ApiService);
  router = inject(Router);
  usage: any = null;
  sessions: any[] = [];

  ngOnInit() {
    this.api.get<{ data: any }>('/user/usage').subscribe({ next: res => this.usage = res.data, error: () => { } });
    this.api.get<{ data: any[] }>('/sessions?limit=5').subscribe({ next: res => this.sessions = res.data, error: () => { } });
  }

  startSession() {
    this.api.post<{ data: any }>('/sessions', { goal: 'New Agent Session', max_actions: 15, initial_url: 'https://example.com' }).subscribe({
      next: (res) => {
        this.router.navigate(['/dashboard/sessions', res.data.id]);
      }
    });
  }
}
