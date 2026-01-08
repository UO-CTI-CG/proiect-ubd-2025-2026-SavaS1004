using System.ComponentModel.DataAnnotations;

namespace GameTemetry.DTOs
{
    public class CreateExerciseDto
    {
        [Required]
        [StringLength(50,MinimumLength =2)]
        public string Name { get; set; } = null!;
        [Required]
        [StringLength(50)]
        public string Category { get; set; } = null!;
        [StringLength(200)]
        public string Description { get; set; } = null!;
    }
}
