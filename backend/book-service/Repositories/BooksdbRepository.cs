using System.Runtime.CompilerServices;
using Dapper;

public class BooksdbRepository
{
    private readonly DbConnectionFactory _db;
    public BooksdbRepository(DbConnectionFactory db) => _db = db;

        
    public async Task<IEnumerable<ReadingStatus>> GetUserReadingStatus(string username)
    {
        using var connection = _db.CreateConnection();
        var query = "SELECT * FROM ReadingStatus WHERE username = @Username";
        return await connection.QueryAsync<ReadingStatus>(query, new { Username = username });
    }
        public async Task<IEnumerable<ReadingStatus>> GetBookReadingStatus(int book_Id, string username)
    {
        using var connection = _db.CreateConnection();
        var query = "SELECT * FROM ReadingStatus WHERE book_id = @BookId AND username = @Username";
        return await connection.QueryAsync<ReadingStatus>(query, new { BookId = book_Id, Username = username });
    }
    public async Task AddBookToReadingStatus(string username, int bookId, string status, int progress)
    {
        using var connection = _db.CreateConnection();
        var query = string.Empty;
        if (status == "reading" || status == "abandoned")
        {
            query = "INSERT INTO ReadingStatus (username, book_id, status, start_date) VALUES (@Username, @BookId, @Status, CURRENT_DATE)";
        }
        else if (status == "read")
        {
            query = "INSERT INTO ReadingStatus (username, book_id, status, start_date, end_date, progress) VALUES (@Username, @BookId, @Status, CURRENT_DATE, CURRENT_DATE, @Progress)";
        }
        else
        {
            query = "INSERT INTO ReadingStatus (username, book_id, status) VALUES (@Username, @BookId, @Status)";

        }
        await connection.ExecuteAsync(query, new { Username = username, BookId = bookId, Status = status, Progress = progress });
    }

    public async Task UpdateReadingStatus(string username, int bookId, string status, int progress = 0)
    {
        using var connection = _db.CreateConnection();
        var query = string.Empty;
        if (status == "reading")
        {
            query = "UPDATE ReadingStatus SET status = @Status, start_date = CURRENT_DATE, end_date = NULL, progress = @Progress WHERE username = @Username AND book_id = @BookId";
        }
        else if (status == "read")
        {
            query = "UPDATE ReadingStatus SET status = @Status, end_date = CURRENT_DATE, progress = @Progress WHERE username = @Username AND book_id = @BookId";
        }
        else if (status == "abandoned")
        {
            query = "UPDATE ReadingStatus SET status = @Status, start_date = CURRENT_DATE, end_date = NULL WHERE username = @Username AND book_id = @BookId";
        }
        else
        {
            query = "UPDATE ReadingStatus SET status = @Status, start_date = NULL, end_date = NULL, progress = 0 WHERE username = @Username AND book_id = @BookId";
        }
        
        await connection.ExecuteAsync(query, new { Username = username, BookId = bookId, Status = status, Progress = progress });
    }

    public async Task RemoveBookFromReadingStatus(string username, int bookId)
    {
        using var connection = _db.CreateConnection();
        var query = "DELETE FROM ReadingStatus WHERE username = @Username AND book_id = @BookId";
        await connection.ExecuteAsync(query, new { Username = username, BookId = bookId });
    }

    public async Task<IEnumerable<ReadingStatus>> GetUserReadingStatuses(string username)
    {
        using var connection = _db.CreateConnection();
        var query = "SELECT * FROM ReadingStatus WHERE username = @Username";
        return await connection.QueryAsync<ReadingStatus>(query, new {Username = username });
    }

    public async Task AddToActivity(string username, string bookTitle, string status)
    {
        using var connection = _db.CreateConnection();
        var activity = string.Empty;
        if (status == "reading")
        {
            activity = "started reading";
        }
        else if (status == "read")
        {
            activity = "finished reading";
        }
        else if (status == "abandoned")
        {
            activity = "abandoned";
        }
        else if (status == "wishlist")
        {
            activity = "added to wishlist";
        }
        else if (status == "rated")
        {
            activity = "rated";
        }
        else if (status == "reviewed")
        {
            activity = "wrote a review for";
        }
        else if (status == "removed")
        {
            activity = "removed from list";
        }
        else if (status == "updated rating")
        {
            activity = "updated rating for";
        }
        else if (status == "updated review")
        {
            activity = "updated review for";
        }
        else
        {
            activity = "updated status of";
        }
        var query = "INSERT INTO UserActivity (username, book_title, activity_type) VALUES (@Username, @BookTitle, @ActivityType)";
        await connection.ExecuteAsync(query, new { Username = username, BookTitle = bookTitle, ActivityType = activity });
    }
}