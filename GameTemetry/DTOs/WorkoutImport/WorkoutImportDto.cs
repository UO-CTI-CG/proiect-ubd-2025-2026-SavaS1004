namespace GameTemetry.DTOs.WorkoutImport
{
    public class WorkoutImportDto
    {
        public int UserId { get; set; }
        public DateTime WorkoutDate { get; set; }
        public int DurationMinutes { get; set; }
        public string? Notes { get; set; }
        public List<WorkoutExerciseResponseDto> Exercises { get; set; } = new();
    }
}
