using Dapper;

public class UserRepository
{
    private readonly DbConnectionFactory _db;
    public UserRepository(DbConnectionFactory db) => _db = db;

    public async Task CreateUser(User user)
    {
        using var connection = _db.CreateConnection();
        var query = "INSERT INTO Users (name, username, email, password_hash, preferred_genres, bio, books_goal) VALUES (@Name, @Username, @Email, @Password_Hash, @Preferred_Genres, @Bio, @Books_Goal)";
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
    public async Task<User> GetUserByEmail(string email)
    {
        using var connection = _db.CreateConnection();
        var query = "SELECT * FROM Users WHERE email = @Email";
        return await connection.QuerySingleOrDefaultAsync<User>(query, new { Email = email });
    }

    public async Task UpdateUser(ChangeUserDataRequest user)
    {
        using var connection = _db.CreateConnection();
        var query = "UPDATE Users SET name = @Name, bio = @Bio, books_goal = @Books_Goal WHERE email = @Email";
        await connection.ExecuteAsync(query, user);
    }
    
    public async Task UpdatePassword(ChangePasswordRequest request)
    {
        using var connection = _db.CreateConnection();
        string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        var query = "UPDATE Users SET password_hash = @Password_Hash WHERE email = @Email";
        await connection.ExecuteAsync(query, new { Password_Hash = passwordHash, Email = request.Email });
    }

    public async Task DeleteUser(DeleteAccountRequest request)
    {
        using var connection = _db.CreateConnection();
        var query = "DELETE FROM Users WHERE email = @Email";
        await connection.ExecuteAsync(query, new { Email = request.Email });
    }

    public async Task<User> GetUserByUsername(string username)
    {
        using var connection = _db.CreateConnection();
        var query = "SELECT * FROM Users WHERE username = @Username";
        return await connection.QuerySingleOrDefaultAsync<User>(query, new { Username = username });
    }
}