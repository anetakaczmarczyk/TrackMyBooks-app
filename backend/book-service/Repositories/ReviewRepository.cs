using Dapper;
using book_service.Repositories;

namespace book_service.Repositories;

// Repozytorium odpowiedzialne za operacje bazodanowe związane z recenzjami i ocenami książek
public class ReviewRepository : IReviewRepository
{
    private readonly DbConnectionFactory _db;
    public ReviewRepository(DbConnectionFactory db) => _db = db;

    // Pobiera wszystkie opinie o danej książce, sortując je chronologicznie od najnowszych
    public async Task<IEnumerable<Review>> GetReviewsForBook(int bookId)
    {
        using var connection = _db.CreateConnection();
        var query = @"
            SELECT Id, Book_Id, Username, Rating, Review_Text, Timestamp
            FROM Reviews
            WHERE Book_Id = @Book_Id
            ORDER BY Timestamp DESC";
        return await connection.QueryAsync<Review>(query, new { Book_Id = bookId });
    }


    public async Task AddReviewWithActivity(Review review)
    {
        using var connection = _db.CreateConnection();
        // Funkcja TRIM() w SQL oczyszcza tekst recenzji ze zbędnych spacji i znaków nowej linii na początku oraz końcu tekstu
        var query = @"
            WITH inserted AS (
                INSERT INTO Reviews (Book_Id, Username, Rating, Review_Text) 
                VALUES (@Book_Id, @Username, @Rating, TRIM(@Review_Text))
                RETURNING Username
            )
            INSERT INTO UserActivity (Username, Book_Title, Activity_Type)
            SELECT 
                @Username, 
                @Book_Title, 
                CASE 
                    WHEN TRIM(COALESCE(@Review_Text, '')) = '' THEN 'rated' 
                    ELSE 'reviewed' 
                END
            FROM inserted;";
    
        await connection.ExecuteAsync(query, review);
    }

    public async Task UpdateReviewWithActivity(int id, Review review)
    {
        using var connection = _db.CreateConnection();

        var query = @"
            WITH updated AS (
                UPDATE Reviews 
                SET Rating = @Rating, 
                    Review_Text = TRIM(@Review_Text), 
                    Timestamp = CURRENT_TIMESTAMP 
                WHERE Id = @Id
                RETURNING Username
            )
            INSERT INTO UserActivity (Username, Book_Title, Activity_Type)
            SELECT 
                @Username, 
                @Book_Title, 
                CASE 
                    WHEN TRIM(COALESCE(@Review_Text, '')) = '' THEN 'updated rating' 
                    ELSE 'updated review' 
                END
            FROM updated;";

        await connection.ExecuteAsync(query, new 
        { 
            Id = id, 
            review.Username, 
            review.Rating, 
            review.Review_Text, 
            review.Book_Title 
        });
    }

    // Pobiera najnowsze opinie napisane przez danego użytkownika. 
    public async Task<IEnumerable<Review>> GetReviewsByUsername(string username)
    {
        using var connection = _db.CreateConnection();
        var query = @"
            SELECT Id, Book_Id, Username, Rating, Review_Text, Timestamp
            FROM Reviews 
            WHERE Username = @Username
            ORDER BY Timestamp
            DESC LIMIT 10";
        return await connection.QueryAsync<Review>(query, new { Username = username });
    }

}