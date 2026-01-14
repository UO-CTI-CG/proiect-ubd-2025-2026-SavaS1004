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
import {
  homeOutline,
  personCircleOutline,
  trashOutline,
  documentTextOutline,
  downloadOutline,
  cloudUploadOutline,
} from 'ionicons/icons';
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
    addIcons({
      trashOutline,
      homeOutline,
      personCircleOutline,
      documentTextOutline,
      downloadOutline,
      cloudUploadOutline,
    });
  }

  ngOnInit() {}

  ionViewWillEnter() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadWorkout(id);
    } else {
      this.router.navigate(['/home']);
    }
  }

  async loadWorkout(id: string) {
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

  // --- CSV / JSON EXPORT & IMPORT LOGIC

  // 1. Export THIS specific workout as JSON
  async exportThisWorkoutJson() {
    if (!this.workout) return;

    const loading = await this.loadingCtrl.create({
      message: 'Exporting JSON...',
    });
    await loading.present();

    this.api
      .download(`Workout/export-json-workout/${this.workout.id}`)
      .subscribe({
        next: (blob) => {
          this.downloadFile(blob, `workout-${this.workout.id}.json`);
          loading.dismiss();
          this.showToast('Workout exported as JSON');
        },
        error: () => {
          loading.dismiss();
          this.showToast('Export failed', 'danger');
        },
      });
  }

  // 2. Export ALL workouts as CSV
  async exportAllCsv() {
    const loading = await this.loadingCtrl.create({
      message: 'Exporting CSV...',
    });
    await loading.present();

    this.api.download('Workout/export').subscribe({
      next: (blob) => {
        const dateStr = new Date().toISOString().split('T')[0];
        this.downloadFile(blob, `all_workouts_${dateStr}.csv`);
        loading.dismiss();
        this.showToast('All workouts exported as CSV');
      },
      error: () => {
        loading.dismiss();
        this.showToast('Export failed', 'danger');
      },
    });
  }

  // 3. Import CSV
  triggerFileInput() {
    document.getElementById('csvFileInput')?.click();
  }

  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const loading = await this.loadingCtrl.create({ message: 'Importing...' });
    await loading.present();

    const formData = new FormData();
    formData.append('file', file);

    this.api.upload('Workout/import', formData).subscribe({
      next: (res) => {
        loading.dismiss();
        this.showToast('Workouts imported successfully!');
        // Clear input so same file can be selected again if needed
        event.target.value = '';
      },
      error: (err) => {
        loading.dismiss();
        this.showToast('Import failed. Check CSV format.', 'danger');
      },
    });
  }

  // Helper to trigger browser download
  private downloadFile(blob: Blob, fileName: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  async showToast(msg: string, color: string = 'medium') {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000,
      color: color,
    });
    await toast.present();
  }

  // --- END IMPORT/EXPORT ---

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
        this.showToast('Workout deleted');
        this.router.navigate(['/home'], { replaceUrl: true });
      },
      error: () => {
        this.showToast('Delete failed', 'danger');
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
