using GameTemetry.Data;
using GameTemetry.DTOs;
using GameTemetry.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GameTemetry.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WorkoutController : ControllerBase
    {
        private readonly AppDbContext _context;
        public WorkoutController(AppDbContext context) => _context = context;

        // GET: api/Workouts
        [HttpGet]
        public async Task<ActionResult<List<WorkoutResponseDto>>> GetWorkouts()
        {
            var workouts = await _context.Workouts
                .Include(w => w.WorkoutExercises)
                .ThenInclude(we => we.Exercise)
                .ToListAsync();

            return workouts.Select(Mappers.MapWorkoutToDto).ToList();
        }

        // GET: api/Workouts/5
        [HttpGet("{id}")]
        public async Task<ActionResult<WorkoutResponseDto>> GetWorkout(int id)
        {
            var workout = await _context.Workouts
                .Include(w => w.WorkoutExercises)
                .ThenInclude(we => we.Exercise)
                .FirstOrDefaultAsync(w => w.Id == id);
            if (workout == null) return NotFound();
            return Mappers.MapWorkoutToDto(workout);
        }

        // POST: api/Workouts
        [HttpPost]
        public async Task<ActionResult<WorkoutResponseDto>> CreateWorkout(CreateWorkoutDto dto)
        {
            if (!await _context.Users.AnyAsync(u => u.Id == dto.UserId))
                return BadRequest("Invalid UserId.");

            var workout = new Workout
            {
                UserId = dto.UserId, 
                WorkoutDate = dto.WorkoutDate,
                DurationMinutes = dto.DurationMinutes,
                Notes = dto.Notes
            };

            _context.Workouts.Add(workout);
            await _context.SaveChangesAsync();

            if (dto.Exercises != null)
            {
                foreach (var exDto in dto.Exercises)
                {
                    var exercise = await _context.Exercises.FindAsync(exDto.ExerciseId);
                    if (exercise == null) return BadRequest($"ExerciseId {exDto.ExerciseId} invalid.");

                    var workoutExercise = new WorkoutExercise
                    {
                        WorkoutId = workout.Id,
                        ExerciseId = exDto.ExerciseId,
                        Reps = exDto.Reps,
                        Sets = exDto.Sets,
                        Weight = exDto.Weight,
                        RIR = exDto.RIR,
                        RPE = exDto.RPE,
                        DurationSeconds = exDto.DurationSeconds,
                        Notes = exDto.Notes,
                        OrderInWorkout = exDto.OrderInWorkout
                    };
                    _context.WorkoutExercises.Add(workoutExercise);
                }
                await _context.SaveChangesAsync();
            }

            // Reload cu includere de relatii
            var included = await _context.Workouts
                .Include(w => w.WorkoutExercises)
                .ThenInclude(we => we.Exercise)
                .FirstOrDefaultAsync(w => w.Id == workout.Id);
            return CreatedAtAction(nameof(GetWorkout), new { id = workout.Id }, Mappers.MapWorkoutToDto(included));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteWorkout(int id)
        {
            var workout = await _context.Workouts.FindAsync(id);
            if (workout == null) return NotFound();
            _context.Workouts.Remove(workout);
            await _context.SaveChangesAsync();
            return NoContent();
        }        
    }
}
