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
  codeDownloadOutline, // Ensure this is imported
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
    // Register all icons used in the HTML
    addIcons({
      trashOutline,
      homeOutline,
      personCircleOutline,
      documentTextOutline,
      downloadOutline,
      cloudUploadOutline,
      codeDownloadOutline,
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

  // --- EXPORT LOGIC ---

  // 1. Export This (JSON)
  async exportThisWorkoutJson() {
    if (!this.workout) return;
    this.handleDownload(
      `Workout/export-json-workout/${this.workout.id}`,
      `workout-${this.workout.id}.json`,
      'JSON Export'
    );
  }

  // 2. Export All (CSV)
  async exportAllCsv() {
    const dateStr = new Date().toISOString().split('T')[0];
    this.handleDownload(
      'Workout/export',
      `all_workouts_${dateStr}.csv`,
      'CSV Export'
    );
  }

  // 3. Export All (JSON) - THIS WAS MISSING
  async exportAllJson() {
    const dateStr = new Date().toISOString().split('T')[0];
    this.handleDownload(
      'Workout/export-json-workouts',
      `all_workouts_${dateStr}.json`,
      'JSON Export'
    );
  }

  // Shared Download Helper
  private async handleDownload(
    endpoint: string,
    filename: string,
    label: string
  ) {
    const loading = await this.loadingCtrl.create({
      message: `Preparing ${label}...`,
    });
    await loading.present();

    this.api.download(endpoint).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        loading.dismiss();
        this.showToast(`${label} successful!`);
      },
      error: () => {
        loading.dismiss();
        this.showToast(`${label} failed.`, 'danger');
      },
    });
  }

  // --- IMPORT LOGIC (Dynamic) ---

  triggerFileInput() {
    document.getElementById('fileInput')?.click();
  }

  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    // 1. Detect Extension
    const fileName = file.name.toLowerCase();
    let endpoint = '';

    if (fileName.endsWith('.csv')) {
      endpoint = 'Workout/import';
    } else if (fileName.endsWith('.json')) {
      endpoint = 'Workout/import-json';
    } else {
      this.showToast(
        'Invalid file type. Please select .csv or .json',
        'warning'
      );
      return;
    }

    // 2. Upload
    const loading = await this.loadingCtrl.create({
      message: 'Importing Data...',
    });
    await loading.present();

    const formData = new FormData();
    formData.append('file', file);

    this.api.upload(endpoint, formData).subscribe({
      next: (res) => {
        loading.dismiss();
        this.showToast('Import successful!');
        event.target.value = ''; // Reset input

        // Refresh the page data if we are currently viewing a workout that might have changed
        // Or simply navigate home to see the new list
        this.router.navigate(['/home']);
      },
      error: (err) => {
        loading.dismiss();
        console.error(err);
        this.showToast('Import failed. Check file format.', 'danger');
      },
    });
  }

  // --- ACTIONS ---

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

  async showToast(msg: string, color: string = 'medium') {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000,
      color: color,
    });
    await toast.present();
  }

  goToHome() {
    this.router.navigate(['/home']);
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }
}
