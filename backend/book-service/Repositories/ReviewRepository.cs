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
        var query = "SELECT * FROM Reviews WHERE Book_Id = @Book_Id ORDER BY Timestamp DESC";
        return await connection.QueryAsync<Review>(query, new { Book_Id = bookId });
    }

    public async Task AddReview(Review review)
    {
        using var connection = _db.CreateConnection();
        // Funkcja TRIM() w SQL oczyszcza tekst recenzji ze zbędnych spacji i znaków nowej linii na początku oraz końcu tekstu
        var query = "INSERT INTO Reviews (Book_Id, Username, Rating, Review_Text) VALUES (@Book_Id, @Username, @Rating, TRIM(@Review_Text))";
        await connection.ExecuteAsync(query, review);
    }

    public async Task UpdateReview(int id, Review review)
    {
        using var connection = _db.CreateConnection();
        // Podczas edycji recenzji, ręcznie wymuszamy aktualizację kolumny Timestamp
        var query = "UPDATE Reviews SET Rating = @Rating, Review_Text = TRIM(@Review_Text), Timestamp = CURRENT_TIMESTAMP WHERE Id = @Id";
        await connection.ExecuteAsync(query, new { review.Rating, review.Review_Text, Id = id });
    }

    // Pobiera najnowsze opinie napisane przez danego użytkownika. 
    public async Task<IEnumerable<Review>> GetReviewsByUsername(string username)
    {
        using var connection = _db.CreateConnection();
        var query = "SELECT * FROM Reviews WHERE Username = @Username ORDER BY Timestamp DESC LIMIT 10";
        return await connection.QueryAsync<Review>(query, new { Username = username });
    }

}