using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Xunit;
using Moq;

using book_service.Controllers;
using book_service.Models;
using book_service.Services;
using book_service.Repositories;

namespace book_service.Tests.Controllers;

public class UserControllerTests
{
    private readonly UserController _controller;
    private readonly Mock<IUserRepository> _mockUserRepo;
    private readonly Mock<IBooksdbRepository> _mockBooksRepo;
    private readonly Mock<IReviewRepository> _mockReviewRepo;

    public UserControllerTests()
    {
        var graphQLMockResponse = "{\"data\": {\"books\": [], \"editions\": []}}";
        var fakeHandler = new FakeHttpMessageHandlerUser(graphQLMockResponse);
        var httpClient = new HttpClient(fakeHandler)
        {
            BaseAddress = new Uri("https://api.hardcover.io/")
        };
        var hardcoverClient = new HardcoverClient(httpClient);

        _mockUserRepo = new Mock<IUserRepository>();
        _mockBooksRepo = new Mock<IBooksdbRepository>();
        _mockReviewRepo = new Mock<IReviewRepository>();

        _mockBooksRepo.Setup(r => r.GetUserReadingStatuses(It.IsAny<string>()))
                      .ReturnsAsync(new List<ReadingStatus>());
                      
        _mockReviewRepo.Setup(r => r.GetReviewsByUsername(It.IsAny<string>()))
                       .ReturnsAsync(new List<Review>());
                       
        _mockUserRepo.Setup(r => r.GetFriendsData(It.IsAny<string>()))
                     .ReturnsAsync(new List<FriendWithBooksDto>());

        _controller = new UserController(
            _mockUserRepo.Object,
            _mockBooksRepo.Object,
            _mockReviewRepo.Object,
            hardcoverClient);
    }

