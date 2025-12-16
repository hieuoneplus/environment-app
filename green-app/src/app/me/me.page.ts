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
  IonAvatar
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
  settingsOutline
} from 'ionicons/icons';
import {DecimalPipe, CommonModule, DatePipe} from "@angular/common";
import { AuthService, UserProfile } from '../core/services/auth.service';
import { ProfileService } from '../core/services/profile.service';
import { firstValueFrom } from 'rxjs';

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
    private router: Router
  ) {
    addIcons({
      person,
      location,
      calendar,
      male,
      female,
      trophy,
      logOutOutline,
      settingsOutline
    });
  }

  ngOnInit() {
    this.loadProfile();
    
    // Subscribe to user changes
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.userProfile = user;
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
        this.authService.setUser(profile);
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
    return this.userProfile?.gender === 'male' ? 'male' : 'female';
  }

  getGenderText(): string {
    return this.userProfile?.gender === 'male' ? 'Nam' : 'Nữ';
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
}
