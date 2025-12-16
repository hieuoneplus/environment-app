import { Component, OnInit } from '@angular/core';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonBackButton,
  IonButtons,
  IonChip,
  IonLabel,
  LoadingController,
  ToastController
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  arrowBack,
  camera,
  trash,
  water,
  bus,
  checkmarkCircle
} from 'ionicons/icons';

// Import Capacitor Camera đúng chuẩn
import {
  Camera,
  CameraResultType,
  CameraSource
} from '@capacitor/camera';
import { AuthService } from '../core/services/auth.service';
import { ActivityService } from '../core/services/activity.service';
import { HomeService } from '../core/services/home.service';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-camera',
  templateUrl: 'camera.page.html',
  styleUrls: ['camera.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonBackButton,
    IonButtons,
    IonChip,
    IonLabel,
    CommonModule
  ]
})
export class CameraPage implements OnInit {
  isScanning: boolean = false;
  detectedObject: string = '';
  capturedImage: string | null = null;
  isProcessing: boolean = false;

  manualOptions = [
    { id: 'water', name: 'Bình nước', icon: 'trash', detectedObject: 'water' },
    { id: 'trash', name: 'Rác', icon: 'trash', detectedObject: 'trash' },
    { id: 'bus', name: 'Xe buýt', icon: 'bus', detectedObject: 'bus' }
  ];

  constructor(
    private authService: AuthService,
    private activityService: ActivityService,
    private homeService: HomeService,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {
    addIcons({
      arrowBack,
      camera,
      trash,
      water,
      bus,
      checkmarkCircle
    });
  }

  ngOnInit() {
    // Don't auto-start scanning
  }

  async capturePhoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      });

      this.capturedImage = image.dataUrl || null;
      this.isScanning = true;
      this.detectedObject = '';

      // Simulate AI detection (in production, this would call an AI service)
      setTimeout(() => {
        this.detectedObject = 'Bình nước cá nhân';
        this.isScanning = false;
      }, 2000);

    } catch (error) {
      console.error('Error capturing photo:', error);
      this.showToast('Lỗi khi chụp ảnh', 'danger');
    }
  }

  async selectManualOption(option: any) {
    this.detectedObject = option.name;
    // Auto-submit when manual option is selected
    await this.submitActivity(option.detectedObject || option.id);
  }

  async submitActivity(detectedObject?: string) {
    const user = this.authService.currentUser;
    if (!user) {
      this.showToast('Vui lòng đăng nhập', 'danger');
      return;
    }

    const finalDetectedObject = detectedObject || this.detectedObject;
    if (!finalDetectedObject) {
      this.showToast('Vui lòng chọn loại hoạt động', 'warning');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Đang ghi nhận hoạt động...'
    });
    await loading.present();

    try {
      const activity = await firstValueFrom(this.activityService.recordActivity(user.id, {
        activityType: 'SCAN',
        detectedObject: finalDetectedObject,
        imageUrl: this.capturedImage || undefined
      }));

      if (activity) {
        // Update user points
        if (user) {
          user.greenPoints = activity.newTotalPoints;
          this.authService.setUser(user);
        }

        this.showToast(
          `Đã ghi nhận! +${activity.pointsEarned} điểm. Tổng: ${activity.newTotalPoints} điểm`,
          'success'
        );

        // Reset form
        this.capturedImage = null;
        this.detectedObject = '';
        this.isScanning = false;
      }
    } catch (error: any) {
      console.error('Error submitting activity:', error);
      this.showToast('Lỗi: ' + (error?.error?.message || error.message), 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  async showToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
}
