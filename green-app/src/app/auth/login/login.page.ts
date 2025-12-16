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
  IonSpinner,
  ToastController,
  LoadingController
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { mailOutline, lockClosedOutline, leafOutline, eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { AuthService } from '../../core/services/auth.service';
import { firstValueFrom } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
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
    IonSpinner,
    FormsModule,
    CommonModule
  ]
})
export class LoginPage implements OnInit {
  email = '';
  password = '';
  showPassword = false;
  isLoading = false;
  isSubmitting = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {
    addIcons({ mailOutline, lockClosedOutline, leafOutline, eyeOutline, eyeOffOutline });
  }

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.router.navigateByUrl('/app');
    }
  }

  async login() {
    // Validation
    if (!this.email || !this.password) {
      await this.showToast('Vui lòng điền đầy đủ thông tin', 'warning');
      return;
    }

    if (!this.isValidEmail(this.email)) {
      await this.showToast('Email không hợp lệ', 'warning');
      return;
    }

    this.isSubmitting = true;
    const loading = await this.loadingController.create({
      message: 'Đang đăng nhập...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      await firstValueFrom(this.authService.login(this.email, this.password));
      await loading.dismiss();
      await this.showToast('Đăng nhập thành công!', 'success');
      this.router.navigateByUrl('/app');
    } catch (error: any) {
      await loading.dismiss();
      const errorMessage = error?.error?.message || error?.message || 'Email hoặc mật khẩu không đúng';
      await this.showToast(errorMessage, 'danger');
      console.error('Login error:', error);
    } finally {
      this.isSubmitting = false;
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  goRegister() {
    this.router.navigateByUrl('/register');
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
