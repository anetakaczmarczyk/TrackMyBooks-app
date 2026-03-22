using Microsoft.AspNetCore.Mvc;

namespace book_service.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BooksController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new[] { "Book 1", "Book 2", "Book 3" });
    }
}