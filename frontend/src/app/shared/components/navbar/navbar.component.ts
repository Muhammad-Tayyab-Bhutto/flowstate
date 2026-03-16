import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../../core/services/auth.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule, TranslateModule],
  template: `
    <mat-toolbar color="primary" class="navbar">
      <span class="brand" routerLink="/">Flowstate</span>
      <span class="spacer"></span>
      <button mat-button routerLink="/mock-jobs" class="nav-btn">
        <mat-icon>work</mat-icon>
        Mock Jobs
      </button>
      <ng-container *ngIf="authService.currentUser$ | async as user; else loginTpl">
        <button mat-button [matMenuTriggerFor]="menu">
          {{ user.name }} <mat-icon>arrow_drop_down</mat-icon>
        </button>
        <mat-menu #menu="matMenu">
          <button mat-menu-item routerLink="/settings">Profile Settings</button>
          <button mat-menu-item (click)="logout()">{{ 'COMMON.LOGOUT' | translate }}</button>
        </mat-menu>
      </ng-container>
      <ng-template #loginTpl>
        <button mat-button routerLink="/login">{{ 'COMMON.LOGIN' | translate }}</button>
        <button mat-raised-button color="accent" routerLink="/register">{{ 'COMMON.REGISTER' | translate }}</button>
      </ng-template>
    </mat-toolbar>
  `,
  styles: [`
    .navbar { 
      background: rgba(15, 23, 42, 0.8) !important;
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(255,255,255,0.1);
      color: #f8fafc;
      padding: 0 2rem;
    }
    .spacer { flex: 1 1 auto; }
    .brand { cursor: pointer; font-weight: 700; font-size: 1.5rem; letter-spacing: -0.03em; color: #f8fafc; display: flex; align-items: center; gap: 8px;}
    .nav-btn { color: #e2e8f0; font-weight: 500; gap: 8px; }
    .nav-btn:hover { background: rgba(255,255,255,0.1); }
  `]
})
export class NavbarComponent {
  authService = inject(AuthService);

  logout() {
    this.authService.logout().subscribe();
  }
}
