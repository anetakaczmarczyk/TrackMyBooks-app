public class ReadingStatus
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public int Book_Id { get; set; }
    public int Progress { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateOnly? Start_Date { get; set; }
    public DateOnly? End_Date { get; set; }
}

public class AddToReadingStatusRequest
{
    public string Username { get; set; } = string.Empty;
    public int Book_Id { get; set; }
    public string Status { get; set; } = string.Empty;
    public int Progress { get; set; } = 0;
    public string Book_Title { get; set; } = string.Empty;
}