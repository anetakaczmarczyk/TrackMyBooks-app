using System.Collections.Generic;
using System.Threading.Tasks;
using book_service.Models;

namespace book_service.Repositories;

public interface IReviewRepository
{
    Task<IEnumerable<Review>> GetReviewsForBook(int bookId);
    Task AddReview(Review review);
    Task UpdateReview(int id, Review review);
    Task<IEnumerable<Review>> GetReviewsByUsername(string username);
}