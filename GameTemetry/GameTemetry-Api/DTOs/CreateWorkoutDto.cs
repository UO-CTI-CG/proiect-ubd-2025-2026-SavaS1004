using Microsoft.AspNetCore.SignalR;
using System.ComponentModel.DataAnnotations;

namespace GameTemetry.DTOs
{
    public class CreateWorkoutDto
    {
        [Required]
        public int UserId { get; set; }
        [Required]
        public DateTime WorkoutDate { get; set; }
        [Range(1 , 600)]
        public int DurationMinutes { get; set; }
        [StringLength(200)]
        public string? Notes { get; set; }
        public List<CreateWorkoutExerciseDto> Exercises { get; set; } = new();
    }
}