    private void SetAuthenticatedUser(string email, string username)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.Email, email),
            new Claim(ClaimTypes.Name, username)
        };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal(identity) }
        };
    }

    private void SetUnauthenticatedUser()
    {
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext()
        };
    }

    private static bool GetTakenProperty(object value)
    {
        var prop = value.GetType().GetProperty("taken");
        Assert.NotNull(prop);
        return (bool)prop!.GetValue(value)!;
    }

    // ================================================================
    // GET /me
    // ================================================================

    [Fact]
    public async Task GetCurrentUser_ShouldReturnUnauthorized_WhenNoEmailClaim()
    {
        SetUnauthenticatedUser();
        var result = await _controller.GetCurrentUser();
        Assert.IsType<UnauthorizedResult>(result);
    }

    [Fact]
    public async Task GetCurrentUser_ShouldReturnNotFound_WhenEmailNotInRepository()
    {
        SetAuthenticatedUser("nieistniejacy@example.com", "ghost");
        
        var result = await _controller.GetCurrentUser();
        
        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public async Task GetCurrentUser_ShouldReturnOk_WhenUserExists()
    {
        var email = "alice@example.com";
        var user = new User { Username = "alice", Email = email, Password_Hash = "hash" };
        
        _mockUserRepo.Setup(r => r.GetUserByEmail(email)).ReturnsAsync(user);
        
        SetAuthenticatedUser(email, "alice");

        var result = await _controller.GetCurrentUser();

        Assert.IsType<OkObjectResult>(result);
    }

    // ================================================================
    // POST /logout
    // ================================================================

    [Fact]
    public void Logout_ShouldReturnOk_Always()
    {
        SetUnauthenticatedUser();
        var result = _controller.Logout();
        Assert.IsType<OkResult>(result);
    }

    // ================================================================
    // POST /createUser
    // ================================================================

    [Fact]
    public async Task CreateUser_ShouldReturnOkWithMessage()
    {
        var user = new User { Username = "newuser", Email = "new@example.com", Password_Hash = "password123" };
        var result = await _controller.CreateUser(user);
        
        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Equal("User created!", ok.Value);
    }

    [Fact]
    public async Task CreateUser_ShouldHashPassword_BeforeStoring()
    {
        var plainPassword = "mySecret123!";
        var user = new User { Username = "newuser2", Email = "new2@example.com", Password_Hash = plainPassword };

        await _controller.CreateUser(user);

        Assert.NotEqual(plainPassword, user.Password_Hash);
        Assert.True(BCrypt.Net.BCrypt.Verify(plainPassword, user.Password_Hash));
        
        _mockUserRepo.Verify(r => r.CreateUser(It.IsAny<User>()), Times.Once);
    }

    // ================================================================
    // GET /checkIfEmailIsTaken/{email}
    // ================================================================

    [Fact]
    public async Task CheckIfEmailIsTaken_ShouldReturnFalse_WhenEmailIsEmpty()
    {
        var result = await _controller.CheckIfEmailIsTaken("");
        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.False(GetTakenProperty(ok.Value!));
    }

    [Fact]
    public async Task CheckIfEmailIsTaken_ShouldReturnFalse_WhenEmailNotSeeded()
    {
        var result = await _controller.CheckIfEmailIsTaken("notseeded@test.com");
        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.False(GetTakenProperty(ok.Value!));
    }

    [Fact]
    public async Task CheckIfEmailIsTaken_ShouldReturnTrue_WhenEmailExists()
    {
        _mockUserRepo.Setup(r => r.CheckIfEmailIsTaken("bob@example.com")).ReturnsAsync(true);

        var result = await _controller.CheckIfEmailIsTaken("bob@example.com");

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.True(GetTakenProperty(ok.Value!));
    }

    // ================================================================
    // GET /checkIfUsernameIsTaken/{username}
    // ================================================================

    [Fact]
    public async Task CheckIfUsernameIsTaken_ShouldReturnFalse_WhenUsernameIsEmpty()
    {
        var result = await _controller.CheckIfUsernameIsTaken("");
        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.False(GetTakenProperty(ok.Value!));
    }

    [Fact]
    public async Task CheckIfUsernameIsTaken_ShouldReturnFalse_WhenUsernameNotSeeded()
    {
        var result = await _controller.CheckIfUsernameIsTaken("ghost");
        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.False(GetTakenProperty(ok.Value!));
    }

    [Fact]
    public async Task CheckIfUsernameIsTaken_ShouldReturnTrue_WhenUsernameExists()
    {
        _mockUserRepo.Setup(r => r.CheckIfUsernameIsTaken("carol")).ReturnsAsync(true);

        var result = await _controller.CheckIfUsernameIsTaken("carol");

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.True(GetTakenProperty(ok.Value!));
    }

    // ================================================================
    // POST /login
    // ================================================================

    [Fact]
    public async Task Login_ShouldReturnUnauthorized_WhenUserDoesNotExist()
    {
        SetUnauthenticatedUser();

        var result = await _controller.Login(new LoginRequest { Email = "nobody@example.com", Password = "whatever", RememberMe = false });

        Assert.IsType<UnauthorizedObjectResult>(result);
    }

    [Fact]
    public async Task Login_ShouldReturnUnauthorized_WhenPasswordIsWrong()
    {
        SetUnauthenticatedUser();
        var dbUser = new User { Username = "dave", Email = "dave@example.com", Password_Hash = BCrypt.Net.BCrypt.HashPassword("correctpass") };
        _mockUserRepo.Setup(r => r.GetUserByEmail("dave@example.com")).ReturnsAsync(dbUser);

        var result = await _controller.Login(new LoginRequest { Email = "dave@example.com", Password = "wrongpass", RememberMe = false });

        Assert.IsType<UnauthorizedObjectResult>(result);
    }

    [Fact]
    public async Task Login_ShouldReturnOk_WhenCredentialsAreCorrect()
    {
        SetUnauthenticatedUser();
        var dbUser = new User { Username = "eve", Email = "eve@example.com", Password_Hash = BCrypt.Net.BCrypt.HashPassword("secret") };
        _mockUserRepo.Setup(r => r.GetUserByEmail("eve@example.com")).ReturnsAsync(dbUser);

        var result = await _controller.Login(new LoginRequest { Email = "eve@example.com", Password = "secret", RememberMe = false });

        Assert.IsType<OkObjectResult>(result);
    }

    // ================================================================
    // POST /sendInvitation
    // ================================================================

    [Fact]
    public async Task SendInvitation_ShouldReturnBadRequest_WhenSendingToSelf()
    {
        var result = await _controller.SendInvitation(new SendInvitationRequest { UserUsername = "alice", FriendUsername = "alice" });

        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal("You cannot send an invitation to yourself.", badRequest.Value);
    }

    [Fact]
    public async Task SendInvitation_ShouldReturnNotFound_WhenFriendDoesNotExist()
    {
        var result = await _controller.SendInvitation(new SendInvitationRequest { UserUsername = "alice", FriendUsername = "ghost" });

        var notFound = Assert.IsType<NotFoundObjectResult>(result);
        Assert.Equal("The user you are trying to invite does not exist.", notFound.Value);
    }

    [Fact]
    public async Task SendInvitation_ShouldReturnOk_WhenFriendExists()
    {
        _mockUserRepo.Setup(r => r.GetUserByUsername("frank")).ReturnsAsync(new User { Username = "frank" });

        var result = await _controller.SendInvitation(new SendInvitationRequest { UserUsername = "alice", FriendUsername = "frank" });

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Equal("Invitation sent!", ok.Value);
    }

    // ================================================================
    // POST /respondToInvitation
    // ================================================================

    [Fact]
    public async Task RespondToInvitation_ShouldReturnBadRequest_WhenSameUser()
    {
        var result = await _controller.RespondToInvitation(new RespondToInvitationRequest { UserUsername = "alice", FriendUsername = "alice" });

        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal("Invalid operation.", badRequest.Value);
    }

    [Fact]
    public async Task RespondToInvitation_ShouldReturnBadRequest_WhenNoInvitationExists()
    {
        _mockUserRepo.Setup(r => r.GetFriendsData("alice")).ReturnsAsync(new List<FriendWithBooksDto>());

        var result = await _controller.RespondToInvitation(new RespondToInvitationRequest { UserUsername = "alice", FriendUsername = "bob", Accept = true });

        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal("No invitation found from this user.", badRequest.Value);
    }

    // ================================================================
    // POST /removeFriend
    // ================================================================

    [Fact]
    public async Task RemoveFriend_ShouldReturnBadRequest_WhenSameUser()
    {
        var result = await _controller.RemoveFriend(new SendInvitationRequest { UserUsername = "alice", FriendUsername = "alice" });

        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal("Invalid operation.", badRequest.Value);
    }

    [Fact]
    public async Task RemoveFriend_ShouldReturnBadRequest_WhenNotFriends()
    {
        var result = await _controller.RemoveFriend(new SendInvitationRequest { UserUsername = "alice", FriendUsername = "bob" });

        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal("This user is not in your friends list.", badRequest.Value);
    }

    // ================================================================
    // GET /getFriendsData
    // ================================================================

    [Fact]
    public async Task GetFriendsData_ShouldReturnUnauthorized_WhenNoNameClaim()
    {
        SetUnauthenticatedUser();

        var result = await _controller.GetFriendsData();

        Assert.IsType<UnauthorizedResult>(result);
    }

    [Fact]
    public async Task GetFriendsData_ShouldReturnOk_WhenUserIsAuthenticated()
    {
        SetAuthenticatedUser("alice@example.com", "alice");

        var result = await _controller.GetFriendsData();

        Assert.IsType<OkObjectResult>(result);
    }

    // ================================================================
    // GET /{username}
    // ================================================================

    [Fact]
    public async Task GetUserByUsername_ShouldReturnNotFound_WhenUsernameDoesNotExist()
    {
        var result = await _controller.GetUserByUsername("ghost");
        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public async Task GetUserByUsername_ShouldReturnOk_WhenUserExists()
    {
        _mockUserRepo.Setup(r => r.GetUserByUsername("hank")).ReturnsAsync(new User { Username = "hank" });

        var result = await _controller.GetUserByUsername("hank");

        Assert.IsType<OkObjectResult>(result);
    }

    // ================================================================
    // POST /changePassword
    // ================================================================

    [Fact]
    public async Task ChangePassword_ShouldReturnUnauthorized_WhenUserDoesNotExist()
    {
        var result = await _controller.ChangePassword(new ChangePasswordRequest { Email = "noone@example.com", CurrentPassword = "oldpass", NewPassword = "newpass" });
        Assert.IsType<UnauthorizedObjectResult>(result);
    }

    [Fact]
    public async Task ChangePassword_ShouldReturnUnauthorized_WhenCurrentPasswordIsWrong()
    {
        var dbUser = new User { Email = "ivan@example.com", Password_Hash = BCrypt.Net.BCrypt.HashPassword("realpass") };
        _mockUserRepo.Setup(r => r.GetUserByEmail("ivan@example.com")).ReturnsAsync(dbUser);

        var result = await _controller.ChangePassword(new ChangePasswordRequest { Email = "ivan@example.com", CurrentPassword = "wrongpass", NewPassword = "newpass" });

        Assert.IsType<UnauthorizedObjectResult>(result);
    }

    [Fact]
    public async Task ChangePassword_ShouldReturnOk_WhenPasswordIsCorrect()
    {
        var dbUser = new User { Email = "julia@example.com", Password_Hash = BCrypt.Net.BCrypt.HashPassword("oldpass") };
        _mockUserRepo.Setup(r => r.GetUserByEmail("julia@example.com")).ReturnsAsync(dbUser);

        var result = await _controller.ChangePassword(new ChangePasswordRequest { Email = "julia@example.com", CurrentPassword = "oldpass", NewPassword = "newpass123" });

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Equal("Password updated!", ok.Value);
    }

    // ================================================================
    // POST /delete
    // ================================================================

    [Fact]
    public async Task DeleteAccount_ShouldReturnUnauthorized_WhenUserDoesNotExist()
    {
        SetUnauthenticatedUser();
        var result = await _controller.DeleteAccount(new DeleteAccountRequest { Email = "noone@example.com", Password = "anypass", Confirmation = "DELETE ACCOUNT" });
        Assert.IsType<UnauthorizedObjectResult>(result);
    }

    [Fact]
    public async Task DeleteAccount_ShouldReturnUnauthorized_WhenConfirmationPhraseIsWrong()
    {
        SetUnauthenticatedUser();
        var dbUser = new User { Email = "karl@example.com", Password_Hash = BCrypt.Net.BCrypt.HashPassword("pass") };
        _mockUserRepo.Setup(r => r.GetUserByEmail("karl@example.com")).ReturnsAsync(dbUser);

        var result = await _controller.DeleteAccount(new DeleteAccountRequest { Email = "karl@example.com", Password = "pass", Confirmation = "wrong phrase" });

        Assert.IsType<UnauthorizedObjectResult>(result);
    }

    [Fact]
    public async Task DeleteAccount_ShouldReturnOk_WhenEverythingIsCorrect()
    {
        SetUnauthenticatedUser();
        var dbUser = new User { Email = "lena@example.com", Password_Hash = BCrypt.Net.BCrypt.HashPassword("pass") };
        _mockUserRepo.Setup(r => r.GetUserByEmail("lena@example.com")).ReturnsAsync(dbUser);

        var result = await _controller.DeleteAccount(new DeleteAccountRequest { Email = "lena@example.com", Password = "pass", Confirmation = "DELETE ACCOUNT" });

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Equal("Account deleted!", ok.Value);
    }
}

// ====================================================================
// POMOCNIK HTTP
// ====================================================================
public class FakeHttpMessageHandlerUser : HttpMessageHandler
{
    private readonly string _responseContent;

    public FakeHttpMessageHandlerUser(string responseContent)
    {
        _responseContent = responseContent;
    }

    protected override Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage request,
        CancellationToken cancellationToken)
    {
        var response = new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StringContent(
                _responseContent,
                System.Text.Encoding.UTF8,
                "application/json")
        };
        return Task.FromResult(response);
    }
}