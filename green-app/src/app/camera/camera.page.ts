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
  checkmarkCircle, leaf, bicycle, bag, trophy, calendar, closeCircle, bagHandle
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
    { id: 'recycle', name: 'Phân Loại Rác', icon: 'trash', detectedObject: 'recycle' },
    { id: 'water_bottle', name: 'Sử Dụng Bình Nước Cá Nhân', icon: 'water', detectedObject: 'water_bottle' },
    { id: 'plant_care', name: 'Chăm Sóc Cây', icon: 'leaf', detectedObject: 'plant_care' },
    { id: 'green_move', name: 'Di Chuyển Xanh', icon: 'bicycle', detectedObject: 'green_move' },
    { id: 'sustainable_shopping', name: 'Mua Sắm Bền Vững', icon: 'bag', detectedObject: 'sustainable_shopping' },
    { id: 'event', name: 'Tham Gia Sự Kiện', icon: 'calendar', detectedObject: 'event' },
    { id: 'challenge', name: 'Thử Thách Tuần/Tháng', icon: 'trophy', detectedObject: 'challenge' }
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
      checkmarkCircle,
      leaf,
      bicycle,
      bag,
      calendar,
      trophy,
      closeCircle,
      bagHandle
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
      this.isProcessing = true;

      // Use AI to detect object
      if (this.capturedImage) {
        try {
          const detection = await firstValueFrom(
            this.activityService.detectObject(this.capturedImage)
          );

          if (detection && detection.detectedObject) {
            // Map detected object to Vietnamese name
            const objectMap: { [key: string]: string } = {
              'recycle': 'Phân Loại Rác',
              'water_bottle': 'Sử Dụng Bình Nước Cá Nhân',
              'plant_care': 'Chăm Sóc Cây',
              'green_move': 'Di Chuyển Xanh',
              'sustainable_shopping': 'Mua Sắm Bền Vững',
              'event': 'Tham Gia Sự Kiện',
              'challenge': 'Thử Thách Tuần/Tháng',
              // Legacy mappings for backward compatibility
              'water': 'Sử Dụng Bình Nước Cá Nhân',
              'trash': 'Phân Loại Rác',
              'bus': 'Di Chuyển Xanh',
              'plant': 'Chăm Sóc Cây',
              'bike': 'Di Chuyển Xanh'
            };

            this.detectedObject = objectMap[detection.detectedObject] || detection.detectedObject;
            this.showToast(`AI đã nhận diện: ${this.detectedObject}`, 'success');
          } else {
            this.showToast('Không thể nhận diện đối tượng. Vui lòng chọn thủ công.', 'warning');
          }
        } catch (aiError: any) {
          console.error('AI detection error:', aiError);
          this.showToast('Lỗi AI nhận diện. Vui lòng chọn thủ công.', 'warning');
        }
      }

      this.isScanning = false;
      this.isProcessing = false;

    } catch (error) {
      console.error('Error capturing photo:', error);
      this.showToast('Lỗi khi chụp ảnh', 'danger');
      this.isScanning = false;
      this.isProcessing = false;
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
      // Map Vietnamese name back to English for backend
      const objectMap: { [key: string]: string } = {
        'Phân Loại Rác': 'recycle',
        'Sử Dụng Bình Nước Cá Nhân': 'water_bottle',
        'Chăm Sóc Cây': 'plant_care',
        'Di Chuyển Xanh': 'green_move',
        'Mua Sắm Bền Vững': 'sustainable_shopping',
        'Tham Gia Sự Kiện': 'event',
        'Thử Thách Tuần/Tháng': 'challenge',
        // Legacy mappings
        'Bình nước': 'water_bottle',
        'Rác': 'recycle',
        'Xe buýt': 'green_move',
        'Cây xanh': 'plant_care',
        'Xe đạp': 'green_move'
      };

      const backendObject = objectMap[finalDetectedObject] || finalDetectedObject.toLowerCase();

      const activity = await firstValueFrom(this.activityService.recordActivity(user.id, {
        activityType: 'SCAN',
        detectedObject: backendObject,
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
