using Dapper;

public class ReviewRepository
{
    private readonly DbConnectionFactory _db;
    public ReviewRepository(DbConnectionFactory db) => _db = db;

    public async Task<IEnumerable<Review>> GetReviewsForBook(int bookId)
    {
        using var connection = _db.CreateConnection();
        var query = "SELECT * FROM Reviews WHERE Book_Id = @Book_Id ORDER BY Timestamp DESC";
        return await connection.QueryAsync<Review>(query, new { Book_Id = bookId });
    }

    public async Task AddReview(Review review)
    {
        using var connection = _db.CreateConnection();
        var query = "INSERT INTO Reviews (Book_Id, Username, Rating, Review_Text) VALUES (@Book_Id, @Username, @Rating, TRIM(@Review_Text))";
        await connection.ExecuteAsync(query, review);
    }

    public async Task UpdateReview(int id, Review review)
    {
        using var connection = _db.CreateConnection();
        var query = "UPDATE Reviews SET Rating = @Rating, Review_Text = TRIM(@Review_Text), Timestamp = CURRENT_TIMESTAMP WHERE Id = @Id";
        await connection.ExecuteAsync(query, new { review.Rating, review.Review_Text, Id = id });
    }

}