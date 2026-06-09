using Dapper;
using book_service.Models;
using book_service.Repositories;
using System.Text.Json;

namespace book_service.Repositories;

// Repozytorium odpowiedzialne za zarządzanie profilami użytkowników, uwierzytelnianiem oraz rozbudowaną siecią społecznościową (znajomości).
public class UserRepository : IUserRepository
{
    private readonly DbConnectionFactory _db;
    public UserRepository(DbConnectionFactory db) => _db = db;

    public async Task CreateUser(User user)
    {
        using var connection = _db.CreateConnection();
        var query = @"
        INSERT INTO Users (name, username, email, password_hash, preferred_genres, bio, books_goal)
         VALUES (@Name, @Username, @Email, @Password_Hash, @Preferred_Genres, @Bio, @Books_Goal)";
        await connection.ExecuteAsync(query, user);
    }

    public async Task<bool> CheckIfEmailIsTaken(string email)
    {
        using var connection = _db.CreateConnection();
        var query = @"
        SELECT EXISTS (
            SELECT 1 
            FROM Users 
            WHERE email = @Email
        );";
        return await connection.ExecuteScalarAsync<int>(query, new { Email = email }) > 0;
    }

    public async Task<bool> CheckIfUsernameIsTaken(string username)
    {
        using var connection = _db.CreateConnection();
        var query = @"
        SELECT EXISTS (
            SELECT 1 
            FROM Users 
            WHERE username = @Username
        );";
        return await connection.ExecuteScalarAsync<int>(query, new { Username = username }) > 0;
    }

    // QuerySingleOrDefaultAsync zwraca dokładnie jeden rekord lub null
    // Rzuca wyjątek, jeśli baza zwróciłaby więcej niż jeden wynik (zapewnia unikalność logowania)
    public async Task<User> GetUserByEmail(string email)
    {
        using var connection = _db.CreateConnection();
        var query = @"
        SELECT name, username, email, password_hash, preferred_genres, bio, books_goal
        FROM Users WHERE email = @Email";
        return await connection.QuerySingleOrDefaultAsync<User>(query, new { Email = email });
    }

    public async Task UpdateUser(ChangeUserDataRequest user)
    {
        using var connection = _db.CreateConnection();
        var query = @"
        UPDATE Users 
        SET name = @Name, bio = @Bio, books_goal = @Books_Goal 
        WHERE email = @Email";
        await connection.ExecuteAsync(query, user);
    }
    
    // Haszowanie nowego hasła (BCrypt) następuje na poziomie repozytorium przed wysłaniem polecenia UPDATE
    public async Task UpdatePassword(ChangePasswordRequest request)
    {
        using var connection = _db.CreateConnection();
        string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        var query = @"
        UPDATE Users 
        SET password_hash = @Password_Hash 
        WHERE email = @Email";
        await connection.ExecuteAsync(query, new { Password_Hash = passwordHash, Email = request.Email });
    }

    public async Task DeleteUser(DeleteAccountRequest request)
    {
        using var connection = _db.CreateConnection();
        var query = @"
        DELETE FROM Users 
        WHERE email = @Email";
        await connection.ExecuteAsync(query, new { Email = request.Email });
    }

    public async Task<User> GetUserByUsername(string username)
    {
        using var connection = _db.CreateConnection();
        var query = @"
        SELECT name, username, email, password_hash, preferred_genres, bio, books_goal
        FROM Users WHERE username = @Username";
        return await connection.QuerySingleOrDefaultAsync<User>(query, new { Username = username });
    }
    
    public async Task<IEnumerable<FriendWithBooksDto>> GetFriendsData(string username)
    {
        using var connection = _db.CreateConnection();

        var sql = @"
        SELECT 
            f_data.friend_username AS Username,
            f_data.friend_name AS Name,
            f_data.status AS FriendshipStatus,
            f_data.is_initiator AS IsInitiator,
            COALESCE((SELECT jsonb_agg(jsonb_build_object(
                'Id', rs.id, 'BookId', rs.book_id, 'Status', rs.status, 
                'Progress', rs.progress, 'StartDate', rs.start_date, 'EndDate', rs.end_date
            )) FROM ReadingStatus rs WHERE rs.username = f_data.friend_username), '[]'::jsonb) AS ReadingStatuses,
            COALESCE((SELECT jsonb_agg(jsonb_build_object(
                'ActivityType', ua.activity_type, 'BookTitle', ua.book_title, 'Timestamp', ua.timestamp
            )) FROM UserActivity ua WHERE ua.username = f_data.friend_username), '[]'::jsonb) AS Activities,
            COALESCE((SELECT jsonb_agg(jsonb_build_object(
                'Id', r.id, 'BookId', r.book_id, 'Rating', r.rating, 
                'ReviewText', r.review_text, 'Timestamp', r.timestamp
            )) FROM Reviews r WHERE r.username = f_data.friend_username), '[]'::jsonb) AS Reviews
        FROM (
            SELECT 
                CASE WHEN f.user1 = @Username THEN f.user2 ELSE f.user1 END AS friend_username,
                u.name AS friend_name,
                f.status,
                (f.user1 = @Username) AS is_initiator
            FROM Friendships f
            JOIN Users u ON u.username = (CASE WHEN f.user1 = @Username THEN f.user2 ELSE f.user1 END)
            WHERE (f.user1 = @Username OR f.user2 = @Username)
        ) f_data;"; 
        
        return await connection.QueryAsync<FriendWithBooksDto>(sql, new { Username = username });
    }

