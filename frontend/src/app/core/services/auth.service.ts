import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { ApiService } from './api.service';
import type { User } from '@flowstate/shared';

export interface AuthResponse {
    success: boolean;
    data: { access_token: string; user?: User };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private api = inject(ApiService);
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    private tokenKey = 'access_token';

    get currentUser(): User | null {
        return this.currentUserSubject.value;
    }

    getToken(): string | null {
        return localStorage.getItem(this.tokenKey);
    }

    setToken(token: string) {
        if (token) localStorage.setItem(this.tokenKey, token);
        else localStorage.removeItem(this.tokenKey);
    }

    login(credentials: Record<string, string>): Observable<User> {
        return this.api.post<AuthResponse>('/auth/login', credentials).pipe(
            map(response => {
                if (response.success && response.data.access_token) {
                    this.setToken(response.data.access_token);
                }
                if (response.data.user) {
                    this.currentUserSubject.next(response.data.user);
                    return response.data.user;
                }
                throw new Error('User not found in response');
            })
        );
    }

    register(credentials: Record<string, string>): Observable<any> {
        return this.api.post('/auth/register', credentials);
    }

    checkSession(): Observable<User> {
        return this.api.get<{ success: boolean, data: User }>('/auth/me').pipe(
            map(res => {
                if (res.success && res.data) {
                    this.currentUserSubject.next(res.data);
                    return res.data;
                }
                throw new Error('No active session state');
            }),
            tap({ error: () => this.currentUserSubject.next(null) })
        )
    }

    logout(): Observable<any> {
        return this.api.post('/auth/logout').pipe(
            tap(() => {
                this.setToken('');
                this.currentUserSubject.next(null);
            })
        );
    }
}
