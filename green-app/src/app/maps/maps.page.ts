import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonFab,
  IonFabButton,
  IonChip,
  IonLabel,
  IonBadge,
  LoadingController,
  ToastController,
  AlertController
} from '@ionic/angular/standalone';
import { CommonModule, DecimalPipe } from '@angular/common';
import { addIcons } from 'ionicons';
import {
  mapOutline,
  location,
  walk,
  bicycle,
  stop,
  play,
  pause,
  refresh,
  trophy,
  reloadCircleOutline,
  batteryChargingOutline,
  storefrontOutline,
  helpCircleOutline
} from 'ionicons/icons';
import { MapsService, MapLocation, LocationType } from '../core/services/maps.service';
import { AuthService } from '../core/services/auth.service';
import { firstValueFrom } from 'rxjs';

declare var L: any;

@Component({
  selector: 'app-maps',
  templateUrl: 'maps.page.html',
  styleUrls: ['maps.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonFab,
    IonFabButton,
    IonChip,
    IonLabel,
    IonBadge,
    CommonModule,
    DecimalPipe
  ],
})
export class MapsPage implements OnInit, AfterViewInit, OnDestroy {
  map: any;
  userLocation: { lat: number; lng: number } | null = null;
  locations: MapLocation[] = [];
  isTracking = false;
  trackingDistance = 0; // in km
  trackingStartTime: Date | null = null;
  estimatedPoints = 0;
  selectedLocationType: LocationType | 'all' = 'all';
  private trackingInterval: any;
  private mapInitialized = false;
  
  locationTypes: { value: LocationType | 'all'; label: string; icon: string }[] = [
    { value: 'all', label: 'Tất cả', icon: 'location' },
    { value: 'RECYCLE_STATION', label: 'Trạm tái chế', icon: 'reload-circle-outline' },
    { value: 'BATTERY_COLLECTION', label: 'Thu gom pin', icon: 'battery-charging-outline' },
    { value: 'GREEN_STORE', label: 'Cửa hàng Xanh', icon: 'storefront-outline' }
  ];

  constructor(
    private mapsService: MapsService,
    private authService: AuthService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    addIcons({
      mapOutline,
      location,
      walk,
      bicycle,
      stop,
      play,
      pause,
      refresh,
      trophy,
      reloadCircleOutline,
      batteryChargingOutline,
      storefrontOutline,
      helpCircleOutline
    });
  }

