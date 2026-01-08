import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { User } from '../models/user.model';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class UserAuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoadingSubject.asObservable();

  constructor(private api: ApiService) {
    this.restoreSession();
  }

  private restoreSession(): void {
    const raw = localStorage.getItem('currentUser');
    if (!raw) return;

    try {
      const user = JSON.parse(raw) as User;
      this.currentUserSubject.next(user);
    } catch {
      localStorage.removeItem('currentUser');
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    this.isLoadingSubject.next(true);

    const body: LoginRequest = { email, password };

    return this.api.post<AuthResponse>('auth/login', body).pipe(
      tap((res) => {
        this.saveSessionFromAuthResponse(res);
        this.isLoadingSubject.next(false);
      }),
      catchError((err) => {
        this.isLoadingSubject.next(false);
        return throwError(() => new Error(this.extractError(err)));
      })
    );
  }

  register(
    email: string,
    username: string,
    password: string
  ): Observable<AuthResponse> {
    this.isLoadingSubject.next(true);

    const body: RegisterRequest = { email, username, password };

    return this.api.post<AuthResponse>('auth/register', body).pipe(
      tap((res) => {
        this.saveSessionFromAuthResponse(res);
        this.isLoadingSubject.next(false);
      }),
      catchError((err) => {
        this.isLoadingSubject.next(false);
        return throwError(() => new Error(this.extractError(err)));
      })
    );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  getCurrentUserId(): number | null {
    return this.currentUserSubject.value?.id ?? null;
  }

  private saveSessionFromAuthResponse(res: AuthResponse): void {
    const user: User = {
      id: res.id,
      username: res.username,
      email: res.email,
      createdAt: res.createdAt,
    };

    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private extractError(err: any): string {
    // Common ASP.NET Core error shapes
    if (err?.error?.message) return err.error.message;
    if (err?.error?.title) return err.error.title;

    // ModelState validation errors: { errors: { Field: [..] } }
    if (err?.error?.errors) {
      const values = Object.values(err.error.errors) as unknown[];
      const messages: string[] = [];

      for (const v of values) {
        if (Array.isArray(v)) {
          messages.push(...(v as string[]));
        } else if (typeof v === 'string') {
          messages.push(v);
        }
      }

      if (messages.length) return messages.join(', ');
    }

    if (typeof err?.error === 'string') return err.error;
    return 'Request failed. Check credentials/fields and try again.';
  }
}
