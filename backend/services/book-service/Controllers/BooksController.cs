using Microsoft.AspNetCore.Mvc;
using book_service.Services;

namespace book_service.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BooksController : ControllerBase
{
    private readonly HardcoverClient _client;
    public BooksController(HardcoverClient client) => _client = client;

    [HttpGet("{title}")]
public async Task<IActionResult> Get(string title) 
{
    var data = await _client.GetBookByTitle(title);
    var bestBook = data.OrderByDescending(b => b.Ratings_Count).FirstOrDefault();
    return Ok(bestBook); 
}
}