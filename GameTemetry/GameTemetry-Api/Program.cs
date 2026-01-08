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

            // 1. Database Connection (Matches your appsettings.json)
            builder.Services.AddDbContext<AppDbContext>(options =>
                options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

            // 2. Routing - Keep LowercaseUrls true (Matches your Angular service)
            builder.Services.AddRouting(options => options.LowercaseUrls = true);

            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();
            builder.Services.AddScoped<IFileImportExportService, FileImportExportService>();

            // 3. FIX: CORS Policy (Allow Everything for Debugging)
            // This prevents "Network Error" / "blocked by CORS policy" in the browser
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowAll", policy =>
                {
                    policy
                        .AllowAnyOrigin()  // Allows Ionic (8100), Postman, etc.
                        .AllowAnyMethod()
                        .AllowAnyHeader();
                });
            });

            var app = builder.Build();

            // 4. FIX: Enable Swagger so you don't get a 404 when the API starts
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            // 5. Apply the CORS policy
            app.UseCors("AllowAll");

            app.UseAuthorization();
            app.MapControllers();

            app.Run();
        }
    }
}