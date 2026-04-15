using System.Net.Http.Json;
using book_service.Models;

namespace book_service.Services;

public class HardcoverClient
{
    private readonly HttpClient _http;
    public HardcoverClient(HttpClient http) => _http = http;

    public async Task<List<HardcoverBook>> GetBookByTitle(string title)
    {
        var query = new { 
            query = "query ($t: String!) { books(where: {title: {_eq: $t}}) { title cached_tags } }",
            variables = new { t = title }
        };

        var response = await _http.PostAsJsonAsync("", query);
        var result = await response.Content.ReadFromJsonAsync<GraphQLRoot>();
        return result?.Data?.Books ?? new List<HardcoverBook>();
    }
}