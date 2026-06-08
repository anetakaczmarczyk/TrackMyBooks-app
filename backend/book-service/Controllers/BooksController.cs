using Microsoft.AspNetCore.Mvc;
using book_service.Services;
using book_service.Models;
using book_service.Repositories;

namespace book_service.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BooksController : ControllerBase
{
    // _client odpowiada za zewnętrzne API (Hardcover), a _booksdbRepository za bazę PostgreSQL
    private readonly HardcoverClient _client;
    private readonly IBooksdbRepository  _booksdbRepository;

    // Wstrzykiwanie zależności (Dependency Injection) przez interfejsy
    public BooksController(HardcoverClient client, IBooksdbRepository  booksdbRepository)
    {
        _client = client;
        _booksdbRepository = booksdbRepository;
    }

    // Wyszukiwanie listy książek ze wsparciem dla paginacji
    [HttpPost("search")]
    public async Task<IActionResult> Get([FromBody] AllBooksSearchRequest request) 
    {
        if (request == null || request.startNumber < 0)
        {
            return BadRequest("Invalid request. Please provide a valid start number.");
        }
        var data = await _client.GetBooks(request.startNumber, request.itemsPerPage);
        return Ok(data); 
    }

    // Pobieranie szczegółów pojedynczej książki bezpośrednio z zewnętrznego API Hardcover
    [HttpPost("bookById")]
    public async Task<IActionResult> Get([FromBody] BookByIdSearchRequest request) 
    {
        if (request == null || request.bookId < 0)
        {
            return BadRequest("Invalid request. Please provide a valid book ID.");
        }
        var data = await _client.GetBookById(request.bookId);
        return Ok(data); 
    }

    [HttpGet("slider-books")]
    public async Task<IActionResult> GetDashboardBooks()
    {
        var trending = await _client.GetTrendingBooks();
        var news = await _client.GetNewReleases();

        return Ok(new {
            trending,
            news
        });
    }

    // Główny silnik rekomendacji - dopasowuje książki do nastroju wybranego przez użytkownika
    [HttpGet("getRecommendations")]
    public async Task<IActionResult> GetRecommendations([FromQuery] string mood, [FromQuery] string? username)
    {
        // 1. Mapowanie wybranego "nastroju" na konkretne tagi i gatunki literackie, z których korzysta API
        var keywords = mood.ToLower() switch
        {
            "relax" => new List<string> { "romance", "humor", "comedy", "strength" },
            "adventure" => new List<string> { "fantasy", "sci-fi", "science fiction", "adventure" },
            "mind" => new List<string> { "science", "philosophy", "nonfiction" },
            "emotion" => new List<string> { "drama", "biography", "memoir" },
            "mystery" => new List<string> { "thriller", "mystery", "crime", "horror" },
            "wonder" => new List<string> { "magical realism", "high fantasy" },
            _ => new List<string> { "fiction" }
        };

        // Pobieranie szerszej puli (40 najlepszych książek), żeby mieć z czego filtrować
        var allBooks = await _client.GetRecommendations(limit: 40);

        // 2. Identyfikacja użytkownika - sprawdzamy, czy request pochodzi od zalogowanego usera
        string? activeUsername = null;

        if (!string.IsNullOrWhiteSpace(username) && username.Trim().ToLower() != "null" && username.Trim().ToLower() != "undefined")
        {
            activeUsername = username.Trim();
        }
        else if (User.Identity != null && User.Identity.IsAuthenticated && !string.IsNullOrWhiteSpace(User.Identity.Name))
        {
            var tokenName = User.Identity.Name.Trim();
            if (tokenName.ToLower() != "null" && tokenName.ToLower() != "undefined")
            {
                activeUsername = tokenName;
            }
        }

        var userOwnedBookIds = new List<int>();

        // 3. Zabezpieczenie przed polecaniem książek, które użytkownik już przeczytał lub ma na liście
        if (!string.IsNullOrEmpty(activeUsername))
        {
            var readingStatuses = await _booksdbRepository.GetUserReadingStatus(activeUsername);
            
            userOwnedBookIds = readingStatuses
                .Select(rs => rs.Book_Id) 
                .ToList();
        }

        // 4. Zaawansowane filtrowanie i transformacja wyników
        var response = allBooks
            .Where(b => b.Id.HasValue) 
            .Where(b => !userOwnedBookIds.Contains(b.Id.Value))
            .Select(b => 
            {
                // Sprawdzamy, czy tagi książki pokrywają się ze słowami kluczowymi wybranego nastroju
                var matchedTag = b.Cached_Tags?
                    .SelectMany(pair => pair.Value) 
                    .FirstOrDefault(t => t != null && !string.IsNullOrEmpty(t.Tag) && keywords.Contains(t.Tag.ToLower())); 

                string primaryGenre = matchedTag != null 
                    ? matchedTag.Tag 
                    : (b.Cached_Tags?.FirstOrDefault().Value?.FirstOrDefault()?.Tag ?? keywords.FirstOrDefault() ?? "Fiction");

                return new { Book = b, PrimaryGenre = primaryGenre, IsMatch = matchedTag != null };
            })
            .OrderByDescending(x => x.IsMatch) // Najlepsze dopasowania lądują na początku listy
            .Take(10) // Ograniczamy ostateczny wynik do 10 książek
            .Select(x => 
            {
                // Generowanie dynamicznego opisu
                string reasonText = string.IsNullOrEmpty(activeUsername)
                    ? $"\"If you love the vibe of {x.PrimaryGenre} – this highly-rated pick from the {mood} section is an absolute must-read!\""
                    : $"\"Based on your interest in {x.PrimaryGenre} – you are looking for a story with a deeper atmosphere and tension.\"";

                // Mapowanie na obiekt DTO wysyłany do klienta
                return new RecommendationDto
                {
                    Book_Id = x.Book.Id.Value,
                    Title = x.Book.Title,
                    AuthorName = x.Book.Contributions?.FirstOrDefault()?.Author?.Name ?? "Unknown Author",
                    ImageUrl = x.Book.Cached_Image?.Url ?? "",
                    Rating = x.Book.Rating,
                    PrimaryGenre = x.PrimaryGenre.ToUpper(),
                    Reason = reasonText
                };
            }).ToList();

        return Ok(response);
    }

    [HttpGet("readingStatus/{book_Id}")]
    public async Task<IActionResult> GetUserReadingStatus([FromRoute] int book_Id, [FromQuery] string username)
    {
        var userLists = await _booksdbRepository.GetBookReadingStatus(book_Id, username);
        return Ok(userLists);
    }

    // Pobiera pełną bibliotekę użytkownika
    [HttpGet("getUserReadingStatuses/{username}")]
    public async Task<IActionResult> GetUserReadingStatuses([FromRoute] string username)
    {
        var userReadingStatuses = await _booksdbRepository.GetUserReadingStatuses(username);
        var libraryItems = new List<UserLibraryItemDto>();
        
        foreach (var status in userReadingStatuses)
        {
            var bookData = await _client.GetBookById(status.Book_Id);
            if (bookData != null && bookData.Count > 0)
            {
                libraryItems.Add(new UserLibraryItemDto
                {
                    Status = status.Status,
                    Progress = status.Progress,
                    Start_Date = status.Start_Date,
                    End_Date = status.End_Date,
                    Book = bookData[0]
                });
            }
        }
        return Ok(libraryItems);
    }

    // Pobiera złożone informacje dla panelu czytania
    [HttpPost("getReadingData")]
    public async Task<IActionResult> GetReadingData([FromBody] GetReadingDataRequest request)
    {
        if (await _booksdbRepository.GetBookReadingStatus(request.BookId, request.Username) == null)
        {
            return NotFound("No reading status found for this book and user.");
        }
        
        var data = await _booksdbRepository.GetBookReadingData(request.BookId, request.Username);
        var bookData = await _client.GetBookById(request.BookId);
        
        if (bookData == null || bookData.Count == 0)
        {
            return NotFound("Book not found.");
        }
        data.bookData = bookData[0];
        
        return Ok(data);
    }

    // Główna funkcja zarządzająca statusem książki
    [HttpPut("addToReadingStatus")]
    public async Task<IActionResult> AddBookToReadingStatus([FromBody] AddToReadingStatusRequest request)
    {
        if (request == null)
        {
            return BadRequest("Invalid request.");
        }

        // Wywołujemy jedną, bezpieczną transakcję, która zajmie się wszystkim (dodaniem, edycją lub usunięciem)
        await _booksdbRepository.ProcessReadingStatusTransaction(
            request.Username, 
            request.Book_Id, 
            request.Book_Title, 
            request.Status, 
            request.Progress
        );

        return Ok("Book list status successfully processed.");
    }

    [HttpPost("updateProgress")]
    public async Task<IActionResult> UpdateProgress([FromBody] UpdateProgressRequest request)
    {
        await _booksdbRepository.UpdateProgress(request.Username, request.Book_Id, request.Progress, request.IsFinished);
        return Ok("Progress updated!");
    }

    [HttpPost("createSession")]
    public async Task<IActionResult> CreateSession([FromBody] CreateSessionRequest request)
    {
        await _booksdbRepository.CreateSession(request.ReadingStatus_Id, request.Pages_Started, request.Pages_Finished, request.Duration_Minutes, request.Log_Date);
        return Ok("Session created!");
    }
    
    [HttpPost("createNote")]
    public async Task<IActionResult> CreateNote([FromBody] CreateNoteRequest request)
    {
        await _booksdbRepository.CreateNote(request.ReadingStatus_Id, request.Note, request.Page_Number);
        return Ok("Session created!");
    }
}