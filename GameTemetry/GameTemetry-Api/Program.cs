using GameTemetry.Data;
using GameTemetry.Interfaces;
using GameTemetry.Services;
using Microsoft.EntityFrameworkCore;

namespace GameTemetry
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // 1. Database
            builder.Services.AddDbContext<AppDbContext>(options =>
                options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

            // 2. Routing
            builder.Services.AddRouting(options => options.LowercaseUrls = true);
            builder.Services.AddControllers();

            // 3. Swagger (Enable it!)
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();
            builder.Services.AddScoped<IFileImportExportService, FileImportExportService>();

            // 4. CORS (Fix: Allow Everything for Dev)
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowLocalhost", policy =>
                {
                    policy
                        .AllowAnyOrigin()  
                        .AllowAnyMethod()
                        .AllowAnyHeader();
                });
            });

            var app = builder.Build();

            // 5. Apply CORS
            app.UseCors("AllowLocalhost");

            // 6. Enable Swagger UI
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            // app.UseHttpsRedirection();
            app.UseAuthorization();
            app.MapControllers();

            app.Run();
        }
    }
}