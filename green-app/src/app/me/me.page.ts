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
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonAvatar,
  ModalController
} from '@ionic/angular/standalone';
import { Router } from "@angular/router";
import { addIcons } from 'ionicons';
import {
  person,
  location,
  calendar,
  male,
  female,
  trophy,
  logOutOutline,
  settingsOutline,
  flame,
  gift
} from 'ionicons/icons';
import {DecimalPipe, CommonModule, DatePipe} from "@angular/common";
import { AuthService, UserProfile } from '../core/services/auth.service';
import { ProfileService } from '../core/services/profile.service';
import { firstValueFrom } from 'rxjs';
import { EditProfileModal } from './edit-profile-modal.component';
import { MyRewardsModal } from './my-rewards-modal.component';

@Component({
  selector: 'app-me',
  templateUrl: 'me.page.html',
  styleUrls: ['me.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonItem,
    IonLabel,
    IonButton,
    IonIcon,
    IonAvatar,
    DecimalPipe,
    CommonModule,
    DatePipe
  ]
})
export class MePage implements OnInit {
  userProfile: UserProfile | null = null;
  isLoading = false;

  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
    private router: Router,
    private modalController: ModalController
  ) {
    addIcons({
      person,
      location,
      calendar,
      male,
      female,
      trophy,
      logOutOutline,
      settingsOutline,
      flame,
      gift
    });
  }

  ngOnInit() {
    this.loadProfile();
    
    // Subscribe to user changes to auto-update profile
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        // Reload profile from backend to get latest rank, points, streak
        // This ensures we have the most up-to-date data
        this.loadProfile();
      }
    });
  }

  async loadProfile() {
    const user = this.authService.currentUser;
    if (!user) {
      return;
    }

    this.isLoading = true;
    try {
      const profile = await firstValueFrom(this.profileService.getProfile(user.id));
      if (profile) {
        this.userProfile = profile;
        // Only update authService if data has changed (to avoid infinite loop)
        if (user.rank !== profile.rank || user.greenPoints !== profile.greenPoints || user.streak !== profile.streak) {
          this.authService.setUser(profile);
        }
      }
    } catch (error: any) {
      console.error('Error loading profile:', error);
      // Fallback to stored user
      this.userProfile = user;
    } finally {
      this.isLoading = false;
    }
  }

  getGenderIcon(): string {
    const gender = this.userProfile?.gender?.toLowerCase();
    if (gender === 'nam' || gender === 'male') {
      return 'male';
    } else if (gender === 'nữ' || gender === 'female') {
      return 'female';
    }
    return 'person'; // Default icon for "Khác" or unknown
  }

  getGenderText(): string {
    const gender = this.userProfile?.gender;
    if (!gender) {
      return 'Chưa cập nhật';
    }
    // Backend now sends "Nam", "Nữ", "Khác" (Vietnamese)
    if (gender === 'Nam' || gender === 'male') {
      return 'Nam';
    } else if (gender === 'Nữ' || gender === 'female') {
      return 'Nữ';
    } else if (gender === 'Khác' || gender === 'other') {
      return 'Khác';
    }
    return gender; // Return as-is if unknown format
  }

  getFormattedDate(): string {
    if (!this.userProfile?.dob) {
      return 'Chưa cập nhật';
    }
    try {
      const date = new Date(this.userProfile.dob);
      return date.toLocaleDateString('vi-VN');
    } catch (e) {
      return this.userProfile.dob;
    }
  }

  logout() {
    this.authService.logout();
  }

  async openSettings() {
    if (!this.userProfile) {
      return;
    }

    const modal = await this.modalController.create({
      component: EditProfileModal,
      componentProps: {
        profile: this.userProfile
      },
      cssClass: 'edit-profile-modal'
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data && data.updated) {
      // Reload profile
      await this.loadProfile();
      // Update auth service with new profile
      if (data.profile) {
        this.authService.setUser(data.profile);
      }
    }
  }

  async openMyRewards() {
    const modal = await this.modalController.create({
      component: MyRewardsModal,
      cssClass: 'my-rewards-modal'
    });

    await modal.present();
  }
}
