using GameTemetry.Data;
using GameTemetry.DTOs;
using GameTemetry.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GameTemetry.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PerformanceMetricsController : ControllerBase
    {
        private readonly AppDbContext _context;
        public PerformanceMetricsController(AppDbContext context) => _context = context;

        [HttpGet]
        public async Task<ActionResult<List<PerformanceMetricDto>>> GetAll()
        {
            var metrics = await _context.PerformanceMetrics
                .Include(m => m.Exercise)
                .ToListAsync();

            return metrics.Select(Mappers.MapPerfMetricToDto).ToList();
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<List<PerformanceMetricDto>>> GetByUser(int userId)
        {
            var metrics = await _context.PerformanceMetrics
                .Include(m => m.Exercise)
                .Where(m => m.UserId == userId)
                .ToListAsync();

            return metrics.Select(Mappers.MapPerfMetricToDto).ToList();
        }

        [HttpGet("user/{userId}/exercise/{exerciseId}")]
        public async Task<ActionResult<PerformanceMetricDto>> GetByUserAndExercise(int userId, int exerciseId)
        {
            var m = await _context.PerformanceMetrics
                .Include(x => x.Exercise)
                .FirstOrDefaultAsync(x => x.UserId == userId && x.ExerciseId == exerciseId);

            if (m == null) return NotFound();
            return Mappers.MapPerfMetricToDto(m);
        }

        // Pentru create/update, de obicei metricile sunt generate automat la final de workout,
        // dar poti face și endpoint direct dacă vrei...
        //[HttpPost("sync-metrics")]
        //public async Task<IActionResult> SyncMetrics()
        //{
        //    var userIds = await _context.Users.Select(u => u.Id).ToListAsync();

        //    foreach (var userId in userIds)
        //    {
        //        var distinctExercises = await _context.WorkoutExercises
        //            .Where(we => we.Workout.UserId == userId)
        //            .Select(we => we.ExerciseId)
        //            .Distinct()
        //            .ToListAsync();

        //        foreach (var exerciseId in distinctExercises)
        //        {
        //            await UpdatePerformanceMetrics(userId, exerciseId);
        //        }
        //    }

        //    return Ok("Metrics synchronized.");
        //}

        //private async Task UpdatePerformanceMetrics(int userId, int exerciseId)
        //{
        //    // 1. Fetch all history for this user & exercise
        //    var history = await _context.WorkoutExercises
        //        .Include(we => we.Workout)
        //        .Where(we => we.Workout.UserId == userId && we.ExerciseId == exerciseId)
        //        .ToListAsync();

        //    if (!history.Any()) return; // Should likely handle delete case too, but for now this is fine

        //    // 2. Calculate Aggregates
        //    var maxWeight = history.Max(h => h.Weight);
        //    var totalVolume = history.Sum(h => h.Weight * h.Reps * h.Sets); // Simple volume calc
        //    var avgReps = (decimal)history.Average(h => h.Reps);
        //    var avgRIR = (decimal)history.Average(h => h.RIR);
        //    var workoutCount = history.Select(h => h.WorkoutId).Distinct().Count();
        //    var lastPerformed = history.Max(h => h.Workout.WorkoutDate);

        //    // 3. Find existing metric record or create new
        //    var metric = await _context.PerformanceMetrics
        //        .FirstOrDefaultAsync(m => m.UserId == userId && m.ExerciseId == exerciseId);

        //    if (metric == null)
        //    {
        //        metric = new PerformanceMetric
        //        {
        //            UserId = userId,
        //            ExerciseId = exerciseId
        //        };
        //        _context.PerformanceMetrics.Add(metric);
        //    }

        //    // 4. Update fields
        //    metric.MaxWeight = (decimal)maxWeight;
        //    metric.TotalVolume = (decimal)totalVolume;
        //    metric.AverageReps = avgReps;
        //    metric.AverageRIR = avgRIR;
        //    metric.WorkoutsCount = workoutCount;
        //    metric.LastPerformed = lastPerformed;

        //    await _context.SaveChangesAsync();
        //}

    }
}
