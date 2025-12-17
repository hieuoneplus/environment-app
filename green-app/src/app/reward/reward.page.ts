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
import { ProfileService } from '../core/services/profile.service';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

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
  showConfirmDialog = false;
  selectedReward: RewardDTO | null = null;

  categories = [
    { value: 'all', label: 'Tất cả' },
    { value: 'ELECTRONIC_VOUCHER', label: 'Voucher điện tử' },
    { value: 'FOOD_DRINK', label: 'Ăn uống' },
    { value: 'PERSONAL_ITEM', label: 'Đồ dùng cá nhân' },
    { value: 'GREEN_GIFT', label: 'Quà tặng xanh' },
    { value: 'FASHION', label: 'Thời trang' },
    { value: 'EXPERIENCE', label: 'Trải nghiệm' },
    { value: 'SOCIAL_IMPACT', label: 'Tác động xã hội' }
  ];

  getCategoryLabel(category: string): string {
    const cat = this.categories.find(c => c.value === category);
    return cat ? cat.label : category;
  }

  constructor(
    private authService: AuthService,
    private rewardService: RewardService,
    private profileService: ProfileService,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {
    addIcons({ diamond });
  }

  ngOnInit() {
    this.loadUserPoints();
    this.loadRewards();
  }

  loadUserPoints() {
    this.authService.currentUser$.subscribe(user => {
      if(user) {
        this.userPoints = user.greenPoints;
      }
    });
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

    this.selectedReward = reward;
    this.showConfirmDialog = true;
  }

  closeConfirmDialog() {
    this.showConfirmDialog = false;
    this.selectedReward = null;
  }

  async handleConfirmExchange() {
    if (!this.selectedReward) {
      console.error('No reward selected');
      return;
    }

    const reward = this.selectedReward;
    this.closeConfirmDialog();
    
    // Small delay to ensure dialog closes smoothly
    setTimeout(() => {
      this.confirmExchange(reward);
    }, 100);
  }

  async confirmExchange(reward: RewardDTO): Promise<void> {
    if (!reward) {
      console.error('Reward is null in confirmExchange');
      this.showToast('Lỗi: Không tìm thấy phần thưởng', 'danger');
      return;
    }

    const user = this.authService.currentUser;
    if (!user || !user.id) {
      console.error('User is null or missing id');
      this.showToast('Vui lòng đăng nhập', 'danger');
      return;
    }

    if (!reward.id) {
      console.error('Reward missing id');
      this.showToast('Lỗi: Phần thưởng không hợp lệ', 'danger');
      return;
    }

    console.log('Starting reward exchange:', {
      userId: user.id,
      rewardId: reward.id,
      rewardName: reward.name,
      userPoints: user.greenPoints,
      rewardPoints: reward.points
    });

    const loading = await this.loadingController.create({
      message: 'Đang xử lý...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const apiUrl = `${environment.apiBase}/api/rewards/${reward.id}/exchange?userId=${user.id}`;
      console.log('Calling exchangeReward API...', { url: apiUrl });

      const result = await firstValueFrom(this.rewardService.exchangeReward(user.id, reward.id));
      console.log('Exchange API response:', result);

      // Reload user profile from backend to get updated points
      try {
        const updatedProfile = await firstValueFrom(this.profileService.getProfile(user.id));
        if (updatedProfile) {
          this.authService.setUser(updatedProfile);
          this.userPoints = updatedProfile.greenPoints;
          console.log('User points updated from backend:', this.userPoints);
        }
      } catch (profileError) {
        console.warn('Could not reload profile, using manual update:', profileError);
        // Fallback: manually update points
        const currentUser = this.authService.currentUser;
        if (currentUser) {
          currentUser.greenPoints -= reward.points;
          this.authService.setUser(currentUser);
          this.userPoints = currentUser.greenPoints;
        }
      }

      // Reload rewards to update canAfford status
      await this.loadRewards();

      await loading.dismiss();
      this.showToast(`Đã đổi thành công "${reward.name}"!`, 'success');
    } catch (error: any) {
      console.error('Error exchanging reward:', error);
      console.error('Error details:', {
        status: error?.status,
        statusText: error?.statusText,
        message: error?.message,
        error: error?.error
      });

      await loading.dismiss();
      const errorMessage = error?.error?.message || error?.message || 'Không thể đổi quà. Vui lòng thử lại.';
      this.showToast('Lỗi: ' + errorMessage, 'danger');
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
