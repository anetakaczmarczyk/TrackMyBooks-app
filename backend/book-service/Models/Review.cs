public class Review
{
    public int Id { get; set; }
    public int Book_Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string Review_Text { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
}