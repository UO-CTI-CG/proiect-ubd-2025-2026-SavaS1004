export interface PerformanceMetricDto {
  id: number;
  userId: number;
  exerciseId: number;
  exerciseName: string;
  totalVolume: number;
  averageReps: number;
  averageRIR: number;
  maxWeight: number;
  workoutsCount: number;
  lastPerformed: string;
}
