import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';

@Component({
   selector: 'app-dashboard-layout',
   standalone: true,
   imports: [CommonModule, RouterModule, MatIconModule],
   template: `
    <div class="min-h-screen bg-bg-light dark:bg-bg-dark text-text-primary dark:text-gray-100 flex font-body">
      
      <!-- Sidebar -->
      <aside class="w-64 flex-shrink-0 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-white/5 flex flex-col h-screen sticky top-0">
        <!-- Brand -->
        <div class="h-16 flex items-center px-6 border-b border-gray-200 dark:border-white/5">
           <div class="flex items-center gap-2 text-xl font-heading font-bold cursor-pointer" routerLink="/">
              <div class="w-7 h-7 rounded-md bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md">
                <span class="text-white text-sm">F</span>
              </div>
              <span>FlowState</span>
           </div>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1">
           <a routerLink="/dashboard" routerLinkActive="bg-primary/10 text-primary dark:bg-primary/20" [routerLinkActiveOptions]="{exact: true}" class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-gray-50 dark:hover:bg-white/5 hover:text-text-primary dark:hover:text-white transition-colors">
              <mat-icon class="text-[20px] w-5 h-5">grid_view</mat-icon> Dashboard
           </a>
           <a routerLink="/dashboard/agents" routerLinkActive="bg-primary/10 text-primary dark:bg-primary/20" class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-gray-50 dark:hover:bg-white/5 hover:text-text-primary dark:hover:text-white transition-colors">
              <mat-icon class="text-[20px] w-5 h-5">smart_toy</mat-icon> Agents
           </a>
           <a routerLink="/dashboard/jobs" routerLinkActive="bg-primary/10 text-primary dark:bg-primary/20" class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-gray-50 dark:hover:bg-white/5 hover:text-text-primary dark:hover:text-white transition-colors">
              <mat-icon class="text-[20px] w-5 h-5">work</mat-icon> Job Matches
           </a>
           <a routerLink="/dashboard/sessions" routerLinkActive="bg-primary/10 text-primary dark:bg-primary/20" class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-gray-50 dark:hover:bg-white/5 hover:text-text-primary dark:hover:text-white transition-colors">
              <mat-icon class="text-[20px] w-5 h-5">list_alt</mat-icon> Sessions
           </a>
           
           <div class="mt-8 mb-2 px-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Settings</div>
           
           <a routerLink="/dashboard/profile" routerLinkActive="bg-primary/10 text-primary dark:bg-primary/20" class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-gray-50 dark:hover:bg-white/5 hover:text-text-primary dark:hover:text-white transition-colors">
              <mat-icon class="text-[20px] w-5 h-5">person_outline</mat-icon> Profile
           </a>
           <a routerLink="/dashboard/settings" routerLinkActive="bg-primary/10 text-primary dark:bg-primary/20" class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-gray-50 dark:hover:bg-white/5 hover:text-text-primary dark:hover:text-white transition-colors">
              <mat-icon class="text-[20px] w-5 h-5">settings</mat-icon> Preferences
           </a>
        </nav>

        <!-- User Profile Footer -->
        <div class="p-4 border-t border-gray-200 dark:border-white/5">
           <div class="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors" *ngIf="auth.currentUser$ | async as user">
              <div class="w-9 h-9 rounded-full bg-gradient-to-tr from-accent to-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-inner">
                 {{ user.name ? user.name.charAt(0).toUpperCase() : 'U' }}
              </div>
              <div class="flex-1 min-w-0">
                 <p class="text-sm font-medium text-text-primary dark:text-gray-200 truncate">{{ user.name }}</p>
                 <p class="text-xs text-text-secondary truncate">{{ user.email }}</p>
              </div>
           </div>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="flex-1 flex flex-col min-h-screen overflow-hidden bg-bg-light dark:bg-bg-dark relative">
        <!-- Top Navbar -->
        <header class="h-16 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-b border-gray-200 dark:border-white/5 flex justify-between items-center px-8 z-10 sticky top-0">
           <div class="flex-1 flex items-center">
              <!-- Search Bar -->
              <div class="relative w-64 md:w-96 hidden sm:block group">
                 <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 text-[20px]">search</mat-icon>
                 <input type="text" placeholder="Search agents, sessions..." class="w-full bg-gray-100 dark:bg-slate-800 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-shadow text-text-primary dark:text-white placeholder-gray-400 min-h-[36px]" />
              </div>
           </div>
           
           <div class="flex items-center gap-4">
              <button class="relative p-2 text-gray-400 hover:text-text-primary dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-white/5">
                 <mat-icon class="text-[20px] w-5 h-5">notifications_none</mat-icon>
                 <span class="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent border-[1.5px] border-white dark:border-slate-900"></span>
              </button>
              <div class="h-6 w-px bg-gray-200 dark:bg-white/10 mx-1"></div>
              <button class="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-white/5 p-1 pr-2 rounded-full transition-colors" (click)="logout()">
                 <mat-icon class="text-[20px] w-5 h-5 text-gray-400">logout</mat-icon>
                 <span class="text-sm font-medium hidden sm:block text-text-secondary">Logout</span>
              </button>
           </div>
        </header>

        <!-- Page Content -->
        <div class="flex-1 overflow-x-hidden overflow-y-auto p-8 relative">
           <!-- Subtle background gradient overlay -->
           <div class="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none -z-10"></div>
           
           <!-- Active Route Injection -->
           <router-outlet></router-outlet>
        </div>
      </main>

    </div>
  `,
   styles: []
})
export class DashboardLayoutComponent {
   auth = inject(AuthService);
   router = inject(Router);

   logout() {
      this.auth.logout().subscribe({
         next: () => this.router.navigate(['/login'])
      });
   }
}
