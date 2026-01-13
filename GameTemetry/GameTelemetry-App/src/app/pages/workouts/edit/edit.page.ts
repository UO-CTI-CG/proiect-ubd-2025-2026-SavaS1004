import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, NavController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { addIcons } from 'ionicons';
import {
  homeOutline,
  personCircleOutline,
  trashOutline,
  saveOutline,
} from 'ionicons/icons';

interface ExerciseOption {
  id: number;
  name: string;
}

interface WorkoutExerciseEntry {
  exerciseId: number;
  reps: number;
  sets: number;
  weight: number;
  rir: number;
  rpe: number;
  durationSeconds: number;
  notes: string;
  orderInWorkout: number;
}

interface CreateWorkoutDto {
  userId: number;
  workoutDate: string;
  durationMinutes: number;
  notes: string;
  exercises: WorkoutExerciseEntry[];
}

@Component({
  selector: 'app-workout-edit',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './edit.page.html',
  styleUrls: ['./edit.page.scss'],
})
export class EditWorkoutPage implements OnInit {
  workoutId: number | null = null;

  // Form Data
  workoutDate: string = new Date().toISOString();
  durationMinutes: number = 60;
  notes: string = '';

  // Exercise Management
  availableExercises: ExerciseOption[] = [];
  addedExercises: WorkoutExerciseEntry[] = [];

  // Selection Draft
  selectedExerciseId: number | null = null;

  constructor(
    private api: ApiService,
    private toastCtrl: ToastController,
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private router: Router
  ) {
    addIcons({ trashOutline, saveOutline, homeOutline, personCircleOutline });
  }

  ngOnInit() {
    this.loadExercises();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.workoutId = +id;
      this.loadWorkoutDetails(id);
    } else {
      this.showToast('Invalid workout ID', 'danger');
      this.navCtrl.navigateBack('/workouts');
    }
  }

  loadExercises() {
    this.api.get<ExerciseOption[]>('exercise').subscribe({
      next: (data) => (this.availableExercises = data),
      error: () => this.showToast('Failed to load exercises list', 'danger'),
    });
  }

  loadWorkoutDetails(id: string) {
    // 1. FIX: Ensure we hit the singular endpoint if that is your backend structure
    this.api.get<any>(`workout/${id}`).subscribe({
      next: (data) => {
        // Handle if response is wrapped in { workout: ... } or flat
        const workout = data.workout || data;

        this.workoutDate = workout.workoutDate;
        this.durationMinutes = workout.durationMinutes;
        this.notes = workout.notes;

        // 2. FIX: Handle Singular vs Plural backend naming
        // If backend returns 'exercise' (singular list) or 'exercises'
        const rawExercises = workout.exercise || workout.exercises || [];

        this.addedExercises = rawExercises.map((ex: any) => ({
          exerciseId: ex.exerciseId,
          reps: ex.reps,
          sets: ex.sets,
          weight: ex.weight,
          rir: ex.rir,
          rpe: ex.rpe,
          durationSeconds: ex.durationSeconds,
          notes: ex.notes,
          orderInWorkout: ex.orderInWorkout,
        }));
      },
      error: () => {
        this.showToast('Failed to load workout details.', 'danger');
        this.navCtrl.navigateBack('/workouts');
      },
    });
  }

  addExercise() {
    if (!this.selectedExerciseId) return;

    const newEntry: WorkoutExerciseEntry = {
      exerciseId: this.selectedExerciseId,
      reps: 10,
      sets: 3,
      weight: 0,
      rir: 2,
      rpe: 8,
      durationSeconds: 0,
      notes: '',
      orderInWorkout: this.addedExercises.length + 1,
    };

    this.addedExercises.push(newEntry);
    this.selectedExerciseId = null;
  }

  removeExercise(index: number) {
    this.addedExercises.splice(index, 1);
  }

  getExerciseName(id: number): string {
    return (
      this.availableExercises.find((e) => e.id === id)?.name || 'Loading...'
    );
  }

  // --- UPDATED FUNCTION ---
  async updateWorkout() {
    if (!this.workoutId) return;

    const userId = Number(sessionStorage.getItem('userId'));

    if (this.addedExercises.length === 0) {
      this.showToast('Please keep at least one exercise.', 'warning');
      return;
    }

    const payload: CreateWorkoutDto = {
      userId: userId,
      workoutDate: this.workoutDate,
      durationMinutes: this.durationMinutes,
      notes: this.notes,
      exercises: this.addedExercises.map((ex, idx) => ({
        ...ex,
        orderInWorkout: idx + 1,
        workoutId: this.workoutId ?? 0,
      })),
    };

    this.api.put(`workout/${this.workoutId}`, payload).subscribe({
      next: async () => {
        await this.showToast('Workout updated successfully!', 'success');
        // Note: The DETAILS page must use ionViewWillEnter to see this update
        this.navCtrl.navigateBack(`/workouts/${this.workoutId}`);
      },
      error: (err) => {
        console.error(err);
        this.showToast('Failed to update workout.', 'danger');
      },
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
  goToHome() {
    this.router.navigate(['/home']);
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }
}
