using Microsoft.AspNetCore.Mvc;
using System.Text;

[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly ReviewRepository _reviewRepository;

    public ReviewsController(ReviewRepository reviewRepository)
    {
        _reviewRepository = reviewRepository;
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
        return Ok();
    }
}