using System.Collections.Generic;
using System.Threading.Tasks;
using book_service.Models;

namespace book_service.Repositories;

public interface IReviewRepository
{
    Task<IEnumerable<Review>> GetReviewsForBook(int bookId);
    Task<IEnumerable<Review>> GetReviewsByUsername(string username);
    Task AddReviewWithActivity(Review review);
    Task UpdateReviewWithActivity(int id, Review review);
}