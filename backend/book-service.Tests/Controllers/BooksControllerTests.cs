using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Xunit;
using Moq; 

using book_service.Controllers;
using book_service.Models;
using book_service.Services;
using book_service.Repositories; 

namespace book_service.Tests.Controllers;

public class BooksControllerTests
{
    private readonly BooksController _controller;
    private readonly Mock<IBooksdbRepository> _mockRepository;

    public BooksControllerTests()
    {
        var graphQLMockResponse = "{\"data\": {\"books\": [], \"editions\": []}}";
        var fakeHandler = new FakeHttpMessageHandler(graphQLMockResponse);
        var httpClient = new HttpClient(fakeHandler)
        {
            BaseAddress = new Uri("https://api.hardcover.io/")
        };
        var realClient = new HardcoverClient(httpClient);

        _mockRepository = new Mock<IBooksdbRepository>();

        _mockRepository
            .Setup(repo => repo.GetUserReadingStatus(It.IsAny<string>()))
            .ReturnsAsync(new List<ReadingStatus>());

        _controller = new BooksController(realClient, _mockRepository.Object)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            }
        };
    }

    // ================================================================
    // POST /search
    // ================================================================

    [Fact]
    public async Task Search_ShouldReturnBadRequest_WhenRequestIsNull()
    {
        var result = await _controller.Get((AllBooksSearchRequest)null!);

        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal("Invalid request. Please provide a valid start number.", badRequest.Value);
    }

    [Fact]
    public async Task Search_ShouldReturnBadRequest_WhenStartNumberIsNegative()
    {
        var request = new AllBooksSearchRequest { startNumber = -1, itemsPerPage = 10 };
        var result = await _controller.Get(request);

        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal("Invalid request. Please provide a valid start number.", badRequest.Value);
    }

    [Fact]
    public async Task Search_ShouldReturnOk_WhenStartNumberIsZero()
    {
        var request = new AllBooksSearchRequest { startNumber = 0, itemsPerPage = 10 };
        var result = await _controller.Get(request);

        Assert.IsType<OkObjectResult>(result);
    }

    [Fact]
    public async Task Search_ShouldReturnOk_WhenRequestIsValid()
    {
        var request = new AllBooksSearchRequest { startNumber = 5, itemsPerPage = 10 };
        var result = await _controller.Get(request);

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(ok.Value);
    }

    [Fact]
    public async Task Search_ShouldReturnEmptyList_WhenApiReturnsNoBooks()
    {
        var request = new AllBooksSearchRequest { startNumber = 0, itemsPerPage = 10 };
        var result = await _controller.Get(request);

        var ok = Assert.IsType<OkObjectResult>(result);
        var books = Assert.IsAssignableFrom<List<HardcoverBook>>(ok.Value);
        Assert.Empty(books);
    }

    // ================================================================
    // POST /bookById
    // ================================================================

    [Fact]
    public async Task BookById_ShouldReturnBadRequest_WhenRequestIsNull()
    {
        var result = await _controller.Get((BookByIdSearchRequest)null!);

        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal("Invalid request. Please provide a valid book ID.", badRequest.Value);
    }

    [Fact]
    public async Task BookById_ShouldReturnBadRequest_WhenBookIdIsNegative()
    {
        var request = new BookByIdSearchRequest { bookId = -1 };
        var result = await _controller.Get(request);

        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal("Invalid request. Please provide a valid book ID.", badRequest.Value);
    }

    [Fact]
    public async Task BookById_ShouldReturnOk_WhenBookIdIsZero()
    {
        var request = new BookByIdSearchRequest { bookId = 0 };
        var result = await _controller.Get(request);

        Assert.IsType<OkObjectResult>(result);
    }

    [Fact]
    public async Task BookById_ShouldReturnOk_WhenBookIdIsPositive()
    {
        var request = new BookByIdSearchRequest { bookId = 42 };
        var result = await _controller.Get(request);

        var ok = Assert.IsType<OkObjectResult>(result);
        var books = Assert.IsAssignableFrom<List<BookById>>(ok.Value);
        Assert.Empty(books);
    }

    // ================================================================
    // GET /getRecommendations
    // ================================================================

    [Theory]
    [InlineData("relax")]
    [InlineData("adventure")]
    [InlineData("mind")]
    [InlineData("emotion")]
    [InlineData("mystery")]
    [InlineData("wonder")]
    [InlineData("unknown_mood")]
    public async Task GetRecommendations_ShouldReturnOk_ForEachMood(string mood)
    {
        var result = await _controller.GetRecommendations(mood, null);
        Assert.IsType<OkObjectResult>(result);
    }

    [Fact]
    public async Task GetRecommendations_ShouldReturnOk_WhenUsernameIsNull()
    {
        var result = await _controller.GetRecommendations("relax", null);
        Assert.IsType<OkObjectResult>(result);
    }

    [Fact]
    public async Task GetRecommendations_ShouldReturnOk_WhenUsernameIsLiteralNull()
    {
        var result = await _controller.GetRecommendations("adventure", "null");
        Assert.IsType<OkObjectResult>(result);
    }

    [Fact]
    public async Task GetRecommendations_ShouldReturnOk_WhenUsernameIsLiteralUndefined()
    {
        var result = await _controller.GetRecommendations("adventure", "undefined");
        Assert.IsType<OkObjectResult>(result);
    }

    [Fact]
    public async Task GetRecommendations_ShouldReturnOk_WhenUsernameIsWhitespace()
    {
        var result = await _controller.GetRecommendations("mind", "   ");
        Assert.IsType<OkObjectResult>(result);
    }

    [Fact]
    public async Task GetRecommendations_ShouldReturnEmptyList_WhenApiReturnsNoBooks()
    {
        var result = await _controller.GetRecommendations("mystery", null);

        var ok = Assert.IsType<OkObjectResult>(result);
        var list = Assert.IsAssignableFrom<List<RecommendationDto>>(ok.Value);
        Assert.Empty(list);
    }

    [Fact]
    public async Task GetRecommendations_ResultShouldNeverExceedTenItems()
    {
        var result = await _controller.GetRecommendations("relax", null);

        var ok = Assert.IsType<OkObjectResult>(result);
        var list = Assert.IsAssignableFrom<List<RecommendationDto>>(ok.Value);
        Assert.True(list.Count <= 10);
    }

    // ================================================================
    // PUT /addToReadingStatus
    // ================================================================

    [Theory]
    [InlineData("read")]
    [InlineData("reading")]
    [InlineData("wishlist")]
    [InlineData("abandoned")]
    public async Task AddBookToReadingStatus_ValidStatuses_ShouldContainOkResult(string status)
    {
        var request = new AddToReadingStatusRequest
        {
            Username = $"user_{Guid.NewGuid():N}",
            Book_Id = 99999,
            Book_Title = "Test Book",
            Status = status,
            Progress = 0
        };

        var result = await _controller.AddBookToReadingStatus(request);

        Assert.IsType<OkObjectResult>(result);
        
        _mockRepository.Verify(repo => repo.AddBookToReadingStatus(
            request.Username, request.Book_Id, request.Status, request.Progress), Times.Once);
    }

    [Fact]
    public async Task AddBookToReadingStatus_RemoveStatus_ShouldReturnOk()
    {
        var request = new AddToReadingStatusRequest
        {
            Username = $"user_{Guid.NewGuid():N}",
            Book_Id = 99999,
            Book_Title = "Test Book",
            Status = "remove",
            Progress = 0
        };

        var result = await _controller.AddBookToReadingStatus(request);

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Equal("Book added to list!", ok.Value);
        
        _mockRepository.Verify(repo => repo.RemoveBookFromReadingStatus(request.Username, request.Book_Id), Times.Once);
    }

    // ================================================================
    // POST /updateProgress
    // ================================================================

    [Fact]
    public async Task UpdateProgress_ShouldReturnOk_WithCorrectMessage()
    {
        var request = new UpdateProgressRequest
        {
            Username = "testuser",
            Book_Id = 1,
            Progress = 50,
            IsFinished = false
        };

        var result = await _controller.UpdateProgress(request);

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Equal("Progress updated!", ok.Value);
        
        _mockRepository.Verify(r => r.UpdateProgress(request.Username, request.Book_Id, request.Progress, request.IsFinished), Times.Once);
    }

    [Fact]
    public async Task UpdateProgress_ShouldReturnOk_WhenBookIsFinished()
    {
        var request = new UpdateProgressRequest
        {
            Username = "testuser",
            Book_Id = 1,
            Progress = 100,
            IsFinished = true
        };

        var result = await _controller.UpdateProgress(request);

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Equal("Progress updated!", ok.Value);
    }

    // ================================================================
    // POST /createSession
    // ================================================================

    [Fact]
    public async Task CreateSession_ShouldReturnOk_WithCorrectMessage()
    {
        var request = new CreateSessionRequest
        {
            ReadingStatus_Id = 1,
            Pages_Started = 10,
            Pages_Finished = 30,
            Duration_Minutes = 45,
            Log_Date = DateTime.UtcNow
        };

        var result = await _controller.CreateSession(request);

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Equal("Session created!", ok.Value);
    }

    // ================================================================
    // POST /createNote
    // ================================================================

    [Fact]
    public async Task CreateNote_ShouldReturnOk_WithCorrectMessage()
    {
        var request = new CreateNoteRequest
        {
            ReadingStatus_Id = 1,
            Note = "Bardzo ciekawy fragment.",
            Page_Number = 42
        };

        var result = await _controller.CreateNote(request);

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Equal("Session created!", ok.Value);
        
        _mockRepository.Verify(r => r.CreateNote(request.ReadingStatus_Id, request.Note, request.Page_Number), Times.Once);
    }

    [Fact]
    public async Task CreateNote_ShouldReturnOk_WhenNoteIsEmpty()
    {
        var request = new CreateNoteRequest
        {
            ReadingStatus_Id = 1,
            Note = "",
            Page_Number = 1
        };

        var result = await _controller.CreateNote(request);

        Assert.IsType<OkObjectResult>(result);
    }
}

// ====================================================================
// POMOCNIK HTTP
// ====================================================================
public class FakeHttpMessageHandler : HttpMessageHandler
{
    private readonly string _responseContent;

    public FakeHttpMessageHandler(string responseContent)
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