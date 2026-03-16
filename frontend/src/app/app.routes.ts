import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent) },
    { path: 'login', loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent) },
    { path: 'register', loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent) },
    {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard-layout.component').then(m => m.DashboardLayoutComponent),
        children: [
            { path: '', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
            { path: 'agents', loadComponent: () => import('./features/dashboard/agents.component').then(m => m.AgentsComponent) },
            { path: 'profile', loadComponent: () => import('./features/settings/profile.component').then(m => m.ProfileComponent) },
            { path: 'jobs', loadComponent: () => import('./features/jobs/jobs-match.component').then(m => m.JobsMatchComponent) },
            { path: 'sessions', loadComponent: () => import('./features/sessions/sessions-list.component').then(m => m.SessionsListComponent) },
            { path: 'sessions/:id', loadComponent: () => import('./features/sessions/live-session.component').then(m => m.LiveSessionComponent) },
            { path: 'settings', loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent) }
        ]
    },
    { path: 'mock-jobs', loadComponent: () => import('./features/mock-jobs/job-listings/job-listings.component').then(m => m.JobListingsComponent) },
    { path: 'mock-jobs/:id', loadComponent: () => import('./features/mock-jobs/job-detail/job-detail.component').then(m => m.JobDetailComponent) },
    { path: 'mock-jobs/:id/apply', loadComponent: () => import('./features/mock-jobs/application-form/application-form.component').then(m => m.ApplicationFormComponent) },
    { path: 'mock-jobs/success', loadComponent: () => import('./features/mock-jobs/application-success/application-success.component').then(m => m.ApplicationSuccessComponent) },
    { path: '**', redirectTo: '' }
];
