using System.ComponentModel.DataAnnotations;

namespace GameTemetry.DTOs
{
    public class CreateWorkoutExerciseDto
    {   
        [Required]
        public int WorkoutId { get; set; }
        [Required]
        public int ExerciseId { get; set; }
        [Required]
        public int Reps { get; set; }
        [Required]
        [Range(1,10)]
        public int Sets { get; set; }
        [Required]
        [Range(0,10000)]
        public decimal? Weight { get; set; }
        [Required]
        [Range(0,15)]
        public int RIR { get; set; }
        [Required]
        [Range(0,10)]
        public int RPE { get; set; }
        public int DurationSeconds { get; set; }
        [StringLength(200)]
        public string? Notes { get; set; }
        public int OrderInWorkout { get; set; }
    }
}
