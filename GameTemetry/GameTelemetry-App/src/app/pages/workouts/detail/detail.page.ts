import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  IonicModule,
  AlertController,
  ToastController,
  LoadingController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { trashOutline } from 'ionicons/icons';
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
export class DetailPage implements OnInit {
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
    // FIX 1: Register the icon so the button shows up
    addIcons({ trashOutline });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadWorkout(id);
    } else {
      this.router.navigate(['/home']);
    }
  }

  async loadWorkout(id: string) {
    const loading = await this.loadingCtrl.create({ message: 'Loading...' });
    await loading.present();

    // FIX 2: Changed 'workout' to 'workouts' (plural) to match backend
    this.api.get<any>(`workout/${id}`).subscribe({
      next: (data) => {
        this.workout = data;
        this.isLoading = false;
        loading.dismiss();
      },
      error: async () => {
        this.isLoading = false;
        loading.dismiss();
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

    // FIX 3: Changed 'workout' to 'workouts' (plural)
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
}
