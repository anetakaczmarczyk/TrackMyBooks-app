namespace book_service.Models;

public class AllBooksSearchRequest
{
    public int startNumber { get; set; } = 0;
    public int itemsPerPage { get; set; } = 51;
}

public class BookByIdSearchRequest
{
    public int bookId { get; set; } = 0;
}