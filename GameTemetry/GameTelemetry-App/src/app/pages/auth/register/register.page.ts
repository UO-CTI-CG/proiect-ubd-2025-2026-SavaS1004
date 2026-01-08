import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonicModule,
  LoadingController,
  ToastController,
} from '@ionic/angular';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UserAuthService } from '../../../core/services/user-auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class RegisterPage implements OnInit, OnDestroy {
  email = '';
  username = '';
  password = '';
  confirmPassword = '';

  showPassword = false;
  isLoading = false;
  hasAttemptedSubmit = false;

  private destroy$ = new Subject<void>();

  constructor(
    private auth: UserAuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit(): void {
    this.auth.isLoading$
      .pipe(takeUntil(this.destroy$))
      .subscribe((v) => (this.isLoading = v));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async onRegister(): Promise<void> {
    this.hasAttemptedSubmit = true;

    if (!this.isFormValid()) {
      await this.toast('Fix validation errors.', 'warning');
      return;
    }

    if (!this.confirmPasswordOk) {
      await this.toast('Passwords do not match.', 'warning');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Creating account...',
      spinner: 'crescent',
    });
    await loading.present();

    this.auth.register(this.email, this.username, this.password).subscribe({
      next: async (res) => {
        await loading.dismiss();
        await this.toast(
          `Account created. Welcome, ${res.username}!`,
          'success'
        );
        this.router.navigate(['/home']);
      },
      error: async (e: Error) => {
        await loading.dismiss();
        await this.toast(e.message, 'danger');
      },
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  private isFormValid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!this.email || !emailRegex.test(this.email)) return false;
    if (!this.username || this.username.length < 3) return false;

    if (!this.password || this.password.length < 6) return false;
    if (this.confirmPassword !== this.password) return false;

    return true;
  }

  isEmailValid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return !this.email || emailRegex.test(this.email);
  }

  isUsernameValid(): boolean {
    return !this.username || this.username.length >= 3;
  }

  isPasswordValid(): boolean {
    return !this.password || this.password.length >= 6;
  }

  isConfirmPasswordValid(): boolean {
    return !this.confirmPassword || this.confirmPassword === this.password;
  }

  isSubmitDisabled(): boolean {
    return (
      this.isLoading ||
      !this.isEmailValid() ||
      !this.isUsernameValid() ||
      !this.isPasswordValid() ||
      !this.confirmPasswordOk
    );
  }

  get confirmPasswordOk(): boolean {
    return !!this.confirmPassword && this.confirmPassword === this.password;
  }

  private async toast(
    message: string,
    color: 'success' | 'danger' | 'warning' | 'medium' = 'medium'
  ) {
    const t = await this.toastCtrl.create({
      message,
      duration: 2500,
      color,
      position: 'bottom',
    });
    await t.present();
  }
}
