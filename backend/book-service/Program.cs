using book_service.Services;

var builder = WebApplication.CreateBuilder(args);

string token = File.ReadAllText("authorizationKey.txt").Trim();

builder.Services.AddControllers();

builder.Services.AddHttpClient<HardcoverClient>(c => 
{
    c.BaseAddress = new Uri("https://api.hardcover.app/v1/graphql");
    c.DefaultRequestHeaders.Add("Authorization", token );
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin",
        policy =>
        {
            policy.WithOrigins("http://localhost:3000") // Adres Twojego frontendu
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

var app = builder.Build();
app.MapControllers();
app.UseCors("AllowLocalhost");
app.UseCors("AllowSpecificOrigin");


app.Run("http://localhost:5000");