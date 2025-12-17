import { Component, OnInit, OnDestroy } from '@angular/core';
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
  IonCheckbox,
  IonBadge,
  IonChip,
  IonFab,
  IonFabButton,
  IonFabList,
  ModalController,
  LoadingController,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  notificationsOutline,
  settingsOutline,
  flame,
  checkmarkCircle,
  squareOutline,
  location,
  add,
  water,
  trash,
  bus,
  chevronForwardOutline
} from 'ionicons/icons';
import {DecimalPipe, CommonModule} from "@angular/common";
import { AuthService } from '../core/services/auth.service';
import { HomeService, HabitDTO, LocationDTO } from '../core/services/home.service';
import { HabitService } from '../core/services/habit.service';
import { firstValueFrom } from 'rxjs';
import { Subscription } from 'rxjs';
import { HabitSelectionModal } from './habit-selection-modal.component';
import {ContactDialogComponent} from "./contact-dialog.component";

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
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
    IonCheckbox,
    IonBadge,
    IonChip,
    DecimalPipe,
    CommonModule
  ],
})
export class HomePage implements OnInit, OnDestroy {
  userName: string = '';
  currentTime: string = '';
  greenPoints: number = 0;
  rank: string = '';
  streak: number = 0;

  habits: HabitDTO[] = [];
  nearbyLocations: LocationDTO[] = [];
  isLoading = false;
  private userSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private homeService: HomeService,
    private habitService: HabitService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private modalController: ModalController
  ) {
    addIcons({
      notificationsOutline,
      settingsOutline,
      flame,
      checkmarkCircle,
      squareOutline,
      location,
      add,
      water,
      trash,
      bus,
      chevronForwardOutline
    });
  }

  ngOnInit() {
    // Đảm bảo isLoading được set đúng
    this.isLoading = false;
    this.loadDashboard();

    // Subscribe to user changes to auto-update dashboard
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      if (user) {
        // Reload dashboard when user data changes (e.g., after reward exchange, activity submission)
        console.log('User data changed, reloading dashboard...', { greenPoints: user.greenPoints });
        this.loadDashboard();
      }
    });
  }

  ngOnDestroy() {
    // Unsubscribe to prevent memory leaks
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  async loadDashboard() {
    const user = this.authService.currentUser;
    if (!user) {
      console.warn('No user found');
      this.isLoading = false;
      this.userName = '';
      return;
    }

    console.log('Loading dashboard for user:', user.id);
    this.isLoading = true;
    try {
      const dashboard = await firstValueFrom(this.homeService.getDashboard(user.id));
      if (dashboard) {
        this.userName = dashboard.userName || user.name || 'Người dùng';
        this.currentTime = dashboard.greeting || '';
        // Use dashboard greenPoints (from backend) as primary source
        this.greenPoints = dashboard.greenPoints ?? user.greenPoints ?? 0;
        this.rank = dashboard.rank || user.rank || 'Chưa có hạng';
        this.streak = dashboard.streak ?? user.streak ?? 0;
        this.habits = dashboard.todayHabits || [];
        this.nearbyLocations = dashboard.nearbyLocations || [];

        // Update local user data to keep in sync
        if (user.greenPoints !== dashboard.greenPoints) {
          user.greenPoints = dashboard.greenPoints;
          user.rank = dashboard.rank;
          user.streak = dashboard.streak;
          this.authService.setUser(user);
        }

        console.log('Dashboard loaded successfully:', {
          userName: this.userName,
          greenPoints: this.greenPoints,
          habitsCount: this.habits.length
        });
      } else {
        // Fallback to user data if dashboard is null
        this.userName = user.name || 'Người dùng';
        this.greenPoints = user.greenPoints || 0;
        this.rank = user.rank || 'Chưa có hạng';
        this.streak = user.streak || 0;
        this.habits = [];
        this.nearbyLocations = [];
        console.log('Dashboard was null, using user data');
      }
    } catch (error: any) {
      console.error('Error loading dashboard:', error);
      const errorMessage = error?.error?.message || error?.message || 'Không thể tải dữ liệu';
      this.showToast('Lỗi khi tải dữ liệu: ' + errorMessage, 'danger');
      // Set default values on error - vẫn hiển thị content để user có thể thao tác
      this.userName = user.name || 'Người dùng';
      this.greenPoints = user.greenPoints || 0;
      this.rank = user.rank || 'Chưa có hạng';
      this.streak = user.streak || 0;
      this.habits = [];
      this.nearbyLocations = [];
      console.log('Using fallback data after error');
    } finally {
      // Đảm bảo isLoading luôn được set về false
      this.isLoading = false;
      console.log('Dashboard loading completed. isLoading:', this.isLoading, 'userName:', this.userName);
    }
  }

  async toggleHabit(habit: HabitDTO) {
    const user = this.authService.currentUser;
    if (!user) {
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Đang xử lý...'
    });
    await loading.present();

    try {
      const updatedHabit = await firstValueFrom(this.habitService.toggleHabit(user.id, habit.id));
      if (updatedHabit) {
        // Update local habit
        const index = this.habits.findIndex(h => h.id === habit.id);
        if (index !== -1) {
          this.habits[index] = updatedHabit;
        }

        // Reload dashboard to get updated points
        await this.loadDashboard();
        this.showToast(
          updatedHabit.completed
            ? `Đã hoàn thành! +${updatedHabit.points} điểm`
            : 'Đã hủy thói quen',
          'success'
        );
      }
    } catch (error: any) {
      console.error('Error toggling habit:', error);
      this.showToast('Lỗi: ' + (error?.error?.message || error.message), 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  async addHabit() {
    const modal = await this.modalController.create({
      component: HabitSelectionModal,
      componentProps: {
        currentHabits: this.habits.map(h => h.id),
        allHabits: []
      },
      cssClass: 'habit-selection-modal'
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data && data.selected && data.habit) {
      // Subscribe to the selected habit
      await this.subscribeToHabit(data.habit);
    }
  }

  async subscribeToHabit(habit: any) {
    const user = this.authService.currentUser;
    if (!user) {
      return;
    }

    // Check if habit is already in the list
    const existingHabit = this.habits.find(h => h.id === habit.id);
    if (existingHabit) {
      this.showToast('Thói quen này đã được thêm rồi!', 'warning');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Đang thêm thói quen...'
    });
    await loading.present();

    try {
      // Call backend to subscribe (create a UserHabit record for today with completed = false)
      await firstValueFrom(this.habitService.subscribeToHabit(user.id, habit.id));
      // Reload dashboard to show the new habit
      await this.loadDashboard();
      this.showToast(`Đã thêm thói quen: ${habit.name}`, 'success');
    } catch (error: any) {
      console.error('Error subscribing to habit:', error);
      this.showToast('Lỗi: ' + (error?.error?.message || error.message), 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  async openContactDialog() {
    const modal = await this.modalController.create({
      component: ContactDialogComponent,
      cssClass: 'contact-dialog-modal'
    });

    await modal.present();
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
