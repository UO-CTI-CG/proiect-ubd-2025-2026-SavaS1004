namespace GameTemetry.DTOs
{
    public class CreateWorkoutDto
    {
        public DateTime WorkoutDate { get; set; }
        public int DurationMinutes { get; set; }
        public string? Notes { get; set; }
        public List<CreateWorkoutExerciseDto> Exercises { get; set; } = new();
    }
}
