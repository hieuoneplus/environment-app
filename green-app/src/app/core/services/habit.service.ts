import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HabitDTO } from './home.service';

@Injectable({
  providedIn: 'root'
})
export class HabitService {
  private base = environment.apiBase;

  constructor(private http: HttpClient) {}

  getAllHabits(): Observable<HabitDTO[]> {
    return this.http.get<HabitDTO[]>(`${this.base}/api/habits`);
  }

  toggleHabit(userId: string, habitId: string): Observable<HabitDTO> {
    return this.http.post<HabitDTO>(`${this.base}/api/habits/${habitId}/toggle`, null, {
      params: { userId }
    });
  }

  subscribeToHabit(userId: string, habitId: string): Observable<HabitDTO> {
    return this.http.post<HabitDTO>(`${this.base}/api/habits/${habitId}/subscribe`, null, {
      params: { userId }
    });
  }
}
