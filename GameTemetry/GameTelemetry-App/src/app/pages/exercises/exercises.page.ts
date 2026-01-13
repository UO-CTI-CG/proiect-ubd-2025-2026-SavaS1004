import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonicModule,
  ToastController,
  LoadingController,
  AlertController,
} from '@ionic/angular';
import { ApiService } from '../../core/services/api.service';
import { RouterModule } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  add,
  pencilOutline,
  trashOutline,
  homeOutline,
  personCircleOutline,
} from 'ionicons/icons'; // Import icons
import { Router } from '@angular/router';
export interface Exercise {
  id: number;
  name: string;
  category: string;
  description: string;
}

@Component({
  selector: 'app-exercises',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
  templateUrl: './exercises.page.html',
  styles: [
    `
      ion-note {
        font-size: 0.8rem;
      }
    `,
  ],
})
export class ExercisesPage implements OnInit {
  exercises: Exercise[] = [];
  groupedExercises: { [key: string]: Exercise[] } = {};
  categories: string[] = [];
  isLoading = false;

  constructor(
    private api: ApiService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private router: Router
  ) {
    // Register all icons used in HTML
    addIcons({
      add,
      pencilOutline,
      trashOutline,
      homeOutline,
      personCircleOutline,
    });
  }

  ngOnInit() {
    this.loadExercises();
  }

  ionViewWillEnter() {
    this.loadExercises();
  }

  async loadExercises() {
    let loading: HTMLIonLoadingElement | null = null;

    if (this.exercises.length === 0) {
      this.isLoading = true;
      loading = await this.loadingCtrl.create({
        message: 'Loading exercises...',
      });
      await loading.present();
    }

    this.api.get<Exercise[]>('exercise').subscribe({
      next: (data) => {
        this.exercises = data;
        this.groupExercisesByCategory();
        this.isLoading = false;
        if (loading) loading.dismiss();
      },
      error: async () => {
        this.isLoading = false;
        if (loading) loading.dismiss();
        const toast = await this.toastCtrl.create({
          message: 'Failed to load exercises.',
          duration: 2000,
          color: 'danger',
        });
        await toast.present();
      },
    });
  }

  private groupExercisesByCategory() {
    this.groupedExercises = this.exercises.reduce((acc, ex) => {
      const cat = ex.category || 'Uncategorized';
      (acc[cat] = acc[cat] || []).push(ex);
      return acc;
    }, {} as { [key: string]: Exercise[] });

    this.categories = Object.keys(this.groupedExercises).sort();
  }
  //Navigation functions
  goToHome() {
    this.router.navigate(['/home']);
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }
  // =========================================================
  // ADD EXERCISE
  // =========================================================

  async openAddExerciseAlert() {
    const alert = await this.alertCtrl.create({
      header: 'New Exercise',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Name (e.g. Bench Press)',
        },
        {
          name: 'category',
          type: 'text',
          placeholder: 'Category (e.g. Chest)',
        },
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Save',
          handler: (data) => {
            if (data.name && data.category) {
              this.createExercise(data.name, data.category);
            } else {
              this.showToast('Name and Category are required', 'warning');
              return false;
            }
            return true;
          },
        },
      ],
    });
    await alert.present();
  }

  createExercise(name: string, category: string) {
    const payload = { name, category, description: '' };
    this.api.post('exercise', payload).subscribe({
      next: () => {
        this.showToast('Exercise added!', 'success');
        this.loadExercises();
      },
      error: () => this.showToast('Failed to add exercise.', 'danger'),
    });
  }

  // =========================================================
  // EDIT EXERCISE
  // =========================================================

  async openEditExerciseAlert(exercise: Exercise) {
    const alert = await this.alertCtrl.create({
      header: 'Edit Exercise',
      inputs: [
        {
          name: 'name',
          type: 'text',
          value: exercise.name,
          placeholder: 'Name',
        },
        {
          name: 'category',
          type: 'text',
          value: exercise.category,
          placeholder: 'Category',
        },
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Update',
          handler: (data) => {
            if (data.name && data.category) {
              this.updateExercise(exercise.id, data.name, data.category);
            } else {
              this.showToast('Name and Category are required', 'warning');
              return false;
            }
            return true;
          },
        },
      ],
    });
    await alert.present();
  }

  updateExercise(id: number, name: string, category: string) {
    const payload = { id, name, category, description: '' };
    this.api.put(`exercise/${id}`, payload).subscribe({
      next: () => {
        this.showToast('Exercise updated!', 'success');
        this.loadExercises();
      },
      error: () => this.showToast('Failed to update exercise.', 'danger'),
    });
  }

  // =========================================================
  // DELETE EXERCISE
  // =========================================================

  async confirmDelete(id: number) {
    const alert = await this.alertCtrl.create({
      header: 'Delete Exercise?',
      message: 'Are you sure you want to delete this exercise?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.deleteExercise(id);
          },
        },
      ],
    });
    await alert.present();
  }

  deleteExercise(id: number) {
    this.api.delete(`exercise/${id}`).subscribe({
      next: () => {
        this.showToast('Exercise deleted', 'medium');
        this.exercises = this.exercises.filter((e) => e.id !== id);
        this.loadExercises();
      },
      error: () => this.showToast('Could not delete exercise', 'danger'),
    });
  }

  private async showToast(msg: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000,
      color: color,
    });
    toast.present();
  }
}
