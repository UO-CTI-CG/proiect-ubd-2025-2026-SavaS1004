using CsvHelper;
using GameTemetry.Data;
using GameTemetry.DTOs;
using GameTemetry.Interfaces;
using GameTemetry.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Globalization;

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
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
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
        //CSV import/Export
        [HttpGet("export")]
        public async Task<IActionResult> ExportWorkouts()
        {
            var workouts = await _context.Workouts
                .Include(w => w.WorkoutExercises)
                .ThenInclude(we => we.Exercise)
                .ToListAsync();

            using var memoryStream = new MemoryStream();
            using var streamWriter = new StreamWriter(memoryStream);
            using var csvWriter = new CsvWriter(streamWriter, CultureInfo.InvariantCulture);

            // Write header and records using a flattened DTO for CSV
            var exportDtos = workouts.Select(w => new
            {
                w.Id,
                w.UserId,
                w.WorkoutDate,
                w.DurationMinutes,
                w.Notes
                // Add more fields as needed
            });

            await csvWriter.WriteRecordsAsync(exportDtos);

            await streamWriter.FlushAsync();
            memoryStream.Position = 0;

            return File(memoryStream, "text/csv", "workouts.csv");
        }

        [HttpPost("import")]
        public async Task<IActionResult> ImportWorkouts(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("CSV file is required.");

            using var stream = file.OpenReadStream();
            using var streamReader = new StreamReader(stream);
            using var csvReader = new CsvReader(streamReader, CultureInfo.InvariantCulture);

            var records = csvReader.GetRecords<CreateWorkoutDto>().ToList();

            // Validate UserIds exist:
            var userIds = records.Select(r => r.UserId).Distinct();
            var existingUserIds = await _context.Users
                .Where(u => userIds.Contains(u.Id))
                .Select(u => u.Id)
                .ToListAsync();

            foreach (var record in records)
            {
                if (!existingUserIds.Contains(record.UserId))
                    return BadRequest($"UserId {record.UserId} does not exist.");
            }

            foreach (var dto in records)
            {
                var workout = new Workout
                {
                    UserId = dto.UserId,
                    WorkoutDate = dto.WorkoutDate,
                    DurationMinutes = dto.DurationMinutes,
                    Notes = dto.Notes
                    // Add more mappings as needed
                };
                _context.Workouts.Add(workout);
            }

            await _context.SaveChangesAsync();
            return Ok($"{records.Count} workouts imported successfully.");
        }
        //Import/Export
        [HttpGet("export-json-workouts")]
        public async Task<IActionResult> ExportWorkoutsJson()
        {
            var workouts = await _context.Workouts
                .Include(w => w.WorkoutExercises)
                .ThenInclude(we => we.Exercise)
                .ToListAsync();

            var fileService = HttpContext.RequestServices.GetRequiredService<IFileImportExportService>();
            var jsonBytes = await fileService.ExportWorkoutsToJsonAsync(workouts);

            return File(jsonBytes, "application/json", $"workouts-{DateTime.UtcNow:yyyyMMdd}.json");
        }
        [HttpGet("export-json-workout/{id}")]
        public async Task<IActionResult> ExportWorkoutJson(int id)
        {
            var workout = await _context.Workouts
        .Include(w => w.WorkoutExercises)
        .ThenInclude(we => we.Exercise)
        .FirstOrDefaultAsync(w => w.Id == id);

            if (workout == null)
                return NotFound("Workout not found.");

            var fileService = HttpContext.RequestServices.GetRequiredService<IFileImportExportService>();

            // Pass single workout (service handles List<Workout>)
            var jsonBytes = await fileService.ExportWorkoutsToJsonAsync(new List<Workout> { workout });

            return File(jsonBytes, "application/json", $"workout-{id}-{DateTime.UtcNow:yyyyMMdd}.json");
        }

        [HttpPost("import-json")]
        public async Task<IActionResult> ImportWorkoutsJson(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("JSON file is required.");

            using var stream = file.OpenReadStream();
            using var ms = new MemoryStream();
            await stream.CopyToAsync(ms);
            var jsonBytes = ms.ToArray();

            var fileService = HttpContext.RequestServices.GetRequiredService<IFileImportExportService>();
            var importDtos = await fileService.ImportWorkoutsFromJsonAsync(jsonBytes);

            foreach (var dto in importDtos)
            {
                var workout = new Workout
                {
                    UserId = dto.UserId,
                    WorkoutDate = dto.WorkoutDate,
                    DurationMinutes = dto.DurationMinutes,
                    Notes = dto.Notes
                };
                _context.Workouts.Add(workout);
                await _context.SaveChangesAsync(); // Save to get WorkoutId

                foreach (var exDto in dto.Exercises)
                {
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
                        Notes = exDto.Notes
                    };
                    _context.WorkoutExercises.Add(workoutExercise);
                }
            }
            await _context.SaveChangesAsync();

            return Ok($"{importDtos.Count} workouts imported successfully.");
        }
    }
}
