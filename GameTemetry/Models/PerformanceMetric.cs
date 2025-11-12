namespace GameTemetry.Models
{
    public class PerformanceMetric
    {
        public int Id { get; set; }

        // Foreign Keys
        public int UserId { get; set; }
        public int ExerciseId { get; set; }

        // Metrics
        public decimal TotalVolume { get; set; } // Total tonaj (reps * sets * weight)
        public decimal AverageReps { get; set; }
        public decimal AverageRIR { get; set; }
        public decimal MaxWeight { get; set; }
        public int WorkoutsCount { get; set; } // Câte ori s-a executat exercițiul
        public DateTime LastPerformed { get; set; }
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        public User User { get; set; } = null!;
        public Exercise Exercise { get; set; } = null!;
    }
}
