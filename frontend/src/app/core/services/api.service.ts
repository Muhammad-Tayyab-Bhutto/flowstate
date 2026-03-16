import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private http = inject(HttpClient);
    private baseUrl = environment.apiUrl || '/api/v1';

    get<T>(path: string): Observable<T> {
        return this.http.get<T>(`${this.baseUrl}${path}`).pipe(catchError(this.formatErrors));
    }

    post<T>(path: string, body: Object = {}): Observable<T> {
        return this.http.post<T>(`${this.baseUrl}${path}`, body).pipe(catchError(this.formatErrors));
    }

    patch<T>(path: string, body: Object = {}): Observable<T> {
        return this.http.patch<T>(`${this.baseUrl}${path}`, body).pipe(catchError(this.formatErrors));
    }

    delete<T>(path: string): Observable<T> {
        return this.http.delete<T>(`${this.baseUrl}${path}`).pipe(catchError(this.formatErrors));
    }

    private formatErrors(error: HttpErrorResponse) {
        return throwError(() => new Error(error.error?.message || error.message || 'An error occurred'));
    }
}
