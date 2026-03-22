using Microsoft.AspNetCore.Mvc;

namespace user_service.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new[] { "user1", "user2" });
    }
}