import { Component, OnInit, Input } from '@angular/core';
import { ModalController, ToastController, LoadingController } from '@ionic/angular/standalone';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonDatetime,
  IonButtons,
  IonButton as IonButtonDirective
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { close, checkmark, personOutline, locationOutline, calendarOutline, peopleOutline } from 'ionicons/icons';
import { ProfileService } from '../core/services/profile.service';
import { UserProfile } from '../core/services/auth.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-edit-profile-modal',
  templateUrl: './edit-profile-modal.component.html',
  styleUrls: ['./edit-profile-modal.component.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonDatetime,
    IonButtons,
    IonButtonDirective,
    CommonModule,
    FormsModule
  ],
  standalone: true
})
export class EditProfileModal implements OnInit {
  @Input() profile!: UserProfile;

  form: {
    name: string;
    address: string;
    gender: string;
    dob: string;
  } = {
    name: '',
    address: '',
    gender: '',
    dob: ''
  };

  maxDate: string;
  isSubmitting = false;

  constructor(
    private modalController: ModalController,
    private profileService: ProfileService,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {
    addIcons({ close, checkmark, personOutline, locationOutline, calendarOutline, peopleOutline });

    // Set max date to today
    const today = new Date();
    this.maxDate = today.toISOString().split('T')[0];
  }

  ngOnInit() {
    if (this.profile) {
      this.form = {
        name: this.profile.name || '',
        address: this.profile.address || '',
        gender: this.profile.gender || '',
        dob: this.profile.dob ? new Date(this.profile.dob).toISOString().split('T')[0] : ''
      };
    }
  }

  close() {
    this.modalController.dismiss();
  }

  async save() {
    if (!this.form.name || this.form.name.trim() === '') {
      this.showToast('Vui lòng nhập họ và tên', 'warning');
      return;
    }

    this.isSubmitting = true;
    const loading = await this.loadingController.create({
      message: 'Đang cập nhật...'
    });
    await loading.present();

    try {
      const updateData: Partial<UserProfile> = {
        name: this.form.name.trim(),
        address: this.form.address?.trim() || undefined,
        gender: this.form.gender || undefined,
        dob: this.form.dob || undefined
      };

      const updatedProfile = await firstValueFrom(
        this.profileService.updateProfile(this.profile.id, updateData)
      );

      await loading.dismiss();
      this.modalController.dismiss({ updated: true, profile: updatedProfile });
      this.showToast('Cập nhật thành công!', 'success');
    } catch (error: any) {
      await loading.dismiss();
      console.error('Error updating profile:', error);
      this.showToast('Lỗi: ' + (error?.error?.message || error.message || 'Không thể cập nhật'), 'danger');
      this.isSubmitting = false;
    }
  }

  onGenderChange(event: any) {
    this.form.gender = event.detail.value;
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