    public async Task<bool> RespondToInvitation(RespondToInvitationRequest request)
    {
        using var connection = _db.CreateConnection();
        

        var sql = @"
            WITH updated AS (
                UPDATE Friendships 
                SET status = 'accepted' 
                WHERE @Accept = true 
                AND ((user1 = @UserUsername AND user2 = @FriendUsername) OR (user1 = @FriendUsername AND user2 = @UserUsername))
                RETURNING 1
            ),
            deleted AS (
                DELETE FROM Friendships 
                WHERE @Accept = false 
                AND ((user1 = @UserUsername AND user2 = @FriendUsername) OR (user1 = @FriendUsername AND user2 = @UserUsername))
                RETURNING 1
            )
            SELECT EXISTS (SELECT 1 FROM updated UNION ALL SELECT 1 FROM deleted);";

        return await connection.ExecuteScalarAsync<bool>(sql, request);
    }

    public async Task<bool> RemoveFriend(SendInvitationRequest request)
    {
        using var connection = _db.CreateConnection();
        
        var sql = @"
            DELETE FROM Friendships 
            WHERE (user1 = @UserUsername AND user2 = @FriendUsername) 
            OR (user1 = @FriendUsername AND user2 = @UserUsername)
            RETURNING 1";

        var result = await connection.QueryFirstOrDefaultAsync<int?>(sql, request);
        
        return result.HasValue;
    }

    public async Task SendInvitation(SendInvitationRequest request)
    {

        using var connection = _db.CreateConnection();
        // Nowe zaproszenie domyślnie otrzymuje status oczekujący ('pending') ustawiany na poziomie bazy danych
        var query = @"
        INSERT INTO Friendships (user1, user2)
        VALUES (@UserUsername, @FriendUsername)";
        await connection.ExecuteAsync(query, new { UserUsername = request.UserUsername, FriendUsername = request.FriendUsername });
    }
public async Task<DashboardDataDTO> GetDashboardData(string username)
{
    using var connection = _db.CreateConnection();
    
    var sql = @"
        WITH MyReviews AS (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'Id', id, 
                    'Book_Id', book_id, 
                    'Username', username, 
                    'Rating', rating, 
                    'Review_Text', review_text
                )
            ) as data FROM Reviews r WHERE r.username = @Username
        ),
        MyReading AS (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'Id', id, 
                    'Book_Id', book_id, 
                    'Status', status, 
                    'Progress', progress
                )
            ) as data FROM ReadingStatus rs WHERE rs.username = @Username
        ),
        FriendsActivity AS (
            SELECT jsonb_agg(act) as data
            FROM (
                SELECT 
                    username as ""Username"", 
                    activity_type as ""ActivityType"", 
                    book_title as ""BookTitle"", 
                    timestamp as ""Timestamp"",
                    ROW_NUMBER() OVER(PARTITION BY username ORDER BY timestamp DESC) as rn
                FROM UserActivity
                WHERE username IN (
                    SELECT CASE WHEN user1 = @Username THEN user2 ELSE user1 END 
                    FROM Friendships WHERE (user1 = @Username OR user2 = @Username) AND status = 'accepted'
                )
            ) act
            WHERE act.rn <= 3
        )
        SELECT 
            COALESCE((SELECT data FROM MyReviews), '[]'::jsonb) as ""UserReviews"",
            COALESCE((SELECT data FROM MyReading), '[]'::jsonb) as ""UserReading"",
            COALESCE((SELECT data FROM FriendsActivity), '[]'::jsonb) as ""FriendsData""";


    var result = await connection.QueryFirstOrDefaultAsync<dynamic>(sql, new { Username = username });

    if (result == null) return new DashboardDataDTO();

    return new DashboardDataDTO
    {
        UserReviews = JsonSerializer.Deserialize<List<Review>>(result.UserReviews.ToString() ?? "[]"),
        UserReading = JsonSerializer.Deserialize<List<ReadingStatus>>(result.UserReading.ToString() ?? "[]"),
        FriendsData = JsonSerializer.Deserialize<List<RawActivityRow>>(result.FriendsData.ToString() ?? "[]")
    };
}
}