import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import {
  IonicModule,
  LoadingController,
  ToastController,
} from '@ionic/angular';

import { ApiService } from '../../core/services/api.service';

export interface Workout {
  id: number;
  userId: number;
  workoutDate: string; // ISO from API
  durationMinutes: number;
  notes?: string | null;
}

type HomeStats = {
  totalWorkouts: number;
  last7DaysWorkouts: number;
  avgDurationMinutes: number;
  lastWorkoutDateLabel: string;
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  userId: number | null = null;

  stats: HomeStats = {
    totalWorkouts: 0,
    last7DaysWorkouts: 0,
    avgDurationMinutes: 0,
    lastWorkoutDateLabel: '-',
  };

  recentWorkouts: Workout[] = [];
  isLoading = false;

  constructor(
    private api: ApiService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit(): void {
    this.userId = this.getUserIdFromStorage();
    if (!this.userId) {
      this.router.navigateByUrl('/login', { replaceUrl: true });
      return;
    }
    this.loadHome();
  }

  ionViewWillEnter(): void {
    if (this.userId) this.loadHome();
  }

  private getUserIdFromStorage(): number | null {
    const raw = sessionStorage.getItem('userId');
    const parsed = raw ? Number(raw) : NaN;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }

  async loadHome(): Promise<void> {
    if (!this.userId || this.isLoading) return;

    this.isLoading = true;
    const loading = await this.loadingCtrl.create({
      message: 'Loading dashboard...',
      spinner: 'crescent',
    });
    await loading.present();

    //Endpoint
    this.api.get<Workout[]>('workout').subscribe({
      next: (allWorkouts: Workout[]) => {
        const myWorkouts = (allWorkouts ?? []).filter(
          (w) => w.userId === this.userId
        );

        const sorted = [...myWorkouts].sort((a, b) => {
          const da = new Date(a.workoutDate).getTime();
          const db = new Date(b.workoutDate).getTime();
          return db - da;
        });

        this.recentWorkouts = sorted.slice(0, 5);
        this.computeStats(sorted);

        this.isLoading = false;
        loading.dismiss();
      },
      error: async () => {
        this.isLoading = false;
        await loading.dismiss();
        await this.toast(
          'Failed to load workouts. Check API connection.',
          'danger'
        );
      },
    });
  }

  private computeStats(sortedWorkoutsDesc: Workout[]): void {
    const total = sortedWorkoutsDesc.length;

    const avgDuration =
      total === 0
        ? 0
        : Math.round(
            sortedWorkoutsDesc.reduce(
              (sum, w) => sum + (w.durationMinutes ?? 0),
              0
            ) / total
          );

    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

    const last7DaysCount = sortedWorkoutsDesc.filter((w) => {
      const t = new Date(w.workoutDate).getTime();
      return Number.isFinite(t) && t >= sevenDaysAgo;
    }).length;

    const lastDateLabel =
      total === 0
        ? '-'
        : new Date(sortedWorkoutsDesc[0].workoutDate).toLocaleString();

    this.stats = {
      totalWorkouts: total,
      last7DaysWorkouts: last7DaysCount,
      avgDurationMinutes: avgDuration,
      lastWorkoutDateLabel: lastDateLabel,
    };
  }

  createWorkout(): void {
    this.router.navigateByUrl('/workouts/create');
  }

  openWorkout(workout: Workout): void {
    this.router.navigate(['/workouts', workout.id]);
  }

  async logout(): Promise<void> {
    sessionStorage.removeItem('userId');
    await this.toast('Logged out.', 'medium');
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  trackByWorkoutId = (_: number, w: Workout): number => w.id;

  private async toast(
    message: string,
    color: 'success' | 'danger' | 'warning' | 'medium' = 'medium'
  ): Promise<void> {
    const t = await this.toastCtrl.create({
      message,
      duration: 2500,
      color,
      position: 'bottom',
    });
    await t.present();
  }
}
