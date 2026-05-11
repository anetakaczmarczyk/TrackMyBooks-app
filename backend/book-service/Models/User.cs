public class User
{
    public string Name { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password_Hash { get; set; } = string.Empty;
    public string Preferred_Genres { get; set; } = string.Empty;
    public string Bio { get; set; } = string.Empty;
    public int BooksGoal { get; set; } = 0;
}

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public bool RememberMe { get; set; } = false;
}