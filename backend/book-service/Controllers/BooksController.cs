using Microsoft.AspNetCore.Mvc;
using book_service.Services;
using book_service.Models;

namespace book_service.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BooksController : ControllerBase
{
    private readonly HardcoverClient _client;
    public BooksController(HardcoverClient client) => _client = client;

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
}