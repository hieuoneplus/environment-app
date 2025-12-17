import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Geolocation, Position } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';
import { environment } from '../../../environments/environment';

export type LocationType = 'RECYCLE_STATION' | 'BATTERY_COLLECTION' | 'GREEN_STORE';

export interface MapLocation {
  id: string;
  name: string;
  type: LocationType;
  latitude: number;
  longitude: number;
  pointsAvailable: number;
  description?: string;
  address?: string;
}

export interface TrackingResult {
  distance: number;
  pointsEarned: number;
  duration: number;
}

@Injectable({
  providedIn: 'root'
})
export class MapsService {
  private base = environment.apiBase;

  constructor(private http: HttpClient) {}

  async getCurrentPosition(): Promise<Position> {
    const isNative = Capacitor.isNativePlatform();
    
    if (isNative) {
      // Mobile app - use Capacitor Geolocation
      return await this.getNativePosition();
    } else {
      // Web browser - use browser Geolocation API
      return await this.getWebPosition();
    }
  }

  private async getNativePosition(): Promise<Position> {
    try {
      const permission = await Geolocation.checkPermissions();

      if (permission.location !== 'granted') {
        const request = await Geolocation.requestPermissions();
        if (request.location !== 'granted') {
          throw new Error('Vui lòng cấp quyền vị trí trong Settings của thiết bị');
        }
      }

      return await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      });
    } catch (error: any) {
      console.error('Native geolocation error:', error);
      throw new Error('Không thể lấy vị trí. Vui lòng bật GPS và cấp quyền vị trí trong Settings.');
    }
  }

  private async getWebPosition(): Promise<Position> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Trình duyệt không hỗ trợ Geolocation. Vui lòng dùng trình duyệt hiện đại.'));
        return;
      }

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Convert browser GeolocationPosition to Capacitor Position format
          const capacitorPosition: Position = {
            timestamp: position.timestamp,
            coords: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              altitude: position.coords.altitude,
              altitudeAccuracy: position.coords.altitudeAccuracy,
              heading: position.coords.heading,
              speed: position.coords.speed
            }
          };
          resolve(capacitorPosition);
        },
        (error) => {
          let errorMessage = 'Không thể lấy vị trí. ';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += 'Vui lòng cấp quyền vị trí trong cài đặt trình duyệt (biểu tượng 🔒 ở thanh địa chỉ).';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += 'Vị trí không khả dụng. Vui lòng bật GPS trên thiết bị.';
              break;
            case error.TIMEOUT:
              errorMessage += 'Hết thời gian chờ. Vui lòng thử lại.';
              break;
            default:
              errorMessage += 'Lỗi không xác định.';
          }
          
          reject(new Error(errorMessage));
        },
        options
      );
    });
  }

  getLocations(type?: LocationType | 'all'): Observable<MapLocation[]> {
    const params: any = {};
    if (type && type !== 'all') {
      params.type = type;
    }
    return this.http.get<MapLocation[]>(`${this.base}/api/maps/locations`, { params });
  }

  startTracking(userId: string, mode: 'WALK' | 'BIKE', startLocation: { lat: number; lng: number }): Observable<any> {
    return this.http.post(`${this.base}/api/maps/tracking/start`, {
      userId,
      mode,
      startLatitude: startLocation.lat,
      startLongitude: startLocation.lng
    });
  }

  updateTracking(userId: string, location: { lat: number; lng: number }): Observable<any> {
    return this.http.post(`${this.base}/api/maps/tracking/update`, {
      userId,
      latitude: location.lat,
      longitude: location.lng
    });
  }

  stopTracking(userId: string): Observable<TrackingResult> {
    return this.http.post<TrackingResult>(`${this.base}/api/maps/tracking/stop`, {
      userId
    });
  }
}
