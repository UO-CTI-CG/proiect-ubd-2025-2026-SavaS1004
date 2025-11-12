namespace GameTemetry.Models
{
    public class Workout
    {
        public int Id { get; set; }

        // Foreign Keys
        public int UserId { get; set; }

        // Properties
        public DateTime WorkoutDate { get; set; } = DateTime.UtcNow;
        public int DurationMinutes { get; set; } // Durata sesiunii în minute
        public string Notes { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        public User User { get; set; } = null!;
        public ICollection<WorkoutExercise> WorkoutExercises { get; set; } = new List<WorkoutExercise>();
    }
}
