using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using book_service.Services;
using book_service.Models;
using System.Text;
using book_service.Repositories;

namespace book_service.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly IUserRepository  _userRepository;
    private readonly IBooksdbRepository _booksdbRepository;
    private readonly IReviewRepository _reviewRepository;
    private readonly HardcoverClient _client;

    public UserController(IUserRepository  userRepository, IBooksdbRepository booksdbRepository, IReviewRepository reviewRepository, HardcoverClient client)
    {
        _userRepository = userRepository;
        _booksdbRepository = booksdbRepository;
        _reviewRepository = reviewRepository;
        _client = client;
    }

    // Tworzenie tokena JWT przeznaczonego do bezstanowej weryfikacji tożsamości użytkownika
    private string GenerateJwtToken(User user)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.Username)
        };
        // Klucz symetryczny używany do podpisywania tokena w celu weryfikacji jego integralności
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("p4#K9v&L2m@B8xZ!qR7nN#yP5cW1jF6sD3eH0aV4uY0gT")); 
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
    

    // Pobieranie danych aktualnie zalogowanego użytkownika na podstawie tożsamości zdekodowanej z tokena JWT
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

    // Bezpieczne wylogowanie poprzez usunięcie ciasteczka z tokenem JWT
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

    // Rejestracja użytkownika
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

    // Proces logowania: weryfikacja danych, generowanie JWT oraz zapis do bezpiecznego ciasteczka HTTP-Only
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _userRepository.GetUserByEmail(request.Email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.Password_Hash))
        {
            return Unauthorized("Invalid email or password");
        }

        var token = GenerateJwtToken(user);
        
        // Ciasteczko HttpOnly chroni przed kradzieżą tokena przez skrypty JS (ochrona przed XSS).
        // SameSite=Strict zabezpiecza aplikację przed atakami CSRF.
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

    // Zmiana hasła - wymaga podania i poprawnej weryfikacji dotychczasowego hasła
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

    // Usunięcie konta - potrójne zabezpieczenie: istnienie usera, weryfikacja hasła oraz ręczne wpisanie frazy potwierdzającej
    [HttpPost("delete")]
    public async Task<IActionResult> DeleteAccount([FromBody] DeleteAccountRequest request)
    {
        // 1. Pobranie danych zalogowanego użytkownika
        var user = await _userRepository.GetUserByEmail(request.Email);
        
        // 2. Podwójna weryfikacja intencji usunięcia konta:
        // a) sprawdzenie poprawności hasła BCryptem,
        // b) zweryfikowanie poprawnego, ręcznego wpisania frazy blokującej "DELETE ACCOUNT"
        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.Password_Hash) || request.Confirmation != "DELETE ACCOUNT")
        {
            Console.WriteLine($"Delete account failed: user={user}, confirmationValid={request.Confirmation == "DELETE ACCOUNT"}");
            return Unauthorized("Invalid password");
        }
        
        // 3. Wywołanie repozytorium w celu bezpowrotnego skasowania wszystkich danych transakcyjnych użytkownika
        await _userRepository.DeleteUser(request);
        
        // 4. Automatyczne unieważnienie sesji (usunięcie ciasteczka JWT z przeglądarki)
        Logout(); 
        return Ok("Account deleted!");
    }

    [HttpGet("getFriendsData")]
    public async Task<IActionResult> GetFriendsData()
    {
        var username = User.FindFirst(ClaimTypes.Name)?.Value;
        if (string.IsNullOrEmpty(username))        {
            return Unauthorized();
        }
        var friends = await _userRepository.GetFriendsData(username);
        return Ok(friends);
    }

    // Logika wysyłania zaproszeń do znajomych z walidacją potencjalnych błędów
    [HttpPost("sendInvitation")]
    public async Task<IActionResult> SendInvitation([FromBody] SendInvitationRequest request)
    {
        if (request.UserUsername == request.FriendUsername)
        {
            return BadRequest("You cannot send an invitation to yourself.");
        }
        if (await _userRepository.GetUserByUsername(request.FriendUsername) == null)
        {
            return NotFound("The user you are trying to invite does not exist.");
        }
        var friends = await _userRepository.GetFriendsData(request.UserUsername);
        if (friends.Any(f => f.Username == request.FriendUsername))
        {
            return BadRequest("You are already friends with this user or have sent an invitation.");
        }
        await _userRepository.SendInvitation(request);
        return Ok("Invitation sent!");
    }

    [HttpPost("respondToInvitation")]
    public async Task<IActionResult> RespondToInvitation([FromBody] RespondToInvitationRequest request)
    {
        if (request.UserUsername == request.FriendUsername)
        {
            return BadRequest("Invalid operation.");
        }
        var friends = await _userRepository.GetFriendsData(request.UserUsername);
        if (!friends.Any(f => f.Username == request.FriendUsername))
        {
            return BadRequest("No invitation found from this user.");
        }
        await _userRepository.RespondToInvitation(request);
        return Ok("Invitation response recorded!");
    }

    [HttpPost("removeFriend")]
    public async Task<IActionResult> RemoveFriend([FromBody] SendInvitationRequest request)
    {
        if (request.UserUsername == request.FriendUsername)
        {
            return BadRequest("Invalid operation.");
        }
        var friends = await _userRepository.GetFriendsData(request.UserUsername);
        if (!friends.Any(f => f.Username == request.FriendUsername))
        {
            return BadRequest("This user is not in your friends list.");
        }
        await _userRepository.RemoveFriend(request);
        return Ok("Friend removed!");
    }

    // Pobieranie kompletnego publicznego profilu innego użytkownika
    // Agreguje dane z bazy (recenzje, aktywność, półki) i uzupełnia je o dane książek pobrane w locie z zewnętrznego API (Hardcover)
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

    // Pobiera uproszczoną paczkę danych niezbędną do zasilenia głównego pulpitu (Dashboard) zalogowanego użytkownika
    [HttpGet("getDashboardData/{username}")]
    public async Task<IActionResult> GetDashboardData([FromRoute] string username)
    {
        var userReviews = await _reviewRepository.GetReviewsByUsername(username);
        var friendsData = await _userRepository.GetFriendsData(username);

        var userReadingStatuses = await _booksdbRepository.GetUserReadingStatuses(username);
        var userReading = new List<UserLibraryItemDto>();
        foreach (var status in userReadingStatuses)
        {
            var bookData = await _client.GetBookById(status.Book_Id);
            if (bookData != null && bookData.Count > 0)
            {
                userReading.Add(new UserLibraryItemDto
                {
                    Status = status.Status,
                    Progress = status.Progress,
                    Start_Date = status.Start_Date,
                    End_Date = status.End_Date,
                    Book = bookData[0]
                });
            }
        }

        return Ok(new { 
            userReviews = userReviews,
            userReading = userReading,
            friendsData = friendsData
         });
    }

}