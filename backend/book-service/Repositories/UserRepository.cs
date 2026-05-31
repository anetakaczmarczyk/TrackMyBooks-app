using Dapper;
using book_service.Models;
using book_service.Repositories;

namespace book_service.Repositories;

// Repozytorium odpowiedzialne za zarządzanie profilami użytkowników, uwierzytelnianiem oraz rozbudowaną siecią społecznościową (znajomości).
public class UserRepository : IUserRepository
{
    private readonly DbConnectionFactory _db;
    public UserRepository(DbConnectionFactory db) => _db = db;

    public async Task CreateUser(User user)
    {
        using var connection = _db.CreateConnection();
        var query = "INSERT INTO Users (name, username, email, password_hash, preferred_genres, bio, books_goal) VALUES (@Name, @Username, @Email, @Password_Hash, @Preferred_Genres, @Bio, @Books_Goal)";
        await connection.ExecuteAsync(query, user);
    }

    // Wykorzystanie COUNT(1) i ExecuteScalarAsync pozwala błyskawicznie sprawdzić unikalność danych (loginu/emaila)
    // przy minimalnym obciążeniu bazy danych
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

    // QuerySingleOrDefaultAsync zwraca dokładnie jeden rekord lub null
    // Rzuca wyjątek, jeśli baza zwróciłaby więcej niż jeden wynik (zapewnia unikalność logowania)
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
    
    // Haszowanie nowego hasła (BCrypt) następuje na poziomie repozytorium przed wysłaniem polecenia UPDATE
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
    
// Zamiast generować setki pojedynczych zapytań pobieramy 3 zbiorcze listy z bazy danych
// i łączymy je bezpośrednio w pamięci serwera
public async Task<IEnumerable<FriendWithBooksDto>> GetFriendsData(string username)
{
    using var connection = _db.CreateConnection();

    // Pobieramy relacje znajomości wraz ze stanem czytelnictwa znajomych
    var friendsQuery = @"
        SELECT 
            f.status AS FriendshipStatus,
            u.username AS FriendUsername,
            u.name AS FriendName,
            -- ── TUTAJ SPRAWDZAMY KTO JEST KIM ──
            CASE WHEN f.user1 = @Username THEN true ELSE false END AS IsInitiator,
            rs.id AS StatusId,
            rs.book_id AS BookId,
            rs.status AS ReadingStatus,
            rs.progress AS Progress,
            rs.start_date AS StartDate,
            rs.end_date AS EndDate
        FROM Friendships f
        JOIN Users u ON (f.user1 = u.username OR f.user2 = u.username)
        LEFT JOIN ReadingStatus rs ON u.username = rs.username
        WHERE (f.user1 = @Username OR f.user2 = @Username) 
          AND u.username != @Username";

    // Pobieramy historie aktywności wszystkich znajomych w jednym zapytaniu
    var activityQuery = @"
        SELECT 
            ua.username AS Username,
            ua.activity_type AS ActivityType,
            ua.book_title AS BookTitle,
            ua.timestamp AS Timestamp
        FROM Friendships f
        JOIN Users u ON (f.user1 = u.username OR f.user2 = u.username)
        JOIN UserActivity ua ON u.username = ua.username
        WHERE (f.user1 = @Username OR f.user2 = @Username) 
          AND u.username != @Username";

    // Pobieramy recenzje wszystkich znajomych w jednym zapytaniu
    var reviewQuery = @"
        SELECT 
            r.username AS Username,
            r.id AS Id,
            r.book_id AS BookId,
            r.rating AS Rating,
            r.review_text AS ReviewText,
            '' AS BookTitle,
            r.timestamp AS Timestamp
        FROM Friendships f
        JOIN Users u ON (f.user1 = u.username OR f.user2 = u.username)
        JOIN Reviews r ON u.username = r.username
        WHERE (f.user1 = @Username OR f.user2 = @Username) 
          AND u.username != @Username";

    // Asynchroniczne wywołanie wszystkich trzech zapytań SQL
    var friendRows = await connection.QueryAsync<RawFriendshipRow>(friendsQuery, new { Username = username });
    var activityRows = await connection.QueryAsync<RawActivityRow>(activityQuery, new { Username = username });
    var reviewRows = await connection.QueryAsync<RawReviewRow>(reviewQuery, new { Username = username });

    // Tworzenie słowników przyspieszających wyszukiwanie powiązanych danych w pamięci
    var activitiesLookup = activityRows
        .GroupBy(a => a.Username)
        .ToDictionary(g => g.Key, g => g.ToList());

    var reviewsLookup = reviewRows
        .GroupBy(r => r.Username)
        .ToDictionary(g => g.Key, g => g.ToList());

    // Składanie końcowego obiektu DTO
    var result = friendRows
        .GroupBy(r => new { r.FriendUsername, r.FriendName, r.FriendshipStatus, r.IsInitiator }) // Grupowanie po znajomym
        .Select(g => new FriendWithBooksDto
        {
            Username = g.Key.FriendUsername,
            Name = g.Key.FriendName,
            FriendshipStatus = g.Key.FriendshipStatus,
            IsInitiator = g.Key.IsInitiator, 
            
            // Mapowanie statusów książek, odfiltrowując puste wiersze powstałe przy LEFT JOIN
            ReadingStatuses = g
                .Where(r => r.StatusId != null) 
                .Select(r => new FriendReadingStatusDto
                {
                    Id = r.StatusId!.Value,         
                    Book_Id = r.BookId!.Value,       
                    Status = r.ReadingStatus ?? string.Empty,
                    Progress = r.Progress ?? 0,
                    Start_Date = r.StartDate,
                    End_Date = r.EndDate
                }).ToList(),

            // Pobieranie aktywności ze słownika pamięci podręcznej
            Activities = activitiesLookup.ContainsKey(g.Key.FriendUsername)
                ? activitiesLookup[g.Key.FriendUsername].Select(a => new FriendActivityDto
                  {
                      ActivityType = a.ActivityType,
                      BookTitle = a.BookTitle,
                      Timestamp = a.Timestamp
                  }).ToList()
                : new List<FriendActivityDto>(),

            // Pobieranie recenzji ze słownika pamięci podręcznej
            Reviews = reviewsLookup.ContainsKey(g.Key.FriendUsername)
                ? reviewsLookup[g.Key.FriendUsername].Select(r => new FriendReviewDto
                  {
                      Id = r.Id,
                      Book_Id = r.BookId,
                      Rating = r.Rating,
                      Review_Text = r.ReviewText,
                      Book_Title = r.BookTitle,
                      Timestamp = r.Timestamp
                  }).ToList()
                : new List<FriendReviewDto>()
        })
        .ToList();

    return result;
}

