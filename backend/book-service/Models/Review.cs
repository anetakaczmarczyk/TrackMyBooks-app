using book_service.Models;
public class Review
{
    public int Id { get; set; }
    public int Book_Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string Review_Text { get; set; } = string.Empty;
    public string Book_Title { get; set; } = string.Empty;
    public BookById? Cached_Book { get; set; }
    public DateTime Timestamp { get; set; }
}