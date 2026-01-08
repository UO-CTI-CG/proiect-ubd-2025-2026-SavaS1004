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
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class LoginPage implements OnInit, OnDestroy {
  email = '';
  password = '';

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

  async onLogin(): Promise<void> {
    this.hasAttemptedSubmit = true;

    if (!this.isFormValid()) {
      await this.toast('Fix validation errors.', 'warning');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Logging in...',
      spinner: 'crescent',
    });
    await loading.present();

    this.auth.login(this.email, this.password).subscribe({
      next: async (res) => {
        await loading.dismiss();
        await this.toast(`Welcome back, ${res.username}!`, 'success');
        const ok = await this.router.navigateByUrl('/home', {
          replaceUrl: true,
        });
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

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  private isFormValid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.email || !emailRegex.test(this.email)) return false;
    if (!this.password || this.password.length < 6) return false;
    return true;
  }

  isEmailValid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return !this.email || emailRegex.test(this.email);
  }

  isPasswordValid(): boolean {
    return !this.password || this.password.length >= 6;
  }

  isSubmitDisabled(): boolean {
    return this.isLoading || !this.isFormValid();
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
