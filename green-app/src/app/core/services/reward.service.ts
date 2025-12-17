import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RewardDTO {
  id: string;
  name: string;
  points: number;
  category: string;
  imageUrl?: string;
  imageEmoji?: string;
  description?: string;
  canAfford: boolean;
}

export interface UserRewardDTO {
  id: string;
  reward: RewardDTO;
  pointsSpent: number;
  status: string; // PENDING, REDEEMED, EXPIRED
  redeemedAt?: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class RewardService {
  private base = environment.apiBase;

  constructor(private http: HttpClient) {}

  getAllRewards(userId: string): Observable<RewardDTO[]> {
    return this.http.get<RewardDTO[]>(`${this.base}/api/rewards`, {
      params: { userId }
    });
  }

  getRewardsByCategory(userId: string, category: string): Observable<RewardDTO[]> {
    return this.http.get<RewardDTO[]>(`${this.base}/api/rewards/category/${category}`, {
      params: { userId }
    });
  }

  exchangeReward(userId: string, rewardId: string): Observable<any> {
    return this.http.post(`${this.base}/api/rewards/${rewardId}/exchange`, null, {
      params: { userId }
    });
  }

  getUserRewards(userId: string): Observable<UserRewardDTO[]> {
    return this.http.get<UserRewardDTO[]>(`${this.base}/api/rewards/my-rewards`, {
      params: { userId }
    });
  }
}
