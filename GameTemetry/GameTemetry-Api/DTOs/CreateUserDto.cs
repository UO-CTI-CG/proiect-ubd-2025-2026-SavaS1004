using GameTemetry.Models;
using System.ComponentModel.DataAnnotations;

namespace GameTemetry.DTOs
{
    public class CreateUserDto
    {
        [Required]
        [StringLength(32,MinimumLength =3)]
        public string Username { get; set; } = null;
        [Required]
        [EmailAddress]
        public string Email { get; set; } = null;
        [Required]
        [StringLength(64,MinimumLength =6)]
        public string Password { get; set; } = null;
        public DateTime CreatedAt { get; set; }
       
    }
}
