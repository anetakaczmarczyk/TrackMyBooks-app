using Npgsql;
using System.Data;

public class DbConnectionFactory
{
    private readonly string _connectionString;
    public DbConnectionFactory(IConfiguration config) 
        => _connectionString = config.GetConnectionString("DefaultConnection");

    public IDbConnection CreateConnection() => new NpgsqlConnection(_connectionString);
}