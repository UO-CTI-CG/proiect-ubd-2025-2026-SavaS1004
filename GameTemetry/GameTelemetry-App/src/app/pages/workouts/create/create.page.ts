import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, NavController } from '@ionic/angular';
import { ApiService } from '../../../core/services/api.service';
import { Router } from '@angular/router';

// Interfaces matching your Backend DTOs
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
  selector: 'app-workout-create',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './create.page.html',
  styleUrls: ['./create.page.scss'],
})
export class CreateWorkoutPage implements OnInit {
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
    private router: Router,
    private navCtrl: NavController
  ) {}

  ngOnInit() {
    this.loadExercises();
  }

  loadExercises() {
    this.api.get<ExerciseOption[]>('exercise').subscribe({
      next: (data) => (this.availableExercises = data),
      error: () => this.showToast('Failed to load exercises list', 'danger'),
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
      // Helper for UI display (not sent to backend, but useful)
      // We'll map it strictly before sending if needed,
      // but extra props usually ignored by JSON serializers
    };

    this.addedExercises.push(newEntry);
    this.selectedExerciseId = null; // Reset selection
  }

  removeExercise(index: number) {
    this.addedExercises.splice(index, 1);
  }

  getExerciseName(id: number): string {
    return (
      this.availableExercises.find((e) => e.id === id)?.name ||
      'Unknown Exercise'
    );
  }

  async saveWorkout() {
    const userId = Number(sessionStorage.getItem('userId'));

    if (!userId) {
      this.showToast('User session invalid. Please login again.', 'danger');
      return;
    }

    if (this.addedExercises.length === 0) {
      this.showToast('Please add at least one exercise.', 'warning');
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
        // Backend DTO requires WorkoutId but Controller overrides it.
        // We send 0 to satisfy [Required] validation if needed.
        workoutId: 0,
      })) as any,
    };

    this.api.post('workout', payload).subscribe({
      next: async () => {
        await this.showToast('Workout saved successfully!', 'success');
        this.navCtrl.navigateBack('/home'); // Go back to dashboard
      },
      error: (err) => {
        console.error(err);
        this.showToast('Failed to save workout.', 'danger');
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
}
