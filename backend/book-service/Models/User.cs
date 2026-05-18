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