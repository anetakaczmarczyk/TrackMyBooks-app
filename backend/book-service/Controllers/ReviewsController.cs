using Microsoft.AspNetCore.Mvc;
using System.Text;

[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly ReviewRepository _reviewRepository;
    private readonly BooksdbRepository _booksdbRepository;

    public ReviewsController(ReviewRepository reviewRepository, BooksdbRepository booksdbRepository)
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
        if (review.Review_Text == null || review.Review_Text.Trim() == "")
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
        if (review.Review_Text == null || review.Review_Text.Trim() == "")
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