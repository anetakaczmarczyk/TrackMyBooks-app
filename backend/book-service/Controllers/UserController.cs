using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using book_service.Services;
using book_service.Models;
using System.Text;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly UserRepository _userRepository;
    private readonly BooksdbRepository _booksdbRepository;
    private readonly ReviewRepository _reviewRepository;
    private readonly HardcoverClient _client;

    public UserController(UserRepository userRepository, BooksdbRepository booksdbRepository, ReviewRepository reviewRepository, HardcoverClient client)
    {
        _userRepository = userRepository;
        _booksdbRepository = booksdbRepository;
        _reviewRepository = reviewRepository;
        _client = client;
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


    [HttpPost("update")]
    public async Task<IActionResult> UpdateUser([FromBody] ChangeUserDataRequest user)
    {
        await _userRepository.UpdateUser(user);
        return Ok("User updated!");
    }

    [HttpPost("changePassword")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        var user = await _userRepository.GetUserByEmail(request.Email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.Password_Hash))
        {
            return Unauthorized("Invalid password");
        }
        await _userRepository.UpdatePassword(request);
        return Ok("Password updated!");
    }

    [HttpPost("delete")]
    public async Task<IActionResult> DeleteAccount([FromBody] DeleteAccountRequest request)
    {
        var user = await _userRepository.GetUserByEmail(request.Email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.Password_Hash) || request.Confirmation != "DELETE ACCOUNT")
        {
            Console.WriteLine($"Delete account failed: user={user}, confirmationValid={request.Confirmation == "DELETE ACCOUNT"}");
            return Unauthorized("Invalid password");
        }
        await _userRepository.DeleteUser(request);
        Logout();
        return Ok("Account deleted!");
    }

    [HttpGet("{username}")]
    public async Task<IActionResult> GetUserByUsername([FromRoute] string username)
    {
        Console.WriteLine($"Fetching profile for username: {username}");
        var user = await _userRepository.GetUserByUsername(username);
        if (user == null)
        {
            return NotFound();
        }
        var reviews = await _reviewRepository.GetReviewsByUsername(username);
        foreach (var review in reviews)
        {
            var bookData = await _client.GetBookById(review.Book_Id);
            if (bookData != null && bookData.Count > 0)            {
                review.Cached_Book = bookData[0];
            }
        }
        var recentActivity = await _booksdbRepository.GetRecentActivityByUsername(username);
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

        return Ok(new { user, reviews, recentActivity, libraryItems });
    }

}