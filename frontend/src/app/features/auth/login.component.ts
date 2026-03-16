import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
   selector: 'app-login',
   standalone: true,
   imports: [CommonModule, FormsModule, RouterModule, MatIconModule],
   template: `
    <div class="min-h-screen bg-bg-light dark:bg-bg-dark flex items-center justify-center p-4 font-body">
      <!-- Auth Card -->
      <div class="max-w-4xl w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-gray-200 dark:border-white/5 relative z-10">
        <!-- Left Side: Illustration / Branding -->
        <div class="w-full md:w-5/12 bg-gradient-to-br from-primary to-secondary p-12 text-white flex flex-col justify-between relative overflow-hidden hidden md:flex">
           <div class="absolute inset-0 bg-black/10"></div>
           <div class="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
           <div class="absolute bottom-12 right-12 w-48 h-48 bg-accent/20 rounded-full blur-2xl"></div>
           
           <div class="relative z-10">
              <div class="flex items-center gap-2 text-2xl font-heading font-bold mb-8 cursor-pointer" routerLink="/">
                <div class="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white">F</div>
                <span>FlowState</span>
              </div>
              <h2 class="text-3xl font-heading font-bold leading-tight mb-4">Welcome back to the future of work.</h2>
              <p class="text-white/80 leading-relaxed font-medium">Log in to monitor your agents, configure new workflows, and review autonomous sessions.</p>
           </div>
           
           <div class="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
              <div class="flex items-center gap-3 mb-2">
                 <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><mat-icon class="text-[18px] w-[18px] h-[18px]">verified_user</mat-icon></div>
                 <div class="text-sm font-medium">Secure Session</div>
              </div>
              <p class="text-xs text-white/70">End-to-end encrypted agent memory.</p>
           </div>
        </div>

        <!-- Right Side: Form -->
        <div class="w-full md:w-7/12 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-white dark:bg-slate-900">
           
           <div class="mb-8">
              <h2 class="text-3xl font-heading font-bold text-text-primary dark:text-gray-100 mb-2">Log in</h2>
              <p class="text-text-secondary">Don't have an account? <a routerLink="/register" class="text-primary font-semibold hover:text-primary-hover transition-colors">Sign up</a></p>
           </div>

           <form (ngSubmit)="onSubmit()" class="flex flex-col gap-5 relative group" #loginForm="ngForm">
              
              <div *ngIf="sessionExpired" class="bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 p-3 rounded-lg text-sm font-medium flex items-center gap-2 border border-amber-200 dark:border-amber-500/20">
                 <mat-icon class="text-[18px] w-[18px] h-[18px]">timer_off</mat-icon> Your session expired. Please sign in again.
              </div>

              <div *ngIf="error" class="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm font-medium flex items-center gap-2 border border-red-200 dark:border-red-500/20">
                 <mat-icon class="text-[18px] w-[18px] h-[18px]">error_outline</mat-icon> {{ error }}
              </div>

              <!-- Email Field -->
              <div class="relative">
                 <label class="block text-sm font-medium text-text-primary dark:text-gray-300 mb-1.5">Email Address</label>
                 <div class="relative flex items-center group-focus-within:text-primary">
                    <mat-icon class="absolute left-3 text-gray-400 text-[20px] w-5 h-5 pointer-events-none transition-colors">mail_outline</mat-icon>
                    <input [(ngModel)]="credentials.email" name="email" type="email" required placeholder="you@example.com"
                           class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-slate-800 text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all dark:focus:bg-slate-900" />
                 </div>
              </div>

              <!-- Password Field -->
              <div class="relative">
                 <div class="flex justify-between items-center mb-1.5">
                    <label class="block text-sm font-medium text-text-primary dark:text-gray-300">Password</label>
                    <a href="#" class="text-xs font-semibold text-primary hover:text-indigo-700 transition-colors">Forgot password?</a>
                 </div>
                 <div class="relative flex items-center group-focus-within:text-primary">
                    <mat-icon class="absolute left-3 text-gray-400 text-[20px] w-5 h-5 pointer-events-none transition-colors">lock_outline</mat-icon>
                    <input [(ngModel)]="credentials.password" name="password" type="password" required placeholder="••••••••"
                           class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-slate-800 text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all dark:focus:bg-slate-900" />
                 </div>
              </div>

              <!-- Remember Me -->
              <div class="flex items-center gap-2 mt-1">
                 <input type="checkbox" id="remember" class="w-4 h-4 rounded text-primary border-gray-300 focus:ring-primary dark:border-white/20 dark:bg-slate-800" />
                 <label for="remember" class="text-sm font-medium text-text-secondary cursor-pointer border-none">Remember me for 30 days</label>
              </div>

              <!-- Submit -->
              <button type="submit" [disabled]="!loginForm.form.valid || loading"
                      class="mt-4 w-full bg-primary hover:bg-indigo-600 disabled:bg-primary/50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-all shadow-md shadow-primary/20 hover:shadow-primary/40 active:scale-[0.98] flex items-center justify-center gap-2">
                 <mat-icon *ngIf="loading" class="animate-spin text-[20px] w-5 h-5">refresh</mat-icon>
                 {{ loading ? 'Signing in...' : 'Sign in' }}
              </button>

              <div class="mt-6 flex items-center justify-center relative">
                 <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-gray-200 dark:border-white/10"></div></div>
                 <div class="relative px-4 bg-white dark:bg-slate-900 text-xs text-text-secondary uppercase font-semibold">Or continue with</div>
              </div>

              <div class="grid grid-cols-2 gap-4 mt-6">
                 <button type="button" class="flex items-center justify-center gap-2 py-2.5 border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-800 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-sm font-medium text-text-primary dark:text-gray-200">
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" class="w-5 h-5" alt="Google" /> Google
                 </button>
                 <button type="button" class="flex items-center justify-center gap-2 py-2.5 border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-800 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-sm font-medium text-text-primary dark:text-gray-200">
                    <mat-icon class="text-[20px] w-5 h-5">code</mat-icon> GitHub
                 </button>
              </div>
           </form>
        </div>
      </div>
      
      <!-- Background Ambient Glow -->
      <div class="fixed top-0 inset-x-0 h-[40rem] -z-10 pointer-events-none opacity-40 mix-blend-multiply dark:mix-blend-screen overflow-hidden">
         <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60rem] h-[30rem] bg-indigo-50 dark:bg-primary/5 rounded-[100%] blur-[120px]"></div>
      </div>
    </div>
  `,
   styles: []
})
export class LoginComponent implements OnInit {
   authService = inject(AuthService);
   router = inject(Router);
   route = inject(ActivatedRoute);

   credentials = { email: '', password: '' };
   error = '';
   loading = false;
   sessionExpired = false;

   ngOnInit() {
      const reason = this.route.snapshot.queryParamMap.get('reason');
      this.sessionExpired = reason === 'session_expired';
   }

   onSubmit() {
      this.error = '';
      this.loading = true;
      this.authService.login(this.credentials).subscribe({
         next: () => {
            this.loading = false;
            this.router.navigate(['/dashboard']);
         },
         error: err => {
            this.loading = false;
            this.error = err.error?.error || 'Login failed';
         }
      });
   }
}