    public async Task RespondToInvitation(RespondToInvitationRequest request)
    {
        using var connection = _db.CreateConnection();
        string query;
        // Zaakceptowanie zaproszenia zmienia status, odrzucenie całkowicie kasuje wiersz z bazy danych
        if (request.Accept)
        {
            query = @"
                UPDATE Friendships 
                SET status = 'accepted' 
                WHERE (user1 = @UserUsername AND user2 = @FriendUsername) 
                   OR (user1 = @FriendUsername AND user2 = @UserUsername)";
        }
        else
        {
            query = @"
                DELETE FROM Friendships 
                WHERE (user1 = @UserUsername AND user2 = @FriendUsername) 
                   OR (user1 = @FriendUsername AND user2 = @UserUsername)";
        }
        await connection.ExecuteAsync(query, new { UserUsername = request.UserUsername, FriendUsername = request.FriendUsername });

        await GetFriendsData(request.UserUsername);
    }

    public async Task RemoveFriend(SendInvitationRequest request)
    {
        using var connection = _db.CreateConnection();
        // Usunięcie znajomego usuwa powiązanie w tabeli Friendships w obie strony
        var query = @"
            DELETE FROM Friendships 
            WHERE (user1 = @UserUsername AND user2 = @FriendUsername) 
               OR (user1 = @FriendUsername AND user2 = @UserUsername)";
        await connection.ExecuteAsync(query, new { UserUsername = request.UserUsername, FriendUsername = request.FriendUsername });

        await GetFriendsData(request.UserUsername);
    }

    public async Task SendInvitation(SendInvitationRequest request)
    {

        using var connection = _db.CreateConnection();
        // Nowe zaproszenie domyślnie otrzymuje status oczekujący ('pending') ustawiany na poziomie bazy danych
        var query = "INSERT INTO Friendships (user1, user2) VALUES (@UserUsername, @FriendUsername)";
        await connection.ExecuteAsync(query, new { UserUsername = request.UserUsername, FriendUsername = request.FriendUsername });
    }
}