  ngOnInit() {
    this.loadLocations();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.initMap();
    }, 300);
  }

  ionViewDidEnter() {
    // This is called every time the tab becomes visible
    // Fix map size when returning to this tab
    if (this.map && this.mapInitialized) {
      // Small delay to ensure DOM is fully rendered
      setTimeout(() => {
        try {
          // Invalidate size to recalculate map dimensions
          this.map.invalidateSize();
          // Force a redraw
          if (this.map._onResize) {
            this.map._onResize();
          }
        } catch (error) {
          console.error('Error resizing map:', error);
          // If map is broken, reinitialize it
          this.reinitializeMap();
        }
      }, 100);
    } else if (!this.mapInitialized) {
      // If map wasn't initialized yet, initialize it now
      setTimeout(() => {
        this.initMap();
      }, 300);
    }
  }

  ngOnDestroy() {
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
    }
    if (this.isTracking) {
      this.stopTracking();
    }
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    this.mapInitialized = false;
  }

  async initMap() {
    // Prevent multiple initializations
    if (this.mapInitialized && this.map) {
      return;
    }

    try {
      // Get user location
      const position = await this.mapsService.getCurrentPosition();
      this.userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      // Check if map container exists
      const mapContainer = document.getElementById('map');
      if (!mapContainer) {
        console.error('Map container not found');
        return;
      }

      // Remove existing map if any
      if (this.map) {
        this.map.remove();
        this.map = null;
      }

      // Initialize Leaflet map
      this.map = L.map('map', {
        preferCanvas: false, // Use DOM rendering for better compatibility
        zoomControl: true
      }).setView([this.userLocation.lat, this.userLocation.lng], 13);

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
        updateWhenIdle: true, // Only update when panning/zooming stops
        keepBuffer: 2 // Keep tiles in buffer
      }).addTo(this.map);

      // Add user location marker
      L.marker([this.userLocation.lat, this.userLocation.lng], {
        icon: L.divIcon({
          className: 'user-location-marker',
          html: '<div class="user-marker-pulse"></div><div class="user-marker-dot"></div>',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        })
      }).addTo(this.map).bindPopup('Vị trí của bạn');

      // Mark as initialized
      this.mapInitialized = true;

      // Load and display locations
      await this.loadLocations();
      this.displayLocations();

      // Force initial resize
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
        }
      }, 100);
    } catch (error: any) {
      console.error('Error initializing map:', error);
      const errorMessage = error.message || 'Không thể lấy vị trí';
      this.showLocationPermissionAlert(errorMessage);
      
      // Fallback to default location (Hà Nội - Cầu Giấy)
      const mapContainer = document.getElementById('map');
      if (!mapContainer) {
        return;
      }

      if (this.map) {
        this.map.remove();
        this.map = null;
      }

      this.userLocation = { lat: 21.034281, lng: 105.783358 };
      this.map = L.map('map', {
        preferCanvas: false,
        zoomControl: true
      }).setView([this.userLocation.lat, this.userLocation.lng], 13);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
        updateWhenIdle: true,
        keepBuffer: 2
      }).addTo(this.map);
      
      this.mapInitialized = true;
      
      await this.loadLocations();
      this.displayLocations();

      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
        }
      }, 100);
    }
  }

  async reinitializeMap() {
    console.log('Reinitializing map...');
    this.mapInitialized = false;
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    // Clear map container
    const mapContainer = document.getElementById('map');
    if (mapContainer) {
      mapContainer.innerHTML = '';
    }
    // Reinitialize
    await this.initMap();
  }

  async showLocationPermissionAlert(errorMessage: string) {
    const alert = await this.alertController.create({
      header: 'Cần quyền vị trí',
      message: errorMessage,
      buttons: [
        {
          text: 'Hướng dẫn',
          handler: () => {
            this.showLocationGuide();
          }
        },
        {
          text: 'Đã hiểu',
          role: 'cancel'
        }
      ]
    });
    await alert.present();
  }

  async showLocationGuide() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    let guideMessage = '';

    if (isMobile) {
      if (isIOS) {
        guideMessage = `
<b>Trên iPhone/iPad:</b><br><br>
1. Vào <b>Settings (Cài đặt)</b> → <b>Privacy & Security (Quyền riêng tư)</b> → <b>Location Services (Dịch vụ định vị)</b><br>
2. Bật <b>Location Services</b><br>
3. Tìm app <b>Green App</b> và chọn <b>While Using the App</b><br>
4. Quay lại app và thử lại
        `;
      } else if (isAndroid) {
        guideMessage = `
<b>Trên Android:</b><br><br>
1. Vào <b>Cài đặt</b> → <b>Ứng dụng</b> → <b>Green App</b><br>
2. Chọn <b>Quyền</b> → <b>Vị trí</b> → Chọn <b>Cho phép khi dùng ứng dụng</b><br>
3. Đảm bảo <b>GPS</b> đã bật trong <b>Cài đặt</b> → <b>Vị trí</b><br>
4. Quay lại app và thử lại
        `;
      }
    } else {
      // Web browser
      const browserName = this.getBrowserName();
      guideMessage = `
<b>Trên trình duyệt ${browserName}:</b><br><br>
1. Click vào biểu tượng <b>🔒</b> hoặc <b>📍</b> ở thanh địa chỉ<br>
2. Chọn <b>Cho phép</b> hoặc <b>Allow</b> cho quyền vị trí<br>
3. Nếu đã từ chối trước đó, click <b>Reset permissions</b> và thử lại<br>
4. Đảm bảo GPS đã bật trên thiết bị (nếu dùng laptop có GPS)
      `;
    }

    const alert = await this.alertController.create({
      header: 'Hướng dẫn bật quyền vị trí',
      message: guideMessage,
      buttons: [
        {
          text: 'Thử lại',
          handler: () => {
            this.initMap();
          }
        },
        {
          text: 'Đóng',
          role: 'cancel'
        }
      ]
    });
    await alert.present();
  }

  getBrowserName(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.indexOf('Chrome') > -1) return 'Chrome';
    if (userAgent.indexOf('Firefox') > -1) return 'Firefox';
    if (userAgent.indexOf('Safari') > -1) return 'Safari';
    if (userAgent.indexOf('Edge') > -1) return 'Edge';
    return 'trình duyệt';
  }

  async loadLocations() {
    try {
      this.locations = await firstValueFrom(this.mapsService.getLocations(this.selectedLocationType));
    } catch (error: any) {
      console.error('Error loading locations:', error);
      this.showToast('Không thể tải địa điểm', 'danger');
    }
  }

  displayLocations() {
    if (!this.map) return;

    // Clear existing markers
    this.map.eachLayer((layer: any) => {
      if (layer instanceof L.Marker && layer.options?.isLocationMarker) {
        this.map.removeLayer(layer);
      }
    });

    // Add location markers
    this.locations.forEach(location => {
      if (location.latitude && location.longitude) {
        const icon = this.getLocationIcon(location.type);
        const marker = L.marker([location.latitude, location.longitude], {
          icon: icon,
          isLocationMarker: true
        }).addTo(this.map);

        const popupContent = `
          <div class="location-popup">
            <h3>${location.name}</h3>
            <p>${this.getLocationTypeLabel(location.type)}</p>
            ${location.description ? `<p>${location.description}</p>` : ''}
            ${location.address ? `<p>📍 ${location.address}</p>` : ''}
            <p><strong>+${location.pointsAvailable} GP</strong></p>
          </div>
        `;
        marker.bindPopup(popupContent);
      }
    });
  }

  getLocationIcon(type: LocationType): any {
    const iconColors: { [key: string]: string } = {
      'RECYCLE_STATION': '#4CAF50',
      'BATTERY_COLLECTION': '#FF9800',
      'GREEN_STORE': '#2196F3'
    };

    const iconEmojis: { [key: string]: string } = {
      'RECYCLE_STATION': '♻️',
      'BATTERY_COLLECTION': '🔋',
      'GREEN_STORE': '🏪'
    };

    const color = iconColors[type] || '#666';
    const emoji = iconEmojis[type] || '📍';

    return L.divIcon({
      className: 'location-marker',
      html: `<div style="background-color: ${color};" class="location-marker-pin">${emoji}</div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40]
    });
  }

  getLocationTypeLabel(type: LocationType): string {
    const labels: { [key: string]: string } = {
      'RECYCLE_STATION': 'Trạm tái chế',
      'BATTERY_COLLECTION': 'Điểm thu gom pin',
      'GREEN_STORE': 'Cửa hàng Xanh'
    };
    return labels[type] || type;
  }

  async startTracking() {
    const alert = await this.alertController.create({
      header: 'Bắt đầu Green Move',
      message: 'Chọn phương thức di chuyển:',
      buttons: [
        {
          text: 'Đi bộ',
          handler: () => {
            this.doStartTracking('WALK');
          }
        },
        {
          text: 'Đạp xe',
          handler: () => {
            this.doStartTracking('BIKE');
          }
        },
        {
          text: 'Hủy',
          role: 'cancel'
        }
      ]
    });
    await alert.present();
  }

  async doStartTracking(mode: 'WALK' | 'BIKE') {
    try {
      const user = this.authService.currentUser;
      if (!user) {
        this.showToast('Vui lòng đăng nhập', 'danger');
        return;
      }

      const position = await this.mapsService.getCurrentPosition();
      this.userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      this.isTracking = true;
      this.trackingStartTime = new Date();
      this.trackingDistance = 0;
      this.estimatedPoints = 0;

      // Start tracking
      await firstValueFrom(this.mapsService.startTracking(user.id, mode, this.userLocation));
      
      this.showToast('Đã bắt đầu theo dõi!', 'success');
      
      // Update map center
      if (this.map) {
        this.map.setView([this.userLocation.lat, this.userLocation.lng], 15);
      }

      // Start periodic position updates (every 5 seconds)
      this.trackingInterval = setInterval(() => {
        this.updateTrackingPosition();
      }, 5000);
    } catch (error: any) {
      console.error('Error starting tracking:', error);
      const errorMessage = error.message || 'Không thể bắt đầu theo dõi';
      this.showToast(errorMessage, 'danger');
      
      // Show guide if permission error
      if (errorMessage.includes('quyền') || errorMessage.includes('permission') || errorMessage.includes('GPS')) {
        setTimeout(() => {
          this.showLocationGuide();
        }, 1000);
      }
    }
  }

  async updateTrackingPosition() {
    if (!this.isTracking) return;

    try {
      const position = await this.mapsService.getCurrentPosition();
      const newLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      // Calculate distance
      if (this.userLocation) {
        const distance = this.calculateDistance(
          this.userLocation.lat,
          this.userLocation.lng,
          newLocation.lat,
          newLocation.lng
        );
        this.trackingDistance += distance;
        this.estimatedPoints = Math.floor(this.trackingDistance * 10); // 10 GP per km
      }

      this.userLocation = newLocation;

      // Update tracking on backend
      const user = this.authService.currentUser;
      if (user) {
        await firstValueFrom(this.mapsService.updateTracking(user.id, newLocation));
      }

      // Update map
      if (this.map) {
        this.map.setView([newLocation.lat, newLocation.lng], 15);
      }

      // Position updated successfully
    } catch (error: any) {
      console.error('Error updating position:', error);
      // Will retry on next interval
    }
  }

  async stopTracking() {
    if (!this.isTracking) return;

    // Clear interval
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
      this.trackingInterval = null;
    }

    const user = this.authService.currentUser;
    if (!user) return;

    try {
      const result = await firstValueFrom(this.mapsService.stopTracking(user.id));
      
      this.isTracking = false;
      this.trackingDistance = result.distance || this.trackingDistance;
      const pointsEarned = result.pointsEarned || this.estimatedPoints;

      if (pointsEarned > 0) {
        // Reload user profile to get updated points
        const updatedUser = this.authService.currentUser;
        if (updatedUser) {
          updatedUser.greenPoints = (updatedUser.greenPoints || 0) + pointsEarned;
          this.authService.setUser(updatedUser);
        }

        this.showToast(`Đã hoàn thành! +${pointsEarned} GP (${this.trackingDistance.toFixed(2)} km)`, 'success');
      } else {
        this.showToast(`Đã dừng theo dõi (${this.trackingDistance.toFixed(2)} km)`, 'success');
      }

      this.trackingStartTime = null;
      this.trackingDistance = 0;
      this.estimatedPoints = 0;
    } catch (error: any) {
      console.error('Error stopping tracking:', error);
      this.showToast('Lỗi khi dừng theo dõi', 'danger');
      // Reset state anyway
      this.isTracking = false;
      this.trackingStartTime = null;
    }
  }

  onLocationTypeChange() {
    this.loadLocations().then(() => {
      this.displayLocations();
    });
  }

  centerOnUser() {
    if (this.userLocation && this.map) {
      this.map.setView([this.userLocation.lat, this.userLocation.lng], 15);
    }
  }

  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  getTrackingDuration(): string {
    if (!this.trackingStartTime) return '00:00';
    const now = new Date();
    const diff = Math.floor((now.getTime() - this.trackingStartTime.getTime()) / 1000);
    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  async showToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
}
