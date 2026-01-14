using GameTemetry.Data;
using GameTemetry.DTOs.WorkoutImport;
using GameTemetry.DTOs;
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
            // Wrap single object in a list for consistent importing later
            var list = new List<WorkoutExportDto> { exportDto };
            var json = JsonSerializer.Serialize(list, new JsonSerializerOptions
            {
                WriteIndented = true,
            });
            return Task.FromResult(Encoding.UTF8.GetBytes(json));
        }

        public async Task<List<WorkoutImportDto>> ImportWorkoutsFromJsonAsync(byte[] jsonData)
        {
            var json = Encoding.UTF8.GetString(jsonData);

            // FIX 1: Add PropertyNameCaseInsensitive to handle "exerciseId" vs "ExerciseId"
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var importedDtos = JsonSerializer.Deserialize<List<WorkoutImportDto>>(json, options) ?? new();

            var existingExercises = await _context.Exercises.ToListAsync();

            foreach (var workoutDto in importedDtos)
            {
                // FIX 2: Create a new list to store corrected exercises and remove duplicates
                var distinctExercises = new List<WorkoutExerciseResponseDto>();
                var processedIds = new HashSet<int>();

                foreach (var exDto in workoutDto.Exercises)
                {
                    // Logic to find match by ID or Name
                    var match = existingExercises.FirstOrDefault(e => e.Id == exDto.ExerciseId);

                    if (match == null && !string.IsNullOrEmpty(exDto.ExerciseName))
                    {
                        match = existingExercises.FirstOrDefault(e =>
                            e.Name.Equals(exDto.ExerciseName, StringComparison.OrdinalIgnoreCase));
                    }

                    if (match != null)
                    {
                        exDto.ExerciseId = match.Id;
                    }
                    else
                    {
                        // Create new if not found
                        var newExercise = new Exercise
                        {
                            Name = !string.IsNullOrEmpty(exDto.ExerciseName)
                                ? exDto.ExerciseName
                                : $"Imported Exercise {exDto.ExerciseId}",
                            Description = "Automatically created during import",
                            Category = "Imported"
                        };

                        _context.Exercises.Add(newExercise);
                        await _context.SaveChangesAsync();
                        existingExercises.Add(newExercise);
                        exDto.ExerciseId = newExercise.Id;
                    }

                    // FIX 3: Prevent duplicates (e.g., if two imported items map to the same local ExerciseId)
                    if (!processedIds.Contains(exDto.ExerciseId))
                    {
                        distinctExercises.Add(exDto);
                        processedIds.Add(exDto.ExerciseId);
                    }
                }

                // Replace the original list with the clean, valid list
                workoutDto.Exercises = distinctExercises;
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
                    ExerciseName = we.Exercise?.Name ?? "Unknown Exercise",
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