namespace GameTemetry.DTOs
{
    public class WorkoutResponseDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public DateTime WorkoutDate { get; set; }
        public int DurationMinutes { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<WorkoutExerciseResponseDto> Exercises { get; set; } = new();
    }
}
