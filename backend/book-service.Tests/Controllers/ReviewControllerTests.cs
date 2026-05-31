using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Xunit;
using Moq;

using book_service.Controllers;
using book_service.Models;
using book_service.Repositories;

namespace book_service.Tests.Controllers;

public class ReviewsControllerTests
{
    private readonly ReviewsController _controller;
    private readonly Mock<IReviewRepository> _mockReviewRepo;
    private readonly Mock<IBooksdbRepository> _mockBooksRepo;

    public ReviewsControllerTests()
    {
        _mockReviewRepo = new Mock<IReviewRepository>();
        _mockBooksRepo = new Mock<IBooksdbRepository>();

        _mockReviewRepo
            .Setup(repo => repo.GetReviewsForBook(It.IsAny<int>()))
            .ReturnsAsync(new List<Review>());
            
        _mockReviewRepo
            .Setup(repo => repo.GetReviewsByUsername(It.IsAny<string>()))
            .ReturnsAsync(new List<Review>());

        _controller = new ReviewsController(_mockReviewRepo.Object, _mockBooksRepo.Object);
    }

    // ================================================================
    // GET /book/{externalBookId}
    // ================================================================

    [Fact]
    public async Task GetReviewsByBook_ShouldReturnOk_WhenCalledWithPositiveId()
    {
        var result = await _controller.GetReviewsByBook(1);
        Assert.IsType<OkObjectResult>(result);
    }

    [Fact]
    public async Task GetReviewsByBook_ShouldReturnOk_WhenCalledWithZero()
    {
        var result = await _controller.GetReviewsByBook(0);
        Assert.IsType<OkObjectResult>(result);
    }

    [Fact]
    public async Task GetReviewsByBook_ShouldReturnEmptyList_WhenNoReviewsExist()
    {
        var result = await _controller.GetReviewsByBook(999);

        var ok = Assert.IsType<OkObjectResult>(result);
        var reviews = Assert.IsAssignableFrom<IEnumerable<Review>>(ok.Value);
        Assert.Empty(reviews);
    }

    // ================================================================
    // POST /add
    // ================================================================

    [Fact]
    public async Task AddReview_ShouldReturnOk_WhenReviewHasText()
    {
        var review = new Review
        {
            Username = "testuser",
            Book_Id = 42,
            Book_Title = "Test Book",
            Rating = 5,
            Review_Text = "Świetna książka!"
        };

        var result = await _controller.AddReview(review);

        Assert.IsType<OkResult>(result);
        
        _mockReviewRepo.Verify(r => r.AddReview(It.IsAny<Review>()), Times.Once);
        _mockBooksRepo.Verify(r => r.AddToActivity(review.Username, review.Book_Title, "reviewed"), Times.Once);
    }

    [Fact]
    public async Task AddReview_ShouldReturnOk_WhenReviewTextIsEmpty()
    {
        var review = new Review
        {
            Username = "testuser",
            Book_Id = 42,
            Book_Title = "Test Book",
            Rating = 4,
            Review_Text = ""
        };

        var result = await _controller.AddReview(review);

        Assert.IsType<OkResult>(result);
        _mockBooksRepo.Verify(r => r.AddToActivity(review.Username, review.Book_Title, "rated"), Times.Once);
    }

    [Fact]
    public async Task AddReview_ShouldReturnOk_WhenReviewTextIsWhitespaceOnly()
    {
        var review = new Review
        {
            Username = "testuser",
            Book_Id = 42,
            Book_Title = "Test Book",
            Rating = 3,
            Review_Text = "   "
        };

        var result = await _controller.AddReview(review);

        Assert.IsType<OkResult>(result);
        _mockBooksRepo.Verify(r => r.AddToActivity(review.Username, review.Book_Title, "rated"), Times.Once);
    }

    // ================================================================
    // PUT /update/{id}
    // ================================================================

    [Fact]
    public async Task UpdateReview_ShouldReturnOk_WhenReviewTextIsProvided()
    {
        var review = new Review
        {
            Username = "testuser",
            Book_Id = 42,
            Book_Title = "Test Book",
            Rating = 5,
            Review_Text = "  Zaktualizowana recenzja.  "
        };

        var result = await _controller.UpdateReview(1, review);

        Assert.IsType<OkResult>(result);
        _mockReviewRepo.Verify(r => r.UpdateReview(1, It.IsAny<Review>()), Times.Once);
    }

    [Fact]
    public async Task UpdateReview_ShouldReturnOk_WhenReviewTextIsEmpty()
    {
        var review = new Review
        {
            Username = "testuser",
            Book_Id = 42,
            Book_Title = "Test Book",
            Rating = 2,
            Review_Text = ""
        };

        var result = await _controller.UpdateReview(1, review);

        Assert.IsType<OkResult>(result);
    }

    [Fact]
    public async Task UpdateReview_ShouldTrimReviewText_BeforeSaving()
    {
        var review = new Review
        {
            Username = "testuser",
            Book_Id = 42,
            Book_Title = "Test Book",
            Rating = 4,
            Review_Text = "   Tekst z paddingiem   "
        };

        await _controller.UpdateReview(1, review);

        Assert.Equal("Tekst z paddingiem", review.Review_Text);
    }

    [Fact]
    public async Task UpdateReview_ShouldReturnOk_WhenReviewTextIsWhitespaceOnly()
    {
        var review = new Review
        {
            Username = "testuser",
            Book_Id = 42,
            Book_Title = "Test Book",
            Rating = 1,
            Review_Text = "   "
        };

        var result = await _controller.UpdateReview(1, review);

        Assert.IsType<OkResult>(result);
    }
}