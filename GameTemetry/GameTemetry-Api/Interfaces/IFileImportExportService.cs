using GameTemetry.DTOs.WorkoutImport;
using GameTemetry.Models;

namespace GameTemetry.Interfaces
{
    public interface IFileImportExportService
    {
        Task<byte[]> ExportWorkoutsToJsonAsync(List<Workout> workouts);
        Task<byte[]> ExportWorkoutToJsonAsync(Workout workout);
        Task<List<WorkoutImportDto>> ImportWorkoutsFromJsonAsync(byte[] jsonData);
    }
}
