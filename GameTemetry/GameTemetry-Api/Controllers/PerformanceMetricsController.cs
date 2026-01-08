using GameTemetry.Data;
using GameTemetry.DTOs;
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
    }
}
