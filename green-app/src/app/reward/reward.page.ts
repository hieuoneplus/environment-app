import { Component, OnInit } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonChip,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonIcon,
  LoadingController,
  ToastController,
  AlertController
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { diamond } from 'ionicons/icons';
import {DecimalPipe, CommonModule} from "@angular/common";
import { AuthService } from '../core/services/auth.service';
import { RewardService, RewardDTO } from '../core/services/reward.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-reward',
  templateUrl: 'reward.page.html',
  styleUrls: ['reward.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonButton,
    IonChip,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonIcon,
    FormsModule,
    DecimalPipe,
    CommonModule
  ],
})
export class RewardPage implements OnInit {
  userPoints: number = 0;
  selectedCategory: string = 'all';
  rewards: RewardDTO[] = [];
  isLoading = false;

  categories = [
    { value: 'all', label: 'Tất cả' },
    { value: 'voucher', label: 'Voucher' },
    { value: 'plant', label: 'Cây xanh' }
  ];

  constructor(
    private authService: AuthService,
    private rewardService: RewardService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    addIcons({ diamond });
  }

  ngOnInit() {
    this.loadUserPoints();
    this.loadRewards();
  }

  loadUserPoints() {
    const user = this.authService.currentUser;
    if (user) {
      this.userPoints = user.greenPoints;
    }
  }

  async loadRewards() {
    const user = this.authService.currentUser;
    if (!user) {
      return;
    }

    this.isLoading = true;
    try {
      if (this.selectedCategory === 'all') {
        this.rewards = await firstValueFrom(this.rewardService.getAllRewards(user.id));
      } else {
        this.rewards = await firstValueFrom(this.rewardService.getRewardsByCategory(user.id, this.selectedCategory));
      }
    } catch (error: any) {
      console.error('Error loading rewards:', error);
      this.showToast('Lỗi khi tải danh sách phần thưởng', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  onCategoryChange() {
    this.loadRewards();
  }

  get filteredRewards(): RewardDTO[] {
    return this.rewards;
  }

  async exchangeReward(reward: RewardDTO) {
    if (!reward.canAfford) {
      this.showToast('Bạn không đủ điểm để đổi quà này!', 'warning');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Xác nhận đổi quà',
      message: `Bạn có chắc muốn đổi "${reward.name}" với ${reward.points} điểm?`,
      buttons: [
        {
          text: 'Hủy',
          role: 'cancel'
        },
        {
          text: 'Xác nhận',
          handler: async () => {
            await this.confirmExchange(reward);
          }
        }
      ]
    });

    await alert.present();
  }

  async confirmExchange(reward: RewardDTO) {
    const user = this.authService.currentUser;
    if (!user) {
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Đang xử lý...'
    });
    await loading.present();

    try {
      await firstValueFrom(this.rewardService.exchangeReward(user.id, reward.id));
      
      // Update user points
      user.greenPoints -= reward.points;
      this.authService.setUser(user);
      this.userPoints = user.greenPoints;

      // Reload rewards to update canAfford status
      await this.loadRewards();

      this.showToast(`Đã đổi thành công "${reward.name}"!`, 'success');
    } catch (error: any) {
      console.error('Error exchanging reward:', error);
      this.showToast('Lỗi: ' + (error?.error?.message || error.message), 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  canAfford(points: number): boolean {
    return this.userPoints >= points;
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
