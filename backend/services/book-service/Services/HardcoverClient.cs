using System.Net.Http.Json;
using book_service.Models;

namespace book_service.Services;

public class HardcoverClient
{
    private readonly HttpClient _http;
    public HardcoverClient(HttpClient http) => _http = http;

    public async Task<List<HardcoverBook>> GetBooks(int startNumber, int itemsPerPage)
    {
        var query = new { 
            query = "query GetBooks($startNumber: Int!, $itemsPerPage: Int!) { books(offset: $startNumber, order_by: {rating: desc} limit: $itemsPerPage, where: {ratings_count: {_gt: 5} } ) {default_physical_edition_id release_date cached_image title description cached_tags contributions {author {name}} rating pages ratings_count}}",
            variables = new { startNumber, itemsPerPage }
        };

        var response = await _http.PostAsJsonAsync("", query);
        // var rawJson = await response.Content.ReadAsStringAsync();
        // Console.WriteLine($"DEBUG: Odpowiedź z API: {rawJson}");
        var result = await response.Content.ReadFromJsonAsync<GraphQLRoot>();
        return result?.Data?.Books ?? new List<HardcoverBook>();
    }

        public async Task<List<BookById>> GetBookById(int bookId)
    {
        var query = new { 
            query = "query GetBookById($bookId: Int!) { editions(where: {id: {_eq: $bookId}}) { isbn_10 isbn_13 language {language} book  {default_physical_edition_id title cached_tags cached_image pages release_date rating ratings_count description book_series {series {name}}} publisher{name} contributions {author {name bio image{url}}} }}",
            variables = new { bookId }
        };

        var response = await _http.PostAsJsonAsync("", query);
        var result = await response.Content.ReadFromJsonAsync<GraphQLRoot>();
        return result?.Data?.Editions ?? new List<BookById>();
    }
}