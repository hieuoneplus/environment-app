import { Component, OnInit } from '@angular/core';
import { ModalController, LoadingController, ToastController } from '@ionic/angular/standalone';
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
  IonItem,
  IonLabel,
  IonBadge,
  IonButtons,
  IonButton as IonButtonDirective
} from '@ionic/angular/standalone';
import { CommonModule, DatePipe } from '@angular/common';
import { addIcons } from 'ionicons';
import { close, gift, checkmarkCircle, time, closeCircle, calendarOutline } from 'ionicons/icons';
import { RewardService, UserRewardDTO } from '../core/services/reward.service';
import { AuthService } from '../core/services/auth.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-my-rewards-modal',
  templateUrl: './my-rewards-modal.component.html',
  styleUrls: ['./my-rewards-modal.component.scss'],
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
    IonItem,
    IonLabel,
    IonBadge,
    IonButtons,
    IonButtonDirective,
    CommonModule,
    DatePipe
  ],
  standalone: true
})
export class MyRewardsModal implements OnInit {
  userRewards: UserRewardDTO[] = [];
  isLoading = true;

  constructor(
    private modalController: ModalController,
    private rewardService: RewardService,
    private authService: AuthService,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {
    addIcons({ close, gift, checkmarkCircle, time, closeCircle, calendarOutline });
  }

  async ngOnInit() {
    await this.loadRewards();
  }

  async loadRewards() {
    this.isLoading = true;
    const loading = await this.loadingController.create({
      message: 'Đang tải...'
    });
    await loading.present();

    try {
      const user = this.authService.currentUser;
      if (!user || !user.id) {
        throw new Error('User not found');
      }

      this.userRewards = await firstValueFrom(this.rewardService.getUserRewards(user.id));
    } catch (error: any) {
      console.error('Error loading rewards:', error);
      this.showToast('Lỗi khi tải danh sách phần quà', 'danger');
    } finally {
      await loading.dismiss();
      this.isLoading = false;
    }
  }

  close() {
    this.modalController.dismiss();
  }

  getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'PENDING': 'Chờ xử lý',
      'REDEEMED': 'Đã sử dụng',
      'EXPIRED': 'Hết hạn'
    };
    return statusMap[status] || status;
  }

  getStatusColor(status: string): string {
    const colorMap: { [key: string]: string } = {
      'PENDING': 'warning',
      'REDEEMED': 'success',
      'EXPIRED': 'danger'
    };
    return colorMap[status] || 'medium';
  }

  getStatusIcon(status: string): string {
    const iconMap: { [key: string]: string } = {
      'PENDING': 'time',
      'REDEEMED': 'checkmark-circle',
      'EXPIRED': 'close-circle'
    };
    return iconMap[status] || 'time';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
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
