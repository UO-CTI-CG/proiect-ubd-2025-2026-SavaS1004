import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonicModule,
  ToastController,
  LoadingController,
} from '@ionic/angular';
import { ApiService } from '../../core/services/api.service';
import { RouterModule } from '@angular/router';

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
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    this.loadExercises();
  }

  async loadExercises() {
    this.isLoading = true;
    const loading = await this.loadingCtrl.create({
      message: 'Loading exercises...',
    });
    await loading.present();

    this.api.get<Exercise[]>('exercise').subscribe({
      next: (data) => {
        this.exercises = data;
        this.groupExercisesByCategory();
        this.isLoading = false;
        loading.dismiss();
      },
      error: async () => {
        this.isLoading = false;
        loading.dismiss();
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
    // Group exercises by category for a cleaner list
    this.groupedExercises = this.exercises.reduce((acc, ex) => {
      (acc[ex.category] = acc[ex.category] || []).push(ex);
      return acc;
    }, {} as { [key: string]: Exercise[] });

    this.categories = Object.keys(this.groupedExercises).sort();
  }
}
