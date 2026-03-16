import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);
    // Retrieve token directly from standard DOM storage to prevent HttpClient circular injection loops
    const token = localStorage.getItem('access_token');

    if (token) {
        req = req.clone({
            setHeaders: { Authorization: `Bearer ${token}` }
        });
    }

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
                // Token expired or invalid — clear session and redirect to login
                localStorage.removeItem('access_token');
                router.navigate(['/login'], {
                    queryParams: { reason: 'session_expired' }
                });
            }
            return throwError(() => error);
        })
    );
};
