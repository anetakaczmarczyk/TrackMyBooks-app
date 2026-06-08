using Microsoft.AspNetCore.Mvc;
using System.Text;
using book_service.Repositories;

[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly IReviewRepository  _reviewRepository;

    public ReviewsController(IReviewRepository  reviewRepository, IBooksdbRepository booksdbRepository)
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
        await _reviewRepository.AddReviewWithActivity(review);
        return Ok();
    }

    [HttpPut("update/{id}")]
    public async Task<IActionResult> UpdateReview(int id, [FromBody] Review review)
    {
        await _reviewRepository.UpdateReviewWithActivity(id, review);
        return Ok();
    }
}