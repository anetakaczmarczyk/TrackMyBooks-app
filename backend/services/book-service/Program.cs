using book_service.Services;

var builder = WebApplication.CreateBuilder(args);

string token = File.ReadAllText("authorizationKey.txt").Trim();

builder.Services.AddControllers();

builder.Services.AddHttpClient<HardcoverClient>(c => 
{
    c.BaseAddress = new Uri("https://api.hardcover.app/v1/graphql");
    c.DefaultRequestHeaders.Add("Authorization", token );
});

var app = builder.Build();
app.MapControllers();

app.Run("http://localhost:5000");