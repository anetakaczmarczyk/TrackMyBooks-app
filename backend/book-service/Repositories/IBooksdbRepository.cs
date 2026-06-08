using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using book_service.Models;

namespace book_service.Repositories;

public interface IBooksdbRepository
{
    Task<IEnumerable<ReadingStatus>> GetUserReadingStatus(string username);
    Task<IEnumerable<ReadingStatus>> GetBookReadingStatus(int book_Id, string username);
    Task AddBookToReadingStatus(string username, int bookId, string status, int progress);
    Task UpdateReadingStatus(string username, int bookId, string status, int progress = 0);
    Task RemoveBookFromReadingStatus(string username, int bookId);
    Task<IEnumerable<ReadingStatus>> GetUserReadingStatuses(string username);
    Task UpdateProgress(string username, int bookId, int progress, bool isFinished);
    Task AddToActivity(string username, string bookTitle, string status);
    Task<IEnumerable<UserActivity>> GetRecentActivityByUsername(string username);
    Task<ReadingData> GetBookReadingData(int bookId, string username);
    Task CreateSession(int readingStatusId, int pagesStarted, int pagesFinished, int durationMinutes, DateTime logDate);
    Task CreateNote(int readingStatusId, string note, int pageNumber);
    Task ProcessReadingStatusTransaction(string username, int bookId, string bookTitle, string status, int progress);
}