using Microsoft.AspNetCore.Mvc;
using System.Text;
using book_service.Repositories;

[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly IReviewRepository  _reviewRepository;
    private readonly IBooksdbRepository _booksdbRepository;

    public ReviewsController(IReviewRepository  reviewRepository, IBooksdbRepository booksdbRepository)
    {
        _reviewRepository = reviewRepository;
        _booksdbRepository = booksdbRepository;
    }

    [HttpGet("book/{externalBookId}")]
    public async Task<IActionResult> GetReviewsByBook(int externalBookId)
    {
        var reviews = await _reviewRepository.GetReviewsForBook(externalBookId);
        return Ok(reviews);
    }

    [HttpPost("add")]
    public async Task<IActionResult> AddReview([FromBody] Review review)
    {
        await _reviewRepository.AddReview(review);
        
        // Logowanie aktywności użytkownika w zależności od tego, czy dodał tekst recenzji, czy tylko ocenę
        if (string.IsNullOrWhiteSpace(review.Review_Text))
        {
            await _booksdbRepository.AddToActivity(review.Username, review.Book_Title, "rated");
        }
        else
        {
            await _booksdbRepository.AddToActivity(review.Username, review.Book_Title, "reviewed");
        }
        return Ok();
    }

    [HttpPut("update/{id}")]
    public async Task<IActionResult> UpdateReview(int id, [FromBody] Review review)
    {
        if (review.Review_Text != null)
        {
            review.Review_Text = review.Review_Text.Trim();
        }
        
        await _reviewRepository.UpdateReview(id, review);
        
        // Aktualizacja logów aktywności po edycji recenzji lub oceny
        if (string.IsNullOrWhiteSpace(review.Review_Text))
        {
            await _booksdbRepository.AddToActivity(review.Username, review.Book_Title, "updated rating");
        }
        else
        {
            await _booksdbRepository.AddToActivity(review.Username, review.Book_Title, "updated review");
        }
        return Ok();
    }
}