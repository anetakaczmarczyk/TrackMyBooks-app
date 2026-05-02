using Dapper;

public class UserRepository
{
    private readonly DbConnectionFactory _db;
    public UserRepository(DbConnectionFactory db) => _db = db;

    public async Task CreateUser(User user)
    {
        using var connection = _db.CreateConnection();
        var query = "INSERT INTO Users (name, username, email, password_hash, preferred_genres, bio, books_goal) VALUES (@Name, @Username, @Email, @Password_Hash, @Preferred_Genres, @Bio, @BooksGoal)";
        await connection.ExecuteAsync(query, user);
    }
    public async Task<bool> CheckIfEmailIsTaken(string email)
    {
        using var connection = _db.CreateConnection();
        var query = "SELECT COUNT(1) FROM Users WHERE email = @Email";
        int count = await connection.ExecuteScalarAsync<int>(query, new { Email = email });
        return count > 0;
    }
    public async Task<bool> CheckIfUsernameIsTaken(string username)
    {
        using var connection = _db.CreateConnection();
        var query = "SELECT COUNT(1) FROM Users WHERE username = @Username";
        int count = await connection.ExecuteScalarAsync<int>(query, new { Username = username });
        return count > 0;
    }
}