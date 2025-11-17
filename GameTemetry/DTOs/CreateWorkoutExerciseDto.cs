namespace GameTemetry.DTOs
{
    public class CreateWorkoutExerciseDto
    {
        public int ExerciseId { get; set; }
        public int Reps { get; set; }
        public int Sets { get; set; }
        public decimal? Weight { get; set; }
        public int RIR { get; set; }
        public int RPE { get; set; }
        public int DurationSeconds { get; set; }
        public string? Notes { get; set; }
        public int OrderInWorkout { get; set; }
    }
}
