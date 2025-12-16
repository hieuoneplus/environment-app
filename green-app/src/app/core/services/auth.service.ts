import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  address?: string;
  gender?: string;
  dob?: string;
  greenPoints: number;
  rank: string;
  streak: number;
  avatarUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private base = environment.apiBase;
  private currentUserSubject = new BehaviorSubject<UserProfile | null>(this.getStoredUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  get currentUser(): UserProfile | null {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string): Observable<UserProfile> {
    return this.http.post<UserProfile>(`${this.base}/api/auth/login`, {
      email,
      password
    }).pipe(
      tap(user => {
        this.setUser(user);
      })
    );
  }

  register(userData: any): Observable<UserProfile> {
    return this.http.post<UserProfile>(`${this.base}/api/auth/register`, userData).pipe(
      tap(user => {
        this.setUser(user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.router.navigateByUrl('/login');
  }

  setUser(user: UserProfile): void {
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  getStoredUser(): UserProfile | null {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Error parsing stored user:', e);
        return null;
      }
    }
    return null;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }
}
