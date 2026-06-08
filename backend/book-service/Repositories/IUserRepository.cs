using System.Collections.Generic;
using System.Threading.Tasks;
using book_service.Models;

namespace book_service.Repositories;

public interface IUserRepository
{
    Task CreateUser(User user);
    Task<User> GetUserByEmail(string email);
    Task<User> GetUserByUsername(string username);
    Task<bool> CheckIfEmailIsTaken(string email);
    Task<bool> CheckIfUsernameIsTaken(string username);
    Task UpdateUser(ChangeUserDataRequest user);
    Task UpdatePassword(ChangePasswordRequest request);
    Task DeleteUser(DeleteAccountRequest request);
    Task SendInvitation(SendInvitationRequest request);
    Task<bool> RespondToInvitation(RespondToInvitationRequest request);
    Task<bool> RemoveFriend(SendInvitationRequest request);
    Task<IEnumerable<FriendWithBooksDto>> GetFriendsData(string username);
    Task<DashboardDataDTO> GetDashboardData(string username);
}