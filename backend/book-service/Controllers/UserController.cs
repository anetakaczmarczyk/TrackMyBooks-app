using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly UserRepository _userRepository;

    public UserController(UserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    [HttpPost("createUser")]
    public async Task<IActionResult> CreateUser([FromBody] User user)
    {   
        string passwordHash = BCrypt.Net.BCrypt.HashPassword(user.Password_Hash);
        user.Password_Hash = passwordHash;
        await _userRepository.CreateUser(user);
        return Ok("User created!");
    }
    [HttpGet("checkIfEmailIsTaken/{email}")]
    public async Task<IActionResult> CheckIfEmailIsTaken([FromRoute] string email)
    {
        var userExists = await _userRepository.CheckIfEmailIsTaken(email);
        return Ok(new { taken = userExists });
    }
    [HttpGet("checkIfUsernameIsTaken/{username}")]
    public async Task<IActionResult> CheckIfUsernameIsTaken([FromRoute] string username)
    {
        var userExists = await _userRepository.CheckIfUsernameIsTaken(username);
        return Ok(new { taken = userExists });
    }
}