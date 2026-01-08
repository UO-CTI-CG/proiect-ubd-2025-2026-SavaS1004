using GameTemetry.Models;
using Microsoft.EntityFrameworkCore;

namespace GameTemetry.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }
        // DbSets
        public DbSet<User> Users { get; set; }
        public DbSet<Workout> Workouts { get; set; }
        public DbSet<Exercise> Exercises { get; set; }
        public DbSet<WorkoutExercise> WorkoutExercises { get; set; }
        public DbSet<PerformanceMetric> PerformanceMetrics { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ============ User → Workouts (1:Many) ============
            modelBuilder.Entity<Workout>()
                .HasOne(w => w.User)
                .WithMany(u => u.Workouts)
                .HasForeignKey(w => w.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // ============ Workouts → WorkoutExercises (1:Many) ============
            modelBuilder.Entity<WorkoutExercise>()
                .HasOne(we => we.Workout)
                .WithMany(w => w.WorkoutExercises)
                .HasForeignKey(we => we.WorkoutId)
                .OnDelete(DeleteBehavior.Cascade);

            // ============ Exercises → WorkoutExercises (1:Many) ============
            modelBuilder.Entity<WorkoutExercise>()
                .HasOne(we => we.Exercise)
                .WithMany(e => e.WorkoutExercises)
                .HasForeignKey(we => we.ExerciseId)
                .OnDelete(DeleteBehavior.Restrict);

            // ============ User → PerformanceMetrics (1:Many) ============
            modelBuilder.Entity<PerformanceMetric>()
                .HasOne(pm => pm.User)
                .WithMany(u => u.PerformanceMetrics)
                .HasForeignKey(pm => pm.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // ============ Exercises → PerformanceMetrics (1:Many) ============
            modelBuilder.Entity<PerformanceMetric>()
                .HasOne(pm => pm.Exercise)
                .WithMany(e => e.PerformanceMetrics)
                .HasForeignKey(pm => pm.ExerciseId)
                .OnDelete(DeleteBehavior.Restrict);

            // ============ Indexes ============
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<Workout>()
                .HasIndex(w => w.UserId);

            modelBuilder.Entity<WorkoutExercise>()
                .HasIndex(we => new { we.WorkoutId, we.ExerciseId });

            modelBuilder.Entity<PerformanceMetric>()
                .HasIndex(pm => new { pm.UserId, pm.ExerciseId })
                .IsUnique();
        }
    }
}
