import { Component, OnInit } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
  IonIcon,
  IonSelect,
  IonSelectOption,
  IonDatetime,
  IonSpinner,
  ToastController,
  LoadingController
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  personOutline,
  mailOutline,
  lockClosedOutline,
  locationOutline,
  calendarOutline,
  peopleOutline,
  leafOutline,
  eyeOutline,
  eyeOffOutline
} from 'ionicons/icons';
import { AuthService } from '../../core/services/auth.service';
import { firstValueFrom } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  imports: [
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
    IonInput,
    IonItem,
    IonLabel,
    IonIcon,
    IonSelect,
    IonSelectOption,
    IonDatetime,
    IonSpinner,
    FormsModule,
    CommonModule
  ]
})
export class RegisterPage implements OnInit {
  form: any = {
    name: '',
    email: '',
    password: '',
    address: '',
    gender: '',
    dob: ''
  };
  showPassword = false;
  isSubmitting = false;
  maxDate: string;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {
    addIcons({
      personOutline,
      mailOutline,
      lockClosedOutline,
      locationOutline,
      calendarOutline,
      peopleOutline,
      leafOutline,
      eyeOutline,
      eyeOffOutline
    });
    // Set max date to today (allow any age)
    const today = new Date();
    this.maxDate = today.toISOString().split('T')[0];
  }

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.router.navigateByUrl('/app');
    }
  }

  async register() {
    // Validation
    if (!this.form.name || !this.form.email || !this.form.password) {
      await this.showToast('Vui lòng điền đầy đủ thông tin bắt buộc', 'warning');
      return;
    }

    if (!this.isValidEmail(this.form.email)) {
      await this.showToast('Email không hợp lệ', 'warning');
      return;
    }

    if (this.form.password.length < 6) {
      await this.showToast('Mật khẩu phải có ít nhất 6 ký tự', 'warning');
      return;
    }

    this.isSubmitting = true;
    const loading = await this.loadingController.create({
      message: 'Đang tạo tài khoản...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      // Send form data directly (no gender mapping)
      console.log('Registering with data:', JSON.stringify(this.form));

      await firstValueFrom(this.authService.register(this.form));
      await loading.dismiss();
      await this.showToast('Đăng ký thành công! Vui lòng đăng nhập', 'success');
      this.router.navigateByUrl('/login');
    } catch (error: any) {
      await loading.dismiss();
      const errorMessage = error?.error?.message || error?.message || 'Đăng ký thất bại. Vui lòng thử lại';
      await this.showToast(errorMessage, 'danger');
      console.error('Register error:', error);
    } finally {
      this.isSubmitting = false;
    }
  }


  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onGenderChange(event: any) {
    const selectedValue = event.detail.value;
    console.log('Gender selected from event:', selectedValue);
    console.log('Event detail:', event.detail);
    
    // Explicitly set the value
    this.form.gender = selectedValue;
    
    // Force change detection
    setTimeout(() => {
      console.log('Form gender after change (delayed):', this.form.gender);
    }, 100);
  }

  goLogin() {
    this.router.navigateByUrl('/login');
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private async showToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'top'
    });
    await toast.present();
  }
}

