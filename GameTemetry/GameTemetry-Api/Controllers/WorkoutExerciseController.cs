using GameTemetry.Data;
using GameTemetry.DTOs;
using GameTemetry.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GameTemetry.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WorkoutExerciseController : ControllerBase
    {
        private readonly AppDbContext _context;
        public WorkoutExerciseController(AppDbContext context) => _context = context;

        [HttpGet]
        public async Task<ActionResult<List<WorkoutExerciseResponseDto>>> GetAll()
        {
            var all = await _context.WorkoutExercises
                .Include(we => we.Exercise)
                .ToListAsync();
            return all.Select(Mappers.MapWorkoutExerciseToDto).ToList();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<WorkoutExerciseResponseDto>> GetById(int id)
        {
            var we = await _context.WorkoutExercises.Include(x => x.Exercise)
                .FirstOrDefaultAsync(x => x.Id == id);
            if (we == null) return NotFound();
            return Mappers.MapWorkoutExerciseToDto(we);
        }

        [HttpPost]
        public async Task<ActionResult<WorkoutExerciseResponseDto>> Create(CreateWorkoutExerciseDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var e = await _context.Exercises.FindAsync(dto.ExerciseId);
            if (e == null) return BadRequest("Invalid ExerciseId!");

            var we = new WorkoutExercise
            {
                WorkoutId = dto.WorkoutId,
                ExerciseId = dto.ExerciseId,
                Reps = dto.Reps,
                Sets = dto.Sets,
                Weight = dto.Weight,
                RIR = dto.RIR,
                RPE = dto.RPE,
                DurationSeconds = dto.DurationSeconds,
                Notes = dto.Notes,
                OrderInWorkout = dto.OrderInWorkout
            };

            _context.WorkoutExercises.Add(we);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = we.Id }, Mappers.MapWorkoutExerciseToDto(we));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var we = await _context.WorkoutExercises.FindAsync(id);
            if (we == null) return NotFound();
            _context.WorkoutExercises.Remove(we);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}

