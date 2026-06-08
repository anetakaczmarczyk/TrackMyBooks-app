public class User
{
    public string Name { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password_Hash { get; set; } = string.Empty;
    public string Preferred_Genres { get; set; } = string.Empty;
    public string Bio { get; set; } = string.Empty;
    public int Books_Goal { get; set; } = 0;
}

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public bool RememberMe { get; set; } = false;
}

public class ChangeUserDataRequest
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Bio { get; set; } = string.Empty;
    public int Books_Goal { get; set; } = 0;
}

public class ChangePasswordRequest
{
    public string Email { get; set; } = string.Empty;
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}

public class DeleteAccountRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Confirmation { get; set; } = string.Empty;
}

public class UserActivity
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Book_Title { get; set; } = string.Empty;
    public string Activity_Type { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
}

public class SendInvitationRequest
{
    public string UserUsername { get; set; } = string.Empty;
    public string FriendUsername { get; set; } = string.Empty;
}
public class FriendWithBooksDto
{
    public string Username { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string FriendshipStatus { get; set; } = string.Empty;
    public bool IsInitiator { get; set; }
    public List<FriendReadingStatusDto> ReadingStatuses { get; set; } = new();
    public List<FriendActivityDto> Activities { get; set; } = new();
    public List<FriendReviewDto> Reviews { get; set; } = new();
}
public class DashboardDataDTO
{
    public List<Review> UserReviews { get; set; } = new();
    public List<ReadingStatus> UserReading { get; set; } = new();
    public List<RawActivityRow> FriendsData { get; set; } = new();
}
public class FriendActivityDto
{
    public string ActivityType { get; set; } = string.Empty;
    public string BookTitle { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
}

public class FriendReadingStatusDto
{
    public int Id { get; set; }
    public int Book_Id { get; set; }
    public string Status { get; set; } = string.Empty;
    public int Progress { get; set; }
    public DateOnly? Start_Date { get; set; }
    public DateOnly? End_Date { get; set; }
}

public class RawFriendshipRow
{
    public string FriendshipStatus { get; set; } = string.Empty;
    public string FriendUsername { get; set; } = string.Empty;
    public string FriendName { get; set; } = string.Empty;
    public bool IsInitiator { get; set; }
    public int? StatusId { get; set; } // int? bo LEFT JOIN może dać NULL
    public int? BookId { get; set; }
    public string? ReadingStatus { get; set; }
    public int? Progress { get; set; }
    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
}

public class RawActivityRow
{
    public string Username { get; set; } = string.Empty;
    public string ActivityType { get; set; } = string.Empty;
    public string BookTitle { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
}

public class FriendReviewDto
{
    public int Id { get; set; }
    public int Book_Id { get; set; }
    public int Rating { get; set; }
    public string Review_Text { get; set; } = string.Empty;
    public string Book_Title { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
}

public class RawReviewRow
{
    public string Username { get; set; } = string.Empty;
    public int Id { get; set; }
    public int BookId { get; set; }
    public int Rating { get; set; }
    public string ReviewText { get; set; } = string.Empty;
    public string BookTitle { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
}

public class RespondToInvitationRequest
{
    public string UserUsername { get; set; } = string.Empty;
    public string FriendUsername { get; set; } = string.Empty;
    public bool Accept { get; set; }
}