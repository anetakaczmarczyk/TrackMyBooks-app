using System.Runtime.CompilerServices;
using Dapper;
using book_service.Repositories;
using System.Text.Json;
using System.Collections.Generic;
using System.Linq;
using book_service.Models;

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
        var query = @"
            SELECT id, book_id, status, start_date, end_date, progress
            FROM ReadingStatus
            WHERE username = @Username";
        return await connection.QueryAsync<ReadingStatus>(query, new { Username = username });
    }

    public async Task<IEnumerable<ReadingStatus>> GetBookReadingStatus(int book_Id, string username)
    {
        using var connection = _db.CreateConnection();
        var query = @"
            SELECT id, book_id, status, start_date, end_date, progress
            FROM ReadingStatus
            WHERE book_id = @BookId AND username = @Username
            LIMIT 1";
        return await connection.QueryAsync<ReadingStatus>(query, new { BookId = book_Id, Username = username });
    }

    // Dynamiczne tworzenie zapytania INSERT w zależności od tego, czy książka jest dopiero planowana (wishlist),
    // czy aktualnie czytana (reading - ustawienie start_date), czy już przeczytana (read - ustawienie end_date)
    public async Task AddBookToReadingStatus(string username, int bookId, string status, int progress)
    {
        using var connection = _db.CreateConnection();
        var query = @"
            INSERT INTO ReadingStatus (username, book_id, status, start_date, end_date, progress)
            VALUES (
                @Username, 
                @BookId, 
                @Status, 
                CASE WHEN @Status IN ('reading', 'abandoned', 'read') THEN CURRENT_DATE ELSE NULL END,
                CASE WHEN @Status = 'read' THEN CURRENT_DATE ELSE NULL END,
                CASE WHEN @Status = 'read' THEN @Progress ELSE 0 END
            )";
        // Wykonywanie poleceń modyfikujących bazę (INSERT/UPDATE/DELETE), które nie zwracają wierszy
        await connection.ExecuteAsync(query, new { Username = username, BookId = bookId, Status = status, Progress = progress });
    }

public async Task ProcessReadingStatusTransaction(string username, int bookId, string bookTitle, string status, int progress)
{
    using var connection = _db.CreateConnection();

    var sql = @"
        BEGIN;

        INSERT INTO ReadingStatus (username, book_id, status, start_date, end_date, progress)
        SELECT 
            @Username, 
            @BookId, 
            @Status, 
            CASE WHEN @Status IN ('reading', 'abandoned', 'read') THEN CURRENT_DATE ELSE NULL END,
            CASE WHEN @Status = 'read' THEN CURRENT_DATE ELSE NULL END,
            CASE WHEN @Status = 'read' THEN @Progress ELSE 0 END
        WHERE @Status IN ('read', 'reading', 'wishlist', 'abandoned')
        ON CONFLICT (username, book_id) 
        DO UPDATE SET 
            status = EXCLUDED.status,
            progress = EXCLUDED.progress,
            end_date = EXCLUDED.end_date,
            start_date = CASE 
                WHEN EXCLUDED.status IN ('reading', 'abandoned') THEN CURRENT_DATE 
                ELSE ReadingStatus.start_date 
            END;

        DELETE FROM ReadingStatus 
        WHERE username = @Username 
          AND book_id = @BookId 
          AND @Status NOT IN ('read', 'reading', 'wishlist', 'abandoned');

        INSERT INTO UserActivity (username, book_title, activity_type)
        VALUES (
            @Username, 
            @BookTitle, 
            CASE 
                WHEN @Status = 'reading' THEN 'started reading'
                WHEN @Status = 'read' THEN 'finished reading'
                WHEN @Status = 'abandoned' THEN 'abandoned'
                WHEN @Status = 'wishlist' THEN 'added to wishlist'
                WHEN @Status NOT IN ('read', 'reading', 'wishlist', 'abandoned') THEN 'removed from list'
                ELSE 'updated status of'
            END
        );

        COMMIT;";

    // Dapper wykonuje ten skrypt jako jedną, niepodzielną operację
    await connection.ExecuteAsync(sql, new { 
        Username = username, 
        BookId = bookId, 
        BookTitle = bookTitle, 
        Status = status, 
        Progress = progress 
    });
}

    public async Task UpdateReadingStatus(string username, int bookId, string status, int progress = 0)
    {
        using var connection = _db.CreateConnection();
        var query = @"
            UPDATE ReadingStatus 
            SET 
                status = @Status,
                start_date = CASE 
                    WHEN @Status IN ('reading', 'abandoned') THEN CURRENT_DATE 
                    WHEN @Status = 'read' THEN start_date -- nie zmieniaj
                    ELSE NULL 
                END,
                end_date = CASE 
                    WHEN @Status = 'read' THEN CURRENT_DATE 
                    WHEN @Status IN ('reading', 'abandoned') THEN NULL 
                    ELSE NULL 
                END,
                progress = CASE 
                    WHEN @Status IN ('reading', 'read') THEN @Progress 
                    ELSE 0 
                END
        WHERE username = @Username AND book_id = @BookId";
        
        await connection.ExecuteAsync(query, new { Username = username, BookId = bookId, Status = status, Progress = progress });
    }

    public async Task RemoveBookFromReadingStatus(string username, int bookId)
    {
        using var connection = _db.CreateConnection();
        var query = @"
        DELETE FROM ReadingStatus 
        WHERE username = @Username AND book_id = @BookId";
        await connection.ExecuteAsync(query, new { Username = username, BookId = bookId });
    }

    public async Task<IEnumerable<ReadingStatus>> GetUserReadingStatuses(string username)
    {
        using var connection = _db.CreateConnection();
        var query = @"
            SELECT id, book_id, status, start_date, end_date, progress 
            FROM ReadingStatus 
            WHERE username = @Username";
        return await connection.QueryAsync<ReadingStatus>(query, new {Username = username });
    }

    public async Task UpdateProgress(string username, int bookId, int progress, bool isFinished)
    {
        using var connection = _db.CreateConnection();
        var query = @"
                UPDATE ReadingStatus 
                SET 
                    progress = @Progress,
                    end_date = CASE WHEN @IsFinished THEN CURRENT_DATE ELSE NULL END,
                    status   = CASE WHEN @IsFinished THEN 'read' ELSE 'reading' END
                WHERE username = @Username AND book_id = @BookId";

            await connection.ExecuteAsync(query, new { 
                Username = username, 
                BookId = bookId, 
                Progress = progress, 
                IsFinished = isFinished 
            });
    }

    // Tłumaczenie technicznych stanów aplikacji na czytelne komunikaty tekstowe
    public async Task AddToActivity(string username, string bookTitle, string status)
    {
        using var connection = _db.CreateConnection();
        var query = @"
            INSERT INTO UserActivity (username, book_title, activity_type)
            VALUES (@Username, @BookTitle, 
                CASE @Status
                    WHEN 'reading' THEN 'started reading'
                    WHEN 'read' THEN 'finished reading'
                    WHEN 'abandoned' THEN 'abandoned'
                    WHEN 'wishlist' THEN 'added to wishlist'
                    WHEN 'rated' THEN 'rated'
                    WHEN 'reviewed' THEN 'wrote a review for'
                    WHEN 'removed' THEN 'removed from list'
                    WHEN 'updated rating' THEN 'updated rating for'
                    WHEN 'updated review' THEN 'updated review for'
                    ELSE 'updated status of'
                END
            )";
        await connection.ExecuteAsync(query, new { Username = username, BookTitle = bookTitle, Status = status });
    }

    public async Task<IEnumerable<UserActivity>> GetRecentActivityByUsername(string username)
    {
        using var connection = _db.CreateConnection();
        var query = @"
        SELECT id, username, book_title, activity_type, timestamp 
        FROM UserActivity 
        WHERE username = @Username 
        ORDER BY timestamp DESC 
        LIMIT 10";
        return await connection.QueryAsync<UserActivity>(query, new { Username = username });
    }

    // Złożone zapytanie agregujące dane o czytaniu konkretnej książki przez użytkownika
    // Łączy w jeden obiekt model stanu z powiązanymi listami sesji oraz notatek.
    public async Task<ReadingData> GetBookReadingData(int bookId, string username)
    {
        using var connection = _db.CreateConnection();
        
        var query = @"
            SELECT 
            rs.id AS Id, 
            rs.book_id AS Book_Id, 
            rs.username AS Username, 
            rs.progress AS Progress, 
            rs.start_date AS Start_Date, 
            rs.end_date AS End_Date, 
            rs.status AS Status,
            COALESCE((
                SELECT jsonb_agg(s ORDER BY s.created_at DESC) 
                FROM Sessions s 
                WHERE s.readingStatus_id = rs.id
            ), '[]'::jsonb)::text AS Reading_Sessions_Json,
            COALESCE((
                SELECT jsonb_agg(n ORDER BY n.created_at DESC) 
                FROM BookNotes n 
                WHERE n.readingStatus_id = rs.id
            ), '[]'::jsonb)::text AS Book_Notes_Json
        FROM ReadingStatus rs
        WHERE rs.book_id = @BookId AND rs.username = @Username";

        var result = await connection.QueryFirstOrDefaultAsync(query, new { BookId = bookId, Username = username });
        if (result == null)
        {
            return null;
        }
        DateOnly? startDateDb = result.start_date;
        DateOnly? endDateDb = result.end_date;
        string sessionsJson = Convert.ToString(result.reading_sessions_json) ?? "[]";
        string notesJson = Convert.ToString(result.book_notes_json) ?? "[]";

        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };
        return new ReadingData
        {
            Reading = new Reading
                {
                    Id = result.id,
                    Status = result.status,
                    Progress = result.progress,
                    Start_Date = startDateDb,
                    End_Date = endDateDb 
                },
            ReadingSessions = JsonSerializer.Deserialize<List<ReadingSession>>(sessionsJson, jsonOptions) ?? new List<ReadingSession>(),
            BookNotes = JsonSerializer.Deserialize<List<BookNote>>(notesJson, jsonOptions) ?? new List<BookNote>()
        };
    }
    
    public async Task CreateSession(int readingStatusId, int pagesStarted, int pagesFinished, int durationMinutes, DateTime logDate)
    {
        using var connection = _db.CreateConnection();
        var query = @"
            INSERT INTO Sessions (readingStatus_id, pages_started, pages_finished, duration_minutes, created_at) 
            VALUES (@ReadingId, @PagesStarted, @PagesFinished, @DurationMinutes, @LogDate)";
        await connection.ExecuteAsync(query, new { ReadingId = readingStatusId, PagesStarted = pagesStarted, PagesFinished = pagesFinished, DurationMinutes = durationMinutes, LogDate = logDate });
    }

    public async Task CreateNote(int readingStatusId, string note, int pageNumber)
    {
        using var connection = _db.CreateConnection();
        var query = @"
            INSERT INTO BookNotes (readingStatus_id, note, page_number) 
            VALUES (@ReadingId, @Note, @PageNumber)";
        await connection.ExecuteAsync(query, new { ReadingId = readingStatusId, Note = note, PageNumber = pageNumber });
    }
}