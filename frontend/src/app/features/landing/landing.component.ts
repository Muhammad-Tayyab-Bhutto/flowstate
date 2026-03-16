import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
    selector: 'app-landing',
    standalone: true,
    imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule],
    template: `
    <div class="min-h-screen bg-bg-light dark:bg-bg-dark text-text-primary dark:text-gray-100 overflow-hidden font-body selection:bg-primary selection:text-white">
      <!-- Navbar -->
      <nav class="absolute top-0 w-full z-50 px-6 py-6 lg:px-12 flex justify-between items-center max-w-7xl mx-auto left-0 right-0">
        <div class="flex items-center gap-2 text-2xl font-heading font-bold tracking-tight">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
            <span class="text-white text-lg">F</span>
          </div>
          <span>FlowState</span>
        </div>
        <div class="hidden md:flex gap-8 text-sm font-medium text-text-secondary dark:text-gray-400">
          <a href="#features" class="hover:text-primary transition-colors">Features</a>
          <a href="#how-it-works" class="hover:text-primary transition-colors">How it works</a>
          <a href="#" class="hover:text-primary transition-colors">Pricing</a>
        </div>
        <div class="flex items-center gap-4">
          <a routerLink="/login" class="text-sm font-medium text-text-secondary dark:text-gray-300 hover:text-primary transition-colors">Log in</a>
          <a routerLink="/signup" class="bg-primary hover:bg-indigo-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all shadow-md shadow-primary/20 hover:shadow-primary/40 active:scale-95">Get Started</a>
        </div>
      </nav>

      <!-- Hero Section -->
      <section class="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 lg:px-12 max-w-7xl mx-auto w-full flex flex-col items-center text-center">
        <!-- Floating Gradients -->
        <div class="absolute top-[10%] left-[20%] w-[30rem] h-[30rem] bg-primary/20 rounded-full blur-[100px] -z-10 animate-[blob_7s_infinite]"></div>
        <div class="absolute top-[20%] right-[20%] w-[25rem] h-[25rem] bg-secondary/20 rounded-full blur-[100px] -z-10 animate-[blob_7s_infinite_2s]"></div>
        <div class="absolute bottom-[20%] left-[40%] w-[35rem] h-[35rem] bg-accent/10 rounded-full blur-[100px] -z-10 animate-[blob_7s_infinite_4s]"></div>

        <div @fadeSlideUp class="max-w-4xl z-10">
          <h1 class="text-5xl lg:text-7xl font-heading font-extrabold tracking-tight leading-[1.1] mb-8">
            Autonomous AI Agents<br />
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">That Execute Your Workflows</span>
          </h1>
          <p class="text-lg lg:text-xl text-text-secondary dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed font-body">
            FlowState watches your screen, understands context, and completes tasks automatically. Delegate the repetitive work and get back to what matters.
          </p>
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a routerLink="/signup" class="group relative flex items-center justify-center gap-2 bg-text-primary dark:bg-white text-white dark:text-bg-dark text-base font-semibold px-8 py-4 rounded-xl w-full sm:w-auto shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all overflow-hidden duration-300">
              <span class="relative z-10 flex items-center gap-2">Start Free Trial <mat-icon class="text-[20px] h-[20px] w-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</mat-icon></span>
              <div class="absolute inset-0 bg-primary/10 dark:bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </a>
            <a href="#demo" class="flex items-center justify-center gap-2 bg-white/50 dark:bg-white/5 text-text-primary dark:text-white backdrop-blur-md border border-gray-200 dark:border-white/10 text-base font-semibold px-8 py-4 rounded-xl w-full sm:w-auto hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-300">
              <mat-icon class="text-[20px] h-[20px] w-[20px]">play_circle</mat-icon> View Demo
            </a>
          </div>
        </div>

        <!-- UI Preview Mockup -->
        <div @fadeZoom class="mt-20 lg:mt-24 w-full max-w-5xl rounded-2xl border border-gray-200 dark:border-white/10 bg-white/30 dark:bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden relative group">
           <div class="flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5">
              <div class="flex gap-1.5"><div class="w-3 h-3 rounded-full bg-red-400"></div><div class="w-3 h-3 rounded-full bg-amber-400"></div><div class="w-3 h-3 rounded-full bg-green-400"></div></div>
              <div class="mx-auto bg-gray-100 dark:bg-white/10 rounded-md px-4 py-1 text-xs text-text-secondary w-64 text-center truncate">app.flowstate.ai</div>
           </div>
           <div class="aspect-[16/9] w-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-bg-dark dark:to-slate-800 p-8 flex items-center justify-center relative">
              <div class="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white/20 to-transparent"></div>
              <!-- Mockup Content -->
              <div class="w-3/4 h-3/4 rounded-xl shadow-lg border border-gray-200/50 dark:border-white/10 bg-white dark:bg-slate-900 flex flex-col overflow-hidden relative">
                  <div class="h-12 border-b border-gray-100 dark:border-white/5 flex items-center px-4 bg-gray-50/50 dark:bg-white/5">
                    <div class="w-1/3 h-4 rounded-full bg-gray-200 dark:bg-white/10 animate-pulse"></div>
                  </div>
                  <div class="flex-1 flex p-4 gap-4">
                      <div class="w-48 h-full rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 p-4 flex flex-col gap-3">
                         <div class="w-full h-8 rounded-md bg-gray-200/50 dark:bg-white/10"></div>
                         <div class="w-3/4 h-8 rounded-md bg-gray-200/50 dark:bg-white/10 mt-4"></div>
                         <div class="w-2/3 h-8 rounded-md bg-gray-200/50 dark:bg-white/10"></div>
                      </div>
                      <div class="flex-1 flex flex-col gap-4">
                        <div class="h-24 w-full rounded-lg bg-primary/10 border border-primary/20 p-4 relative overflow-hidden">
                           <div class="absolute top-0 right-0 p-2"><mat-icon class="text-primary opacity-50">auto_awesome</mat-icon></div>
                           <div class="w-1/2 h-4 rounded-full bg-primary/30 mb-2"></div>
                           <div class="w-full h-2 rounded-full bg-primary/20"></div>
                        </div>
                        <div class="flex-1 rounded-lg border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 grid grid-cols-2 gap-4 p-4">
                           <div class="bg-white dark:bg-slate-800 rounded shadow-sm"></div>
                           <div class="bg-white dark:bg-slate-800 rounded shadow-sm"></div>
                           <div class="bg-white dark:bg-slate-800 rounded shadow-sm"></div>
                           <div class="bg-white dark:bg-slate-800 rounded shadow-sm"></div>
                        </div>
                      </div>
                  </div>
                  <!-- Agent Floating Action -->
                  <div class="absolute right-8 bottom-8 flex items-center gap-3 bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-xl border border-gray-200 dark:border-white/10 animate-bounce cursor-default">
                     <div class="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center">
                        <mat-icon>psychology</mat-icon>
                     </div>
                     <div class="pr-2">
                       <div class="text-xs text-text-secondary font-medium mb-0.5">FlowState Agent</div>
                       <div class="text-xs text-primary font-semibold flex items-center gap-1.5"><div class="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></div> Executing workflow...</div>
                     </div>
                  </div>
              </div>
           </div>
        </div>
      </section>

      <!-- Features Section -->
      <section id="features" class="py-24 px-6 lg:px-12 max-w-7xl mx-auto border-t border-gray-200 dark:border-white/5 relative">
        <div class="text-center max-w-3xl mx-auto mb-16">
          <h2 class="text-3xl lg:text-4xl font-heading font-bold mb-4">Supercharge your productivity</h2>
          <p class="text-lg text-text-secondary">Everything you need to automate your browser-based manual work.</p>
        </div>
        
        <div class="grid md:grid-cols-3 gap-8 relative z-10">
          <!-- Card 1 -->
          <div class="group bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-200 dark:border-white/10 relative overflow-hidden backdrop-blur-xl">
             <div class="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
             <div class="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                <mat-icon class="scale-150">visibility</mat-icon>
             </div>
             <h3 class="text-xl font-bold mb-3 font-heading">Visual UI Understanding</h3>
             <p class="text-text-secondary leading-relaxed">Agent analyzes screenshots and perfectly understands complex interface elements, nested forms, and dynamic content.</p>
          </div>
          <!-- Card 2 -->
          <div class="group bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-200 dark:border-white/10 relative overflow-hidden backdrop-blur-xl">
             <div class="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
             <div class="w-14 h-14 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center mb-6">
                <mat-icon class="scale-150">bolt</mat-icon>
             </div>
             <h3 class="text-xl font-bold mb-3 font-heading">Autonomous Execution</h3>
             <p class="text-text-secondary leading-relaxed">Agent performs multi-step workflows automatically, typing, clicking, and navigating just like a human.</p>
          </div>
          <!-- Card 3 -->
          <div class="group bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-200 dark:border-white/10 relative overflow-hidden backdrop-blur-xl">
             <div class="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
             <div class="w-14 h-14 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-6">
                <mat-icon class="scale-150">memory</mat-icon>
             </div>
             <h3 class="text-xl font-bold mb-3 font-heading">Workflow Memory</h3>
             <p class="text-text-secondary leading-relaxed">Agent saves successful paths, learning from your corrections to perfectly repeat complex tasks faster next time.</p>
          </div>
        </div>
      </section>

      <!-- How it Works Section -->
      <section id="how-it-works" class="py-24 px-6 lg:px-12 max-w-7xl mx-auto bg-gray-50/50 dark:bg-slate-900/50 rounded-3xl mb-24 relative overflow-hidden border border-gray-200/50 dark:border-white/5">
         <div class="text-center max-w-3xl mx-auto mb-16">
          <h2 class="text-3xl lg:text-4xl font-heading font-bold mb-4">How it works</h2>
          <p class="text-lg text-text-secondary">From command to completion in three simple steps.</p>
        </div>

        <div class="flex flex-col md:flex-row items-center justify-center gap-8 lg:gap-16 relative z-10 w-full max-w-5xl mx-auto px-4">
           <!-- Step 1 -->
           <div class="flex-1 flex flex-col items-center text-center relative w-full">
              <div class="w-20 h-20 rounded-2xl bg-white dark:bg-slate-800 shadow-lg border border-gray-200 dark:border-white/10 flex items-center justify-center mb-6 z-10 relative">
                 <span class="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-text-primary dark:bg-white text-white dark:text-bg-dark flex items-center justify-center font-bold font-heading shadow-md">1</span>
                 <mat-icon class="text-3xl text-primary">chat</mat-icon>
              </div>
              <h4 class="text-lg font-bold mb-2">Describe your goal</h4>
              <p class="text-sm text-text-secondary">Type what you want to achieve in plain English.</p>
           </div>

           <!-- Arrow -->
           <div class="hidden md:flex items-center justify-center w-24 text-gray-300 dark:text-gray-600">
              <mat-icon class="text-4xl animate-pulse">arrow_forward</mat-icon>
           </div>

           <!-- Step 2 -->
           <div class="flex-1 flex flex-col items-center text-center relative w-full">
              <div class="w-20 h-20 rounded-2xl bg-white dark:bg-slate-800 shadow-lg border border-gray-200 dark:border-white/10 flex items-center justify-center mb-6 z-10 relative">
                 <span class="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-text-primary dark:bg-white text-white dark:text-bg-dark flex items-center justify-center font-bold font-heading shadow-md">2</span>
                 <mat-icon class="text-3xl text-secondary">image_search</mat-icon>
              </div>
              <h4 class="text-lg font-bold mb-2">Agent analyzes interface</h4>
              <p class="text-sm text-text-secondary">Real-time computer vision parses the necessary steps.</p>
           </div>

           <!-- Arrow -->
           <div class="hidden md:flex items-center justify-center w-24 text-gray-300 dark:text-gray-600">
              <mat-icon class="text-4xl animate-pulse delay-150">arrow_forward</mat-icon>
           </div>

           <!-- Step 3 -->
           <div class="flex-1 flex flex-col items-center text-center relative w-full">
              <div class="w-20 h-20 rounded-2xl bg-white dark:bg-slate-800 shadow-lg border border-gray-200 dark:border-white/10 flex items-center justify-center mb-6 z-10 relative group">
                 <span class="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-text-primary dark:bg-white text-white dark:text-bg-dark flex items-center justify-center font-bold font-heading shadow-md">3</span>
                 <mat-icon class="text-3xl text-accent group-hover:rotate-180 transition-transform duration-700">task_alt</mat-icon>
              </div>
              <h4 class="text-lg font-bold mb-2">Executed automatically</h4>
              <p class="text-sm text-text-secondary">The workflow runs and completes asynchronously.</p>
           </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="border-t border-gray-200 dark:border-white/5 py-12 px-6 lg:px-12">
        <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
           <div class="flex items-center gap-2 text-xl font-heading font-bold">
              <div class="w-6 h-6 rounded-md bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span class="text-white text-xs">F</span>
              </div>
              <span>FlowState</span>
           </div>
           
           <div class="flex gap-6 text-sm text-text-secondary">
              <a href="#" class="hover:text-text-primary dark:hover:text-white transition-colors">Documentation</a>
              <a href="#" class="hover:text-text-primary dark:hover:text-white transition-colors">Privacy</a>
              <a href="#" class="hover:text-text-primary dark:hover:text-white transition-colors">Terms</a>
           </div>

           <div class="flex gap-4 text-text-secondary">
              <a href="#" class="hover:text-text-primary dark:hover:text-white transition-colors"><mat-icon>code</mat-icon></a>
           </div>
        </div>
      </footer>
    </div>
  `,
    animations: [
        trigger('fadeSlideUp', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(20px)' }),
                animate('0.8s cubic-bezier(0.16, 1, 0.3, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
            ])
        ]),
        trigger('fadeZoom', [
            transition(':enter', [
                style({ opacity: 0, transform: 'scale(0.95) translateY(20px)' }),
                animate('1s 0.2s cubic-bezier(0.16, 1, 0.3, 1)', style({ opacity: 1, transform: 'scale(1) translateY(0)' }))
            ])
        ])
    ]
})
export class LandingComponent { }
