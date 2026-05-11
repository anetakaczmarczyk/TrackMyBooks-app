using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly UserRepository _userRepository;

    public UserController(UserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    private string GenerateJwtToken(User user)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.Username)
        };
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("p4#K9v&L2m@B8xZ!qR7nN#yP5cW1jF6sD3eH0aV4uY0gT")); // Example key, replace with your actual key, safe to store in a secure location
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256Signature);
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddDays(7),
            SigningCredentials = creds
        };
        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
    

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
        if (string.IsNullOrEmpty(userEmail))
        {
            return Unauthorized();
        }

        var user = await _userRepository.GetUserByEmail(userEmail);
        if (user == null)
        {
            return NotFound();
        }

        return Ok(user);
    }

    [HttpPost("logout")]
    public IActionResult Logout()   
    {
        Response.Cookies.Delete("authToken", new CookieOptions
        {
            HttpOnly = true,
            SameSite = SameSiteMode.Strict,
            Expires = DateTime.UtcNow.AddDays(-1)
        });
        return Ok();
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
        if (string.IsNullOrEmpty(email))
        {
            return Ok(new { taken = false });
        }
        var userExists = await _userRepository.CheckIfEmailIsTaken(email);
        return Ok(new { taken = userExists });
    }
    [HttpGet("checkIfUsernameIsTaken/{username}")]
    public async Task<IActionResult> CheckIfUsernameIsTaken([FromRoute] string username)
    {
        if (string.IsNullOrEmpty(username))
        {
            return Ok(new { taken = false });
        }
        var userExists = await _userRepository.CheckIfUsernameIsTaken(username);
        return Ok(new { taken = userExists });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _userRepository.GetUserByEmail(request.Email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.Password_Hash))
        {
            return Unauthorized("Invalid email or password");
        }

        var token = GenerateJwtToken(user);
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            SameSite = SameSiteMode.Strict,
        };
        if (request.RememberMe)
        {
            cookieOptions.Expires = DateTime.UtcNow.AddDays(7);
        }
        Response.Cookies.Append("authToken", token, cookieOptions);

        return Ok(new { token });
    }

}