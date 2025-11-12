namespace GameTemetry.Models
{
    public class WorkoutExercise
    {
        public int Id { get; set; }

        // Foreign Keys
        public int WorkoutId { get; set; }
        public int ExerciseId { get; set; }

        // Exercise Details
        public int Reps { get; set; }
        public int Sets { get; set; }
        public decimal? Weight { get; set; } // în kg, nullable dacă bodyweight
        public int RIR { get; set; } // Reps In Reserve (0-10)
        public int RPE { get; set; } // Rate of Perceived Exertion (1-10)
        public int DurationSeconds { get; set; }
        public string Notes { get; set; } = string.Empty;
        public int OrderInWorkout { get; set; } // Ordinea în care s-a executat
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        public Workout Workout { get; set; } = null!;
        public Exercise Exercise { get; set; } = null!;
    }
}
