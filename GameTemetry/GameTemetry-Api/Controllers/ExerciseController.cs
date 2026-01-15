using GameTemetry.Data;
using GameTemetry.DTOs;
using GameTemetry.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GameTemetry.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ExerciseController : ControllerBase
    {
        private readonly AppDbContext _context;
        public ExerciseController(AppDbContext context) => _context = context;

        // GET: api/exercise
        [HttpGet]
        public async Task<ActionResult<List<ExerciseResponseDto>>> GetExercises()
        {
            var exercises = await _context.Exercises.ToListAsync();
            return exercises.Select(e => new ExerciseResponseDto
            {
                Id = e.Id,
                Name = e.Name,
                Category = e.Category,
                Description = e.Description
            }).ToList();
        }

        // GET: api/Exercises/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ExerciseResponseDto>> GetExercise(int id)
        {
            var e = await _context.Exercises.FindAsync(id);
            if (e == null) return NotFound();
            return new ExerciseResponseDto
            {
                Id = e.Id,
                Name = e.Name,
                Category = e.Category,
                Description = e.Description
            };
        }

        // POST: api/Exercises
        [HttpPost]
        public async Task<ActionResult<ExerciseResponseDto>> CreateExercise(CreateExerciseDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var e = new Exercise
            {
                Name = dto.Name,
                Category = dto.Category,
                Description = dto.Description
            };
            _context.Exercises.Add(e);
            await _context.SaveChangesAsync();

            var responseDto = new ExerciseResponseDto
            {
                Id = e.Id,
                Name = e.Name,
                Category = e.Category,
                Description = e.Description
            };
            return CreatedAtAction(nameof(GetExercise), new { id = responseDto.Id }, responseDto);
        }

        // PUT: api/Exercises/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateExercise(int id, CreateExerciseDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var e = await _context.Exercises.FindAsync(id);
            if (e == null) return NotFound();
            e.Name = dto.Name;
            e.Category = dto.Category;
            e.Description = dto.Description;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/Exercises/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteExercise(int id)
        {
            var e = await _context.Exercises.FindAsync(id);
            if (e == null) return NotFound();
            _context.Exercises.Remove(e);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}

