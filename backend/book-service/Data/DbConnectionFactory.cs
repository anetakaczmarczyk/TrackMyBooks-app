using Npgsql;
using System.Data;

// Klasa implementująca wzorzec Fabryki Połączeń
public class DbConnectionFactory
{
    private readonly string _connectionString;

    // Pobieranie ciągu połączenia bezpośrednio z plików konfiguracyjnych
    public DbConnectionFactory(IConfiguration config) 
        => _connectionString = config.GetConnectionString("DefaultConnection");

    // Zwracanie generycznego interfejsu IDbConnection
    // Pozwala to na uniezależnienie repozytoriów od PostgreSQL i ułatwia integrację z Dapperem.
    public IDbConnection CreateConnection() => new NpgsqlConnection(_connectionString);
}