using Microsoft.AspNetCore.Mvc;
using book_service.Services;
using book_service.Models;

namespace book_service.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BooksController : ControllerBase
{
    private readonly HardcoverClient _client;
    private readonly BooksdbRepository _booksdbRepository;

    public BooksController(HardcoverClient client, BooksdbRepository booksdbRepository)
    {
        _client = client;
        _booksdbRepository = booksdbRepository;
    }

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


    [HttpPost("bookById")]
    public async Task<IActionResult> Get([FromBody] BookByIdSearchRequest request) 
    {
        if (request == null || request.bookId < 0)
        {
            return BadRequest("Invalid request. Please provide a valid book ID.");
        }
        var data = await _client.GetBookById(request.bookId);
        // var bestBook = data.OrderByDescending(b => b.Ratings_Count).FirstOrDefault();
        return Ok(data); 
    }

    [HttpGet("readingStatus/{book_Id}")]
    public async Task<IActionResult> GetUserReadingStatus([FromRoute] int book_Id, [FromQuery] string username)
    {
        var userLists = await _booksdbRepository.GetBookReadingStatus(book_Id, username);
        return Ok(userLists);
    }

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

    [HttpPut("addToReadingStatus")]
    public async Task<IActionResult> AddBookToReadingStatus([FromBody] AddToReadingStatusRequest request)
    {
        if (request.Status == "read" || request.Status == "reading" || request.Status == "wishlist" || request.Status == "abandoned")
        {
            var userLists = await _booksdbRepository.GetUserReadingStatus(request.Username);
            var existingEntry = userLists.FirstOrDefault(l => l.Book_Id == request.Book_Id);
            await _booksdbRepository.AddToActivity(request.Username, request.Book_Title, request.Status);
            if (existingEntry != null)
            {
                await _booksdbRepository.UpdateReadingStatus(request.Username, request.Book_Id, request.Status, request.Progress);
                return Ok("Book status updated in list!");
            }
            else
            {   
                await _booksdbRepository.AddBookToReadingStatus(request.Username, request.Book_Id, request.Status, request.Progress);
                return Ok("Book added to list!");
            }
        }
        else
        {
            await _booksdbRepository.RemoveBookFromReadingStatus(request.Username, request.Book_Id);
            await _booksdbRepository.AddToActivity(request.Username, request.Book_Title, "removed");
        }

        return Ok("Book added to list!");
    }
}