import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface HabitDTO {
  id: string;
  name: string;
  points: number;
  description?: string;
  iconName?: string;
  completed: boolean;
}

export interface LocationDTO {
  id: string;
  name: string;
  latitude?: number;
  longitude?: number;
  pointsAvailable: number;
  description?: string;
  address?: string;
  distance?: string;
}

export interface HomeDashboardDTO {
  userName: string;
  greeting: string;
  greenPoints: number;
  rank: string;
  streak: number;
  todayHabits: HabitDTO[];
  nearbyLocations: LocationDTO[];
}

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  private base = environment.apiBase;

  constructor(private http: HttpClient) {}

  getDashboard(userId: string): Observable<HomeDashboardDTO> {
    return this.http.get<HomeDashboardDTO>(`${this.base}/api/home/dashboard`, {
      params: { userId }
    });
  }
}
