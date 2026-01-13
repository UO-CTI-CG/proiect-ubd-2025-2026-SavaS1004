import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  IonicModule,
  AlertController,
  ToastController,
  LoadingController,
  ViewWillEnter,
} from '@ionic/angular';
import { homeOutline, personCircleOutline, trashOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-workout-detail',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
  templateUrl: './detail.page.html',
  styles: [
    `
      .meta-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
        color: var(--ion-color-medium);
      }
      .set-tag {
        margin-right: 8px;
        font-size: 0.9em;
        padding: 2px 6px;
        background: var(--ion-color-light);
        border-radius: 4px;
      }
    `,
  ],
})
// 2. Implement the interface
export class DetailPage implements OnInit, ViewWillEnter {
  workout: any = null;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private router: Router,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {
    addIcons({ trashOutline, homeOutline, personCircleOutline });
  }

  ngOnInit() {
    // 3. Leave this empty or for one-time setup only.
    // Fetching here won't re-trigger when coming back from Edit.
  }

  // 4. Move fetch logic here. This runs every time the view becomes active.
  ionViewWillEnter() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadWorkout(id);
    } else {
      this.router.navigate(['/home']);
    }
  }

  async loadWorkout(id: string) {
    // Optional: Only show loading spinner if we don't have data yet
    // to prevent flickering when just refreshing updated data
    let loading: HTMLIonLoadingElement | null = null;

    if (!this.workout) {
      loading = await this.loadingCtrl.create({ message: 'Loading...' });
      await loading.present();
    }

    this.api.get<any>(`workout/${id}`).subscribe({
      next: (data) => {
        this.workout = data;
        this.isLoading = false;
        if (loading) loading.dismiss();
      },
      error: async () => {
        this.isLoading = false;
        if (loading) loading.dismiss();
        const toast = await this.toastCtrl.create({
          message: 'Workout not found',
          duration: 2000,
          color: 'danger',
        });
        await toast.present();
        this.router.navigate(['/home']);
      },
    });
  }

  async confirmDelete() {
    const alert = await this.alertCtrl.create({
      header: 'Delete Workout?',
      message: 'This cannot be undone.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => this.deleteWorkout(),
        },
      ],
    });
    await alert.present();
  }

  deleteWorkout() {
    if (!this.workout) return;

    this.api.delete(`workout/${this.workout.id}`).subscribe({
      next: async () => {
        const toast = await this.toastCtrl.create({
          message: 'Workout deleted',
          duration: 2000,
          color: 'medium',
        });
        await toast.present();
        this.router.navigate(['/home'], { replaceUrl: true });
      },
      error: () => {
        // Handle error (e.g. show toast)
      },
    });
  }
  goToHome() {
    this.router.navigate(['/home']);
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }
}
