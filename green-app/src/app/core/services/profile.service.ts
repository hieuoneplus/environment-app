import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserProfile } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private base = environment.apiBase;

  constructor(private http: HttpClient) {}

  getProfile(userId: string): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.base}/api/profile`, {
      params: { userId }
    });
  }

  updateProfile(userId: string, profile: Partial<UserProfile>): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.base}/api/profile`, profile, {
      params: { userId }
    });
  }
}
