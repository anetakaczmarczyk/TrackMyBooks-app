using Microsoft.AspNetCore.Mvc;
using System.Text;

[ApiController]
[Route("api/[controller]")]
public class BooksdbController : ControllerBase
{
    private readonly BooksdbRepository _booksdbRepository;

    public BooksdbController(BooksdbRepository booksdbRepository)
    {
        _booksdbRepository = booksdbRepository;
    }

    [HttpGet("readingStatus/{book_Id}")]
    public async Task<IActionResult> GetUserReadingStatus([FromRoute] int book_Id, [FromQuery] string username)
    {
        var userLists = await _booksdbRepository.GetBookReadingStatus(book_Id, username);
        return Ok(userLists);
    }

    [HttpPut("addToReadingStatus")]
    public async Task<IActionResult> AddBookToReadingStatus([FromBody] AddToReadingStatusRequest request)
    {
        if (request.Status == "read" || request.Status == "reading" || request.Status == "wishlist" || request.Status == "abandoned")
        {
            var userLists = await _booksdbRepository.GetUserReadingStatus(request.Username);
            var existingEntry = userLists.FirstOrDefault(l => l.Book_Id == request.Book_Id);
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
        }

        return Ok("Book added to list!");
    }

}