using book_service.Models;
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

public class GetReadingDataRequest
{
    public string Username { get; set; } = string.Empty;
    public int BookId { get; set; }
}

public class Reading
{
    public int Id { get; set; }
    public string Status { get; set; } = string.Empty;
    public int Progress { get; set; }
    public DateOnly? Start_Date { get; set; }
    public DateOnly? End_Date { get; set; }
}

public class ReadingSession
{
    public int Id { get; set; }
    public int Pages_Started { get; set; }
    public int Pages_Finished { get; set; }
    public int Duration_Minutes { get; set; }
    public DateTime Created_At { get; set; }
}

public class BookNote
{
    public string Note { get; set; } = string.Empty;
    public int Page_Number { get; set; }
    public DateTime Created_At { get; set; }
}

public class ReadingData
{
    public Reading? Reading { get; set; }
    public List<ReadingSession> ReadingSessions { get; set; } = new List<ReadingSession>();
    public List<BookNote> BookNotes { get; set; } = new List<BookNote>();
    public BookById? bookData { get; set; }
}

public class UpdateProgressRequest
{
    public string Username {get; set;}
    public int Book_Id {get; set;}
    public int Progress {get; set;}
    public bool IsFinished {get; set;}

}

public class CreateSessionRequest
{
    public int ReadingStatus_Id {get; set;}
    public int Pages_Started {get; set;}
    public int Pages_Finished {get; set;}
    public int Duration_Minutes {get; set;}
    public DateTime Log_Date {get; set;}

}

public class CreateNoteRequest
{
        public int ReadingStatus_Id {get; set;}
        public string Note {get; set;}
        public int Page_Number {get; set;}
}