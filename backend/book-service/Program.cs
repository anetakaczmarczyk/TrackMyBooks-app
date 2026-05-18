using System.Text;
using book_service.Services;
using DbUp;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
var builder = WebApplication.CreateBuilder(args);
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
var key = Encoding.ASCII.GetBytes("p4#K9v&L2m@B8xZ!qR7nN#yP5cW1jF6sD3eH0aV4uY0gT"); // Example key, replace with your actual key, safe to store in a secure location

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
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
});

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false,
        ValidateAudience = false,
    };
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Cookies["authToken"];
            if (!string.IsNullOrEmpty(accessToken))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        },

        OnChallenge = async context =>
        {
            context.HandleResponse();
            context.Response.StatusCode = 401;
            context.Response.ContentType = "application/json";

            if (context.Request.Headers.ContainsKey("Origin"))
            {
                context.Response.Headers.Append("Access-Control-Allow-Origin", "http://localhost:3000");
                context.Response.Headers.Append("Access-Control-Allow-Credentials", "true");
            }
            await context.Response.WriteAsync("{\"error\": \"Unauthorized\"}");
        }
    };

});

var upgrader = DeployChanges.To
    .PostgresqlDatabase(connectionString)
    .WithScriptsEmbeddedInAssembly(System.Reflection.Assembly.GetExecutingAssembly())
    .LogToConsole()
    .Build();

if (upgrader.IsUpgradeRequired())
{
    upgrader.PerformUpgrade();
    Console.WriteLine("Database upgrade performed.");
}

builder.Services.AddScoped<UserRepository>();
builder.Services.AddSingleton<DbConnectionFactory>();

var app = builder.Build();
app.MapControllers();
app.UseCors("AllowLocalhost");
app.UseCors("AllowSpecificOrigin");


app.Run("http://*:5000");