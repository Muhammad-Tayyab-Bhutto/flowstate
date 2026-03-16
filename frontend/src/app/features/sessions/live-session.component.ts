import { Component, inject, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AgentStreamService, TimelineStep, TimelineStepType } from '../../core/services/agent-stream.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

const PLAYWRIGHT_HTTP_URL = 'http://localhost:3002';

@Component({
  selector: 'app-live-session',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, RouterModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="max-w-7xl mx-auto w-full font-body" *ngIf="agent.state$ | async as state">
      
      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <div class="flex items-center gap-3 mb-1">
             <a routerLink="/dashboard/sessions" class="text-text-secondary hover:text-primary transition-colors flex items-center">
               <mat-icon class="text-[20px] w-5 h-5">arrow_back</mat-icon>
             </a>
             <h1 class="text-2xl font-heading font-bold tracking-tight text-text-primary dark:text-gray-100 flex items-center gap-3">
               Live Agent Stream
               <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold capitalize"
                     [ngClass]="{
                       'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400': state.status === 'completed',
                       'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400': state.status === 'failed' || state.status === 'error',
                       'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400': state.status === 'paused',
                       'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400': state.status === 'running'
                     }">
                  <span *ngIf="state.status === 'running'" class="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                  <span *ngIf="state.status === 'paused'" class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                  {{ state.status }}
               </span>
             </h1>
          </div>
          <p class="text-text-secondary text-sm ml-8">
            <span *ngIf="interactiveMode" class="text-amber-600 font-semibold">🖱️ Interactive Mode — You are controlling the browser</span>
            <span *ngIf="!interactiveMode">Monitoring real-time workflow autonomous execution.</span>
          </p>
        </div>
        
        <div class="flex items-center gap-3">
          <!-- Interactive Mode Toggle -->
          <button *ngIf="state.sessionId && (state.status === 'running' || state.status === 'paused')"
            (click)="toggleInteractiveMode(state.sessionId)"
            class="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors text-sm border"
            [ngClass]="interactiveMode
              ? 'bg-amber-500 text-white border-amber-600 hover:bg-amber-600'
              : 'bg-white dark:bg-slate-800 text-text-secondary border-gray-200 dark:border-white/10 hover:border-amber-400 hover:text-amber-600'">
            <mat-icon class="text-[18px] w-[18px] h-[18px]">{{ interactiveMode ? 'mouse' : 'touch_app' }}</mat-icon>
            {{ interactiveMode ? 'Interactive Mode ON' : 'Take Control' }}
          </button>

          <div class="flex items-center gap-3" *ngIf="state.status === 'running' || state.status === 'paused'">
            <button *ngIf="state.status === 'running'" class="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 dark:text-amber-500 font-medium transition-colors text-sm" (click)="agent.pause()">
              <mat-icon class="text-[18px] w-[18px] h-[18px]">pause</mat-icon> Pause Agent
            </button>
            <button *ngIf="state.status === 'paused' && !state.userPrompt && !state.fieldPrompt" class="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 text-green-600 hover:bg-green-500/20 dark:text-accent font-medium transition-colors text-sm" (click)="agent.resume()">
              <mat-icon class="text-[18px] w-[18px] h-[18px]">play_arrow</mat-icon> Resume Agent
            </button>
            <button class="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500/20 dark:text-red-400 font-medium transition-colors text-sm" (click)="agent.cancel()">
              <mat-icon class="text-[18px] w-[18px] h-[18px]">stop</mat-icon> Terminate
            </button>
          </div>
        </div>
      </div>


      <!-- ============================================================ -->
      <!-- FIELD PROMPT PANEL — Agent needs a missing profile field      -->
      <!-- ============================================================ -->
      <div *ngIf="state.fieldPrompt" class="mb-6 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-300 dark:border-indigo-500/30 rounded-2xl shadow-md overflow-hidden">
        <div class="px-5 pt-5 pb-4">
          <div class="flex items-start gap-3 mb-4">
            <div class="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
              <mat-icon class="text-indigo-600 dark:text-indigo-400 text-[22px] w-[22px] h-[22px]">person_search</mat-icon>
            </div>
            <div class="flex-1">
              <p class="font-bold text-indigo-800 dark:text-indigo-300 text-sm mb-0.5">
                Agent needs: <span class="bg-indigo-100 dark:bg-indigo-900/60 px-2 py-0.5 rounded-md">{{ state.fieldPrompt.field_label }}</span>
              </p>
              <p class="text-indigo-700 dark:text-indigo-400 text-sm leading-relaxed">{{ state.fieldPrompt.message }}</p>
            </div>
          </div>

          <div class="flex flex-col gap-3">
            <input type="text" [(ngModel)]="fieldValue"
              [placeholder]="'Enter ' + state.fieldPrompt.field_label + (state.fieldPrompt.existing_value ? ' (current: ' + state.fieldPrompt.existing_value + ')' : '')"
              (keydown.enter)="submitFieldValue(state)"
              class="w-full px-4 py-2.5 rounded-xl border border-indigo-300 dark:border-indigo-500/40 bg-white dark:bg-slate-800 text-text-primary dark:text-gray-100 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/50" />

            <div class="flex items-center justify-between">
              <label class="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" [(ngModel)]="saveToProfile" class="w-4 h-4 accent-indigo-600 rounded" />
                <span class="text-sm text-indigo-700 dark:text-indigo-400">
                  {{ state.fieldPrompt.existing_value ? 'Update in my profile' : 'Save to my profile for future use' }}
                </span>
              </label>
              <button (click)="submitFieldValue(state)" [disabled]="!fieldValue.trim()"
                class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-sm">
                <mat-icon class="text-[18px] w-[18px] h-[18px]">arrow_forward</mat-icon>
                Continue
              </button>
            </div>
          </div>
        </div>
        <!-- Saved confirmation bar -->
        <div *ngIf="state.fieldSavedMessage" class="px-5 py-2.5 bg-green-500/10 border-t border-green-500/20 flex items-center gap-2 text-green-700 dark:text-green-400 text-sm">
          <mat-icon class="text-[16px] w-4 h-4">check_circle</mat-icon> {{ state.fieldSavedMessage }}
        </div>
      </div>

      <!-- ============================================================ -->
      <!-- OBSTACLE PANEL — CAPTCHA / Login Wall / Security Check       -->
      <!-- ============================================================ -->
      <div *ngIf="state.userPrompt" class="mb-6 bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 rounded-2xl p-5 shadow-sm">
        <div class="flex items-start gap-3 mb-4">
          <div class="w-9 h-9 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <mat-icon class="text-amber-600 dark:text-amber-400 text-[20px] w-5 h-5">
              {{ state.obstacleType === 'captcha' ? 'security' : state.obstacleType === 'login_wall' ? 'lock' : 'pan_tool' }}
            </mat-icon>
          </div>
          <div>
            <p class="font-semibold text-amber-800 dark:text-amber-300 text-sm mb-1">
              {{ state.obstacleType === 'captcha' ? '🤖 CAPTCHA Required' : state.obstacleType === 'login_wall' ? '🔐 Login Required' : '🛑 Agent Needs Your Help' }}
            </p>
            <p class="text-amber-700 dark:text-amber-400 text-sm leading-relaxed">{{ state.userPrompt }}</p>
            <p class="text-amber-600 dark:text-amber-500 text-xs mt-1 italic">Complete the action in the browser above, then click "I'm Done" below.</p>
          </div>
        </div>
        <div class="flex gap-3 mt-3">
          <input type="text" [(ngModel)]="replyText" (keydown.enter)="sendReply()"
            placeholder='Optional: add a note or type "done" and press Enter'
            class="flex-1 px-4 py-2.5 rounded-xl border border-amber-300 dark:border-amber-500/40 bg-white dark:bg-slate-800 text-text-primary dark:text-gray-100 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50" />
          <button (click)="sendReply()"
            class="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-2">
            <mat-icon class="text-[18px] w-[18px] h-[18px]">check</mat-icon> I'm Done — Resume
          </button>
        </div>
      </div>

      <!-- Field saved snackbar (shown even outside prompt context) -->
      <div *ngIf="state.fieldSavedMessage && !state.fieldPrompt"
           class="mb-4 px-4 py-3 bg-green-50 dark:bg-green-500/10 border border-green-300 dark:border-green-500/30 rounded-xl flex items-center gap-2 text-green-700 dark:text-green-400 text-sm">
        <mat-icon class="text-[16px] w-4 h-4">check_circle</mat-icon> {{ state.fieldSavedMessage }}
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Browser View -->
        <div class="lg:col-span-2 flex flex-col gap-6">
          <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden flex flex-col"
               [style.height]="'600px'">
            <!-- Browser Chrome Bar -->
            <div class="px-3 py-2.5 border-b border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-slate-800/50 flex items-center justify-between flex-shrink-0 gap-2">
               <div class="flex items-center gap-2 min-w-0">
                 <div class="flex gap-1.5 flex-shrink-0">
                   <div class="w-3 h-3 rounded-full bg-red-400"></div>
                   <div class="w-3 h-3 rounded-full bg-amber-400"></div>
                   <div class="w-3 h-3 rounded-full bg-green-400"></div>
                 </div>
                 <div class="ml-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded px-3 py-1 text-xs text-text-secondary font-medium min-w-0 flex-1 truncate shadow-sm flex items-center gap-1.5">
                    <mat-icon class="text-[13px] w-3.5 h-3.5 flex-shrink-0">lock</mat-icon>
                    <span class="truncate">{{ state.perception?.page_url || currentUrl || 'Initializing browser...' }}</span>
                 </div>
               </div>
                <div class="flex items-center gap-3 flex-shrink-0">
                 <!-- Interactive Control Button -->
                 <button *ngIf="!interactiveMode"
                   (click)="toggleInteractiveMode(state.sessionId)"
                   class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/30 transition-all shadow-sm">
                   <mat-icon class="text-[16px] w-4 h-4">pan_tool</mat-icon>
                   Take Control
                 </button>
                 <button *ngIf="interactiveMode"
                   (click)="toggleInteractiveMode(state.sessionId)"
                   class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-green-50 dark:bg-green-500/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-500/30 transition-all shadow-sm ring-2 ring-green-500 ring-offset-1 dark:ring-offset-slate-900 animate-pulse">
                   <mat-icon class="text-[16px] w-4 h-4">touch_app</mat-icon>
                   You Have Control
                 </button>
                 
                 <div class="h-4 w-px bg-gray-300 dark:bg-slate-700"></div>

                 <!-- Fullscreen button -->
                 <button (click)="toggleFullscreen()" title="View Fullscreen Canvas" class="text-gray-400 hover:text-primary transition-colors p-1">
                   <mat-icon class="text-[18px] w-[18px] h-[18px]">fullscreen</mat-icon>
                 </button>
               </div>
            </div>
            
            <!-- Interactive Canvas Viewport -->
            <div class="flex-1 bg-gray-950 relative overflow-hidden" #canvasContainer>
              <canvas #browserCanvas
                class="absolute inset-0 w-full h-full object-contain"
                [class.cursor-default]="!interactiveMode"
                [class.cursor-crosshair]="interactiveMode"
                [style.pointer-events]="interactiveMode ? 'all' : 'none'"
                (click)="onCanvasClick($event, state.sessionId)"
                (mousemove)="onCanvasMouseMove($event, state.sessionId)"
                (wheel)="onCanvasWheel($event, state.sessionId)"
                (keydown)="onCanvasKeydown($event, state.sessionId)"
                [attr.tabindex]="interactiveMode ? '0' : '-1'">
              </canvas>

              <!-- Loading overlay -->
              <div *ngIf="!hasFrame" class="absolute inset-0 flex flex-col items-center justify-center text-text-secondary gap-4">
                <mat-spinner diameter="40" class="!stroke-primary opacity-50"></mat-spinner>
                <p class="text-sm font-medium text-gray-400">Connecting to live browser stream...</p>
              </div>

              <!-- Page title pill -->
              <div *ngIf="hasFrame && currentPageTitle" class="absolute bottom-16 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur text-white px-4 py-2 text-sm font-medium rounded-full shadow-lg border border-white/10 flex items-center gap-2 z-10 pointer-events-none">
                 <mat-icon class="text-[16px] w-4 h-4 text-accent">center_focus_strong</mat-icon>
                 {{ currentPageTitle }}
              </div>

              <!-- Interactive mode: type text input bar -->
              <div *ngIf="interactiveMode" class="absolute bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur border-t border-slate-700 px-3 py-2.5 z-20 flex gap-2 items-center">
                <mat-icon class="text-amber-400 text-[18px] w-[18px] h-[18px] flex-shrink-0">keyboard</mat-icon>
                <input type="text" [(ngModel)]="interactiveTypeText"
                  placeholder="Type here → forwards to browser...  (Enter = press Enter in browser)"
                  (keydown)="onInteractiveKeydown($event, state.sessionId)"
                  class="flex-1 bg-transparent text-white placeholder-slate-500 text-sm outline-none"
                  id="interactive-type-input" />
              </div>

              <!-- Watch mode hint -->
              <div *ngIf="!interactiveMode && hasFrame" class="absolute bottom-4 right-4 bg-slate-900/70 backdrop-blur text-white/50 px-3 py-1.5 text-xs rounded-lg pointer-events-none">
                Agent is in control
              </div>
            </div>
          </div>
        </div>

        <!-- ====================================================== -->
        <!-- Sidebar: Timeline + Confidence + Thoughts               -->
        <!-- ====================================================== -->
        <div class="lg:col-span-1 flex flex-col gap-4 h-[600px]">

          <!-- ── Confidence Score Widget ────────────────────────── -->
          <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/5 rounded-2xl shadow-sm p-4 flex-shrink-0">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <mat-icon class="text-violet-500 text-[18px] w-[18px] h-[18px]">track_changes</mat-icon>
                <span class="font-bold text-sm text-text-primary dark:text-gray-100">Agent Confidence</span>
              </div>
              <!-- Platform Badge -->
              <span *ngIf="state.detectedPlatform"
                class="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 flex items-center gap-1">
                <mat-icon class="text-[12px] w-3 h-3">work</mat-icon>
                {{ state.detectedPlatform }}
              </span>
            </div>
            <!-- Confidence Bar -->
            <div class="flex items-center gap-3">
              <div class="flex-1 h-2.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div class="h-full rounded-full transition-all duration-500"
                  [style.width]="((state.currentConfidence ?? 0) * 100) + '%'"
                  [ngClass]="{
                    'bg-green-500': (state.currentConfidence ?? 0) >= 0.8,
                    'bg-amber-400': (state.currentConfidence ?? 0) >= 0.5 && (state.currentConfidence ?? 0) < 0.8,
                    'bg-red-400':   (state.currentConfidence ?? 0) < 0.5 && state.currentConfidence !== null,
                    'bg-gray-300 dark:bg-slate-700': state.currentConfidence === null
                  }">
                </div>
              </div>
              <span class="text-sm font-mono font-bold min-w-[3.5rem] text-right"
                [ngClass]="{
                  'text-green-600 dark:text-green-400': (state.currentConfidence ?? 0) >= 0.8,
                  'text-amber-600 dark:text-amber-400': (state.currentConfidence ?? 0) >= 0.5 && (state.currentConfidence ?? 0) < 0.8,
                  'text-red-600 dark:text-red-400':     (state.currentConfidence ?? 0) < 0.5 && state.currentConfidence !== null,
                  'text-gray-400':                       state.currentConfidence === null
                }">
                {{ state.currentConfidence !== null ? ((state.currentConfidence * 100) | number:'1.0-0') + '%' : '—' }}
              </span>
            </div>
            <!-- Task count summary -->
            <div class="flex gap-3 mt-3 text-xs text-text-secondary">
              <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-green-400"></span>{{ getSuccessCount(state.tasks) }} passed</span>
              <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-red-400"></span>{{ getFailCount(state.tasks) }} failed</span>
              <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>{{ state.tasks.length }} total</span>
            </div>
          </div>

          <!-- ── Agent Reasoning Timeline ────────────────────────── -->
          <div class="flex-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/5 rounded-2xl shadow-sm flex flex-col overflow-hidden min-h-0">
            <div class="px-4 py-3 border-b border-gray-200 dark:border-white/5 flex items-center justify-between flex-shrink-0">
              <div class="flex items-center gap-2">
                <mat-icon class="text-primary text-[18px] w-[18px] h-[18px]">timeline</mat-icon>
                <h3 class="font-bold text-sm text-text-primary dark:text-gray-100">Agent Reasoning</h3>
              </div>
              <div *ngIf="state.status === 'running'" class="flex items-center gap-1.5 text-xs text-primary animate-pulse">
                <span class="w-1.5 h-1.5 rounded-full bg-primary"></span> Live
              </div>
            </div>
            <div class="flex-1 p-3 overflow-y-auto space-y-1 timeline-scroll" #timelineContainer>
              <p *ngIf="state.timeline.length === 0" class="text-xs text-text-secondary p-2 italic">Initializing agent...</p>
              <div *ngFor="let step of state.timeline; trackBy: trackStep"
                class="flex gap-2.5 items-start py-1.5 px-2 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-white/5 group">
                <!-- Step Icon -->
                <div class="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  [ngClass]="getStepBg(step.type)">
                  <mat-icon class="!text-[13px] !w-[13px] !h-[13px]" [ngClass]="getStepColor(step.type)">
                    {{ getStepIcon(step.type) }}
                  </mat-icon>
                </div>
                <!-- Step Content -->
                <div class="flex-1 min-w-0">
                  <p class="text-xs leading-snug text-text-primary dark:text-gray-200 break-words">{{ step.message }}</p>
                  <div class="flex items-center gap-2 mt-0.5">
                    <span class="text-[10px] uppercase tracking-wide font-semibold" [ngClass]="getStepColor(step.type)">
                      {{ getStepLabel(step.type) }}
                    </span>
                    <span *ngIf="step.confidence" class="text-[10px] text-text-secondary font-mono">
                      {{ (step.confidence * 100) | number:'1.0-0' }}% conf
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ── Internal Neural Terminal ────────────────────────── -->
          <div class="h-[130px] bg-slate-900 border border-slate-700 rounded-2xl flex flex-col overflow-hidden flex-shrink-0">
            <div class="px-3 py-2 border-b border-slate-800 flex justify-between items-center">
              <div class="flex items-center gap-1.5 font-mono text-[10px] font-semibold text-slate-400">
                <mat-icon class="text-[12px] w-3 h-3">terminal</mat-icon> NEURAL LOG
              </div>
              <div class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
            </div>
            <div class="flex-1 p-2 overflow-y-auto font-mono text-[10px] text-slate-500 space-y-0.5">
              <p *ngIf="state.thoughts.length === 0" class="text-slate-700 italic">kernel> standby...</p>
              <div *ngFor="let t of state.thoughts" class="border-l border-slate-800 pl-2">
                <span class="text-primary mr-1">›</span>{{ t }}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    canvas { display: block; }
    .timeline-scroll { scroll-behavior: smooth; }
  `]
})
export class LiveSessionComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('browserCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasContainer') containerRef!: ElementRef<HTMLDivElement>;

  agent = inject(AgentStreamService);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  replyText = '';
  /** Current value being entered by user for a field prompt */
  fieldValue = '';
  /** Whether user wants to save the field value to their profile */
  saveToProfile = true;
  interactiveMode = false;
  /** Text typed in the interactive keyboard overlay — forwarded char by char to playwright */
  interactiveTypeText = '';
  hasFrame = false;
  currentUrl = '';
  currentPageTitle = '';

  private sessionId: string | null = null;
  private eventSource: EventSource | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private stateSubscription: any;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.sessionId = id;
      this.agent.startSession(id);
    }
    // Watch for URL/title updates from perception
    this.stateSubscription = this.agent.state$.subscribe(state => {
      if (state.perception?.page_url) this.currentUrl = state.perception.page_url;
      if (state.perception?.page_title) this.currentPageTitle = state.perception.page_title;
      this.cdr.markForCheck();
    });
  }

  ngAfterViewInit() {
    this.ctx = this.canvasRef.nativeElement.getContext('2d');
    if (this.sessionId) {
      this.connectToStream(this.sessionId);
    }
  }

  ngOnDestroy() {
    this.eventSource?.close();
    this.stateSubscription?.unsubscribe();
    this.agent.disconnect();
  }

  private connectToStream(sessionId: string) {
    this.eventSource?.close();
    const url = `${PLAYWRIGHT_HTTP_URL}/stream/${sessionId}`;
    this.eventSource = new EventSource(url);

    this.eventSource.onmessage = (event) => {
      const b64 = event.data as string;
      if (!b64) return;
      const img = new Image();
      img.onload = () => {
        const canvas = this.canvasRef?.nativeElement;
        const container = this.containerRef?.nativeElement;
        if (!canvas || !this.ctx || !container) { return; }

        // Resize canvas to container dimensions
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;

        // Draw image scaled to fit
        const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
        const drawW = img.width * scale;
        const drawH = img.height * scale;
        const offsetX = (canvas.width - drawW) / 2;
        const offsetY = (canvas.height - drawH) / 2;

        this.lastDrawInfo = { offsetX, offsetY, drawW, drawH };

        this.ctx!.clearRect(0, 0, canvas.width, canvas.height);
        this.ctx!.drawImage(img, offsetX, offsetY, drawW, drawH);

        if (!this.hasFrame) {
          this.hasFrame = true;
          this.cdr.markForCheck();
        }
      };
      img.src = `data:image/jpeg;base64,${b64}`;
    };

    this.eventSource.onerror = () => {
      // Retry after 2s if session is still active
      this.eventSource?.close();
      setTimeout(() => {
        if (this.sessionId && this.agent.state.status !== 'idle') {
          this.connectToStream(this.sessionId);
        }
      }, 2000);
    };
  }

  toggleInteractiveMode(sessionId: string | null) {
    this.interactiveMode = !this.interactiveMode;
    if (this.interactiveMode && sessionId) {
      // Pause the agent when user takes control
      if (this.agent.state.status === 'running') {
        this.agent.pause();
      }
      // Focus the canvas for keyboard events
      setTimeout(() => this.canvasRef?.nativeElement?.focus(), 50);
    }
  }

  private lastDrawInfo = { offsetX: 0, offsetY: 0, drawW: 1920, drawH: 1080 };

  private getNormalizedCoords(event: MouseEvent): { nx: number; ny: number } {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();

    // Pixel coordinate relative to the top-left of the canvas element
    const rawX = event.clientX - rect.left;
    const rawY = event.clientY - rect.top;

    // Map the raw canvas coordinate back to the normalized (0-1) coordinate of the actual image
    let nx = (rawX - this.lastDrawInfo.offsetX) / this.lastDrawInfo.drawW;
    let ny = (rawY - this.lastDrawInfo.offsetY) / this.lastDrawInfo.drawH;

    // Clamp to 0-1 so clicking black bars doesn't send out-of-bounds clicks
    nx = Math.max(0, Math.min(1, nx));
    ny = Math.max(0, Math.min(1, ny));

    return { nx, ny };
  }

  onCanvasClick(event: MouseEvent, sessionId: string | null) {
    if (!this.interactiveMode || !sessionId) return;
    const { nx, ny } = this.getNormalizedCoords(event);
    fetch(`${PLAYWRIGHT_HTTP_URL}/input`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, type: 'click', nx, ny, button: 'left' }),
    }).catch(() => { });
  }

  onCanvasMouseMove(event: MouseEvent, sessionId: string | null) {
    if (!this.interactiveMode || !sessionId || event.buttons === 0) return;
    // Only forward if mouse button is held (drag)
  }

  onCanvasWheel(event: WheelEvent, sessionId: string | null) {
    if (!this.interactiveMode || !sessionId) return;
    event.preventDefault();
    fetch(`${PLAYWRIGHT_HTTP_URL}/input`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, type: 'scroll', deltaY: event.deltaY }),
    }).catch(() => { });
  }

  onCanvasKeydown(event: KeyboardEvent, sessionId: string | null) {
    if (!this.interactiveMode || !sessionId) return;
    event.preventDefault();
    const key = event.key;
    fetch(`${PLAYWRIGHT_HTTP_URL}/input`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, type: 'keydown', key }),
    }).catch(() => { });
  }

  /**
   * Toggles native browser fullscreen mode on the canvas container, 
   * giving the user an immersive pseudo-VNC interaction environment.
   */
  toggleFullscreen() {
    const elem = this.containerRef?.nativeElement;
    if (!elem) return;

    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch((err: any) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }

  /**
   * Forward typed text from the interactive overlay input to the
   * Playwright browser one character at a time via the /input endpoint.
   * Enter key sends the Enter keypress to the browser.
   */
  onInteractiveKeydown(event: KeyboardEvent, sessionId: string | null) {
    if (!sessionId) return;
    const key = event.key;

    if (key === 'Enter') {
      // Send Enter to browser
      fetch(`${PLAYWRIGHT_HTTP_URL} / input`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, type: 'keydown', key: 'Enter' }),
      }).catch(() => { });
      this.interactiveTypeText = '';
      event.preventDefault();
      return;
    }

    if (key === 'Backspace') {
      fetch(`${PLAYWRIGHT_HTTP_URL} / input`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, type: 'keydown', key: 'Backspace' }),
      }).catch(() => { });
      return;
    }

    if (key === 'Tab') {
      event.preventDefault();
      fetch(`${PLAYWRIGHT_HTTP_URL} / input`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, type: 'keydown', key: 'Tab' }),
      }).catch(() => { });
      return;
    }

    // For printable characters, send via keydown
    if (key.length === 1) {
      fetch(`${PLAYWRIGHT_HTTP_URL} / input`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, type: 'keydown', key }),
      }).catch(() => { });
    }
  }

  reversed(arr: any[]) {
    return [...arr].reverse();
  }

  trackStep(_i: number, step: TimelineStep) { return step.id; }

  getSuccessCount(tasks: any[]) { return tasks.filter(t => t.success === true).length; }
  getFailCount(tasks: any[]) { return tasks.filter(t => t.success === false).length; }

  getStepIcon(type: TimelineStepType): string {
    const map: Record<TimelineStepType, string> = {
      analyze: 'manage_search',
      navigate: 'open_in_browser',
      found: 'check_circle_outline',
      missing_field: 'error_outline',
      ask_user: 'pan_tool',
      save_profile: 'save',
      fill: 'edit',
      click: 'ads_click',
      submit: 'send',
      complete: 'task_alt',
      error: 'warning',
      thought: 'lightbulb',
    };
    return map[type] ?? 'circle';
  }

  getStepColor(type: TimelineStepType): string {
    const map: Record<TimelineStepType, string> = {
      analyze: 'text-blue-500',
      navigate: 'text-sky-500',
      found: 'text-emerald-500',
      missing_field: 'text-amber-500',
      ask_user: 'text-orange-500',
      save_profile: 'text-violet-500',
      fill: 'text-indigo-500',
      click: 'text-cyan-500',
      submit: 'text-teal-500',
      complete: 'text-green-500',
      error: 'text-red-500',
      thought: 'text-gray-400',
    };
    return map[type] ?? 'text-gray-400';
  }

  getStepBg(type: TimelineStepType): string {
    const map: Record<TimelineStepType, string> = {
      analyze: 'bg-blue-50 dark:bg-blue-500/10',
      navigate: 'bg-sky-50 dark:bg-sky-500/10',
      found: 'bg-emerald-50 dark:bg-emerald-500/10',
      missing_field: 'bg-amber-50 dark:bg-amber-500/10',
      ask_user: 'bg-orange-50 dark:bg-orange-500/10',
      save_profile: 'bg-violet-50 dark:bg-violet-500/10',
      fill: 'bg-indigo-50 dark:bg-indigo-500/10',
      click: 'bg-cyan-50 dark:bg-cyan-500/10',
      submit: 'bg-teal-50 dark:bg-teal-500/10',
      complete: 'bg-green-50 dark:bg-green-500/10',
      error: 'bg-red-50 dark:bg-red-500/10',
      thought: 'bg-gray-50 dark:bg-white/5',
    };
    return map[type] ?? 'bg-gray-50';
  }

  getStepLabel(type: TimelineStepType): string {
    const map: Record<TimelineStepType, string> = {
      analyze: 'Analyzing',
      navigate: 'Navigating',
      found: 'Found',
      missing_field: 'Missing Field',
      ask_user: 'User Help',
      save_profile: 'Saved',
      fill: 'Filling',
      click: 'Clicking',
      submit: 'Submitting',
      complete: 'Complete',
      error: 'Error',
      thought: 'Reasoning',
    };
    return map[type] ?? 'Action';
  }

  sendReply() {
    const text = this.replyText.trim() || 'done';
    this.agent.replyToPrompt(text);
    this.replyText = '';
    this.interactiveMode = false;
  }

  /** Submit a value for a missing profile field */
  submitFieldValue(state: any) {
    const value = this.fieldValue.trim();
    if (!value) return;
    this.agent.replyToFieldPrompt(value, this.saveToProfile);
    this.fieldValue = '';
    this.saveToProfile = true; // reset for next time
  }
}
