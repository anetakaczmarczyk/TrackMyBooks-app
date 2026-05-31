using System.Runtime.CompilerServices;
using Dapper;
using book_service.Repositories;

namespace book_service.Repositories;

// Repozytorium obsługujące całą bazodanową logikę książek, ich statusów, notatek oraz sesji czytelniczych
public class BooksdbRepository : IBooksdbRepository 
{
    private readonly DbConnectionFactory _db;
    public BooksdbRepository(DbConnectionFactory db) => _db = db;

        
    public async Task<IEnumerable<ReadingStatus>> GetUserReadingStatus(string username)
    {
        // Automatyczne i bezpieczne zamknięcie połączenia z bazą, gdy metoda zakończy działanie
        using var connection = _db.CreateConnection();
        
        // Zastosowanie zapisu @Username i przekazanie go w anonimowym obiekcie Dappera
        // w pełni zabezpiecza aplikację przed podatnością na SQL Injection
        var query = "SELECT * FROM ReadingStatus WHERE username = @Username";
        return await connection.QueryAsync<ReadingStatus>(query, new { Username = username });
    }

    public async Task<IEnumerable<ReadingStatus>> GetBookReadingStatus(int book_Id, string username)
    {
        using var connection = _db.CreateConnection();
        var query = "SELECT * FROM ReadingStatus WHERE book_id = @BookId AND username = @Username";
        return await connection.QueryAsync<ReadingStatus>(query, new { BookId = book_Id, Username = username });
    }

    // Dynamiczne tworzenie zapytania INSERT w zależności od tego, czy książka jest dopiero planowana (wishlist),
    // czy aktualnie czytana (reading - ustawienie start_date), czy już przeczytana (read - ustawienie end_date)
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
        // Wykonywanie poleceń modyfikujących bazę (INSERT/UPDATE/DELETE), które nie zwracają wierszy
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

    public async Task UpdateProgress(string username, int bookId, int progress, bool isFinished)
    {
        using var connection = _db.CreateConnection();
        if (isFinished)
        {
            var query = "UPDATE ReadingStatus SET progress = @Progress, end_date = CURRENT_DATE, status = 'read' WHERE username = @Username AND book_id = @BookId";
            await connection.ExecuteAsync(query, new { Username = username, BookId = bookId, Progress = progress });
        }
        else
        {
            var query = "UPDATE ReadingStatus SET progress = @Progress, status = 'reading', end_date = NULL WHERE username = @Username AND book_id = @BookId";
            await connection.ExecuteAsync(query, new { Username = username, BookId = bookId, Progress = progress });
        }
    }

    // Tłumaczenie technicznych stanów aplikacji na czytelne komunikaty tekstowe
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

    public async Task<IEnumerable<UserActivity>> GetRecentActivityByUsername(string username)
    {
        using var connection = _db.CreateConnection();
        var query = "SELECT * FROM UserActivity WHERE username = @Username ORDER BY timestamp DESC LIMIT 10";
        return await connection.QueryAsync<UserActivity>(query, new { Username = username });
    }

    // Złożone zapytanie agregujące dane o czytaniu konkretnej książki przez użytkownika
    // Łączy w jeden obiekt model stanu z powiązanymi listami sesji oraz notatek.
    public async Task<ReadingData> GetBookReadingData(int bookId, string username)
    {
        using var connection = _db.CreateConnection();
        
        // Pobieramy główny rekord statusu czytania książki
        var readingStatusQuery = "SELECT * FROM ReadingStatus WHERE book_id = @BookId AND username = @Username";
        var readingStatus = await connection.QueryFirstOrDefaultAsync<Reading>(readingStatusQuery, new { BookId = bookId, Username = username });

        // Jeśli użytkownik nie ma tej książki na żadnej ze swoich list, przerywamy wyszukiwanie
        if (readingStatus == null)
        {
            return null; 
        }
        
        // Pobieramy wszystkie sesje czytania powiązane z tym statusem
        var sessionsQuery = "SELECT * FROM Sessions WHERE readingStatus_id = @ReadingStatusId ORDER BY created_at DESC";
        var readingSessions = (await connection.QueryAsync<ReadingSession>(sessionsQuery, new { ReadingStatusId = readingStatus.Id })).ToList();

        // Pobieramy notatki i przemyślenia zapisane przez użytkownika podczas czytania
        var bookNotesQuery = "SELECT * FROM BookNotes WHERE readingStatus_id = @ReadingStatusId ORDER BY created_at DESC";
        var bookNotes = (await connection.QueryAsync<BookNote>(bookNotesQuery, new { ReadingStatusId = readingStatus.Id })).ToList();
        
        return new ReadingData
        {
            Reading = readingStatus,
            ReadingSessions = readingSessions,
            BookNotes = bookNotes
        };
    }
    
    public async Task CreateSession(int readingStatusId, int pagesStarted, int pagesFinished, int durationMinutes, DateTime logDate)
    {
        using var connection = _db.CreateConnection();
        var query = "INSERT INTO Sessions (readingStatus_id, pages_started, pages_finished, duration_minutes, created_at) VALUES (@ReadingId, @PagesStarted, @PagesFinished, @DurationMinutes, @LogDate)";
        await connection.ExecuteAsync(query, new { ReadingId = readingStatusId, PagesStarted = pagesStarted, PagesFinished = pagesFinished, DurationMinutes = durationMinutes, LogDate = logDate });
    }

    public async Task CreateNote(int readingStatusId, string note, int pageNumber)
    {
        using var connection = _db.CreateConnection();
        var query = "INSERT INTO BookNotes (readingStatus_id, note, page_number) VALUES (@ReadingId, @Note, @PageNumber)";
        await connection.ExecuteAsync(query, new { ReadingId = readingStatusId, Note = note, PageNumber = pageNumber });
    }
}