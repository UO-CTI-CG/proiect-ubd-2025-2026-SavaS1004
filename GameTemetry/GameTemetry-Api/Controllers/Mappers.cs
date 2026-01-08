using GameTemetry.DTOs;
using GameTemetry.Models;

namespace GameTemetry.Controllers
{
    public static class Mappers
    {
        public static UserResponseDto MapUserToDto(User u)
        {
            return new UserResponseDto
            {
                Id = u.Id,
                Username = u.Username,
                Email = u.Email,
                CreatedAt = u.CreatedAt
            };
        }
        public static ExerciseResponseDto MapExerciseToDto(Exercise e)
        {
            return new ExerciseResponseDto
            {
                Id = e.Id,
                Name = e.Name,
                Category = e.Category,
                Description = e.Description
            };
        }
        public static WorkoutExerciseResponseDto MapWorkoutExerciseToDto(WorkoutExercise we)
        {
            return new WorkoutExerciseResponseDto
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
            };
        }
        public static WorkoutResponseDto MapWorkoutToDto(Workout w)
        {
            return new WorkoutResponseDto
            {
                Id = w.Id,
                UserId = w.UserId,
                WorkoutDate = w.WorkoutDate,
                DurationMinutes = w.DurationMinutes,
                Notes = w.Notes,
                CreatedAt = w.CreatedAt,
                Exercises = w.WorkoutExercises?.Select(MapWorkoutExerciseToDto).ToList() ?? new List<WorkoutExerciseResponseDto>()
            };
        }
        public static PerformanceMetricDto MapPerfMetricToDto(PerformanceMetric m)
        {
            return new PerformanceMetricDto
            {
                Id = m.Id,
                UserId = m.UserId,
                ExerciseId = m.ExerciseId,
                ExerciseName = m.Exercise?.Name ?? "",
                TotalVolume = m.TotalVolume,
                AverageReps = m.AverageReps,
                AverageRIR = m.AverageRIR,
                MaxWeight = m.MaxWeight,
                WorkoutsCount = m.WorkoutsCount,
                LastPerformed = m.LastPerformed
            };
        }
    }
}
