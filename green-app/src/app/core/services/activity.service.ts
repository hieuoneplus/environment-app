import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ActivityRequest {
  activityType: 'SCAN' | 'HABIT' | 'LOCATION_CHECKIN';
  detectedObject?: string;
  imageUrl?: string;
  habitId?: string;
  locationId?: string;
}

export interface ActivityResponse {
  id: string;
  activityType: string;
  detectedObject?: string;
  pointsEarned: number;
  description?: string;
  createdAt: string;
  newTotalPoints: number;
}

export interface AIDetectionResponse {
  detectedObject: string;
  rawDetection?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  private base = environment.apiBase;

  constructor(private http: HttpClient) {}

  recordActivity(userId: string, activity: ActivityRequest): Observable<ActivityResponse> {
    return this.http.post<ActivityResponse>(`${this.base}/api/activities`, activity, {
      params: { userId }
    });
  }

  detectObject(imageBase64: string): Observable<AIDetectionResponse> {
    return this.http.post<AIDetectionResponse>(`${this.base}/api/ai/detect`, {
      imageBase64
    });
  }
}
