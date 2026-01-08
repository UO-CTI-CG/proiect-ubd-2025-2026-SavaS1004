using GameTemetry.Data;
using GameTemetry.DTOs;
using GameTemetry.DTOs.WorkoutImport;
using GameTemetry.Interfaces;
using GameTemetry.Models;
using Microsoft.EntityFrameworkCore;
using System.Text;
using System.Text.Json;

namespace GameTemetry.Services
{
    public class FileImportExportService : IFileImportExportService
    {
        private readonly AppDbContext _context;
        public FileImportExportService(AppDbContext context) => _context = context;
        public Task<byte[]> ExportWorkoutsToJsonAsync(List<Workout> workouts)
        {
            var exportDtos = workouts.Select(MapWorkoutToExportDto).ToList();
            var json = JsonSerializer.Serialize(exportDtos, new JsonSerializerOptions
            {
                WriteIndented = true,
            });
            return Task.FromResult(Encoding.UTF8.GetBytes(json));
        }

        public Task<byte[]> ExportWorkoutToJsonAsync(Workout workout)
        {
            var exportDto = MapWorkoutToExportDto(workout);
            var json = JsonSerializer.Serialize(exportDto, new JsonSerializerOptions
            {
                WriteIndented = true,
            });
            return Task.FromResult(Encoding.UTF8.GetBytes(json));
        }

        public async Task<List<WorkoutImportDto>> ImportWorkoutsFromJsonAsync(byte[] jsonData)
        {
            var json = Encoding.UTF8.GetString(jsonData);
            var importedDtos= JsonSerializer.Deserialize<List<WorkoutImportDto>>(json) ?? new();
            // Validate referenced Exercises exist
            var exerciseIds = importedDtos
                .SelectMany(w => w.Exercises)
                .Select(e => e.ExerciseId)
                .Distinct()
                .ToList();

            var existingExercises = await _context.Exercises
                .Where(e => exerciseIds.Contains(e.Id))
                .Select(e => e.Id)
                .ToListAsync();

            foreach (var workout in importedDtos)
            {
                foreach (var exercise in workout.Exercises)
                {
                    if (!existingExercises.Contains(exercise.ExerciseId))
                        throw new InvalidOperationException($"ExerciseId {exercise.ExerciseId} does not exist.");
                }
            }

            return importedDtos;
        }

        

        private WorkoutExportDto MapWorkoutToExportDto(Workout workout)
        {
            return new WorkoutExportDto
            {
                Id = workout.Id,
                UserId = workout.UserId,
                WorkoutDate = workout.WorkoutDate,
                DurationMinutes = workout.DurationMinutes,
                Notes = workout.Notes,
                CreatedAt = workout.CreatedAt,
                Exercises = workout.WorkoutExercises.Select(we => new WorkoutExerciseResponseDto
                {
                    Id = we.Id,
                    ExerciseId = we.ExerciseId,
                    ExerciseName = we.Exercise?.Name ?? "",
                    Reps = we.Reps,
                    Sets = we.Sets,
                    Weight = we.Weight,
                    RIR = we.RIR,
                    RPE = we.RPE,
                    DurationSeconds = we.DurationSeconds,
                    Notes = we.Notes
                }).ToList()
            };
        }
    }
}
