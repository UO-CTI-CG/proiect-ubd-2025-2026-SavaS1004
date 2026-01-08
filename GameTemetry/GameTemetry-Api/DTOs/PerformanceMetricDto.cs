namespace GameTemetry.DTOs
{
    public class PerformanceMetricDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int ExerciseId { get; set; }
        public string ExerciseName { get; set; } = null!;
        public decimal TotalVolume { get; set; }
        public decimal AverageReps { get; set; }
        public decimal AverageRIR { get; set; }
        public decimal MaxWeight { get; set; }
        public int WorkoutsCount { get; set; }
        public DateTime LastPerformed { get; set; }
    }
}
