using System.Net.Http.Json;
using book_service.Models;

namespace book_service.Services;

// Klient HTTP odpowiedzialny za integrację z zewnętrznym API społecznościowego serwisu książkowego Hardcover.io
// Komunikacja opiera się na standardzie GraphQL, gdzie wysyłamy zapytania POST z ładunkiem JSON definiującym strukturę żądanych danych
public class HardcoverClient
{
    private readonly HttpClient _http;
    public HardcoverClient(HttpClient http) => _http = http;

    // Pobiera listę książek z paginacją, odrzucając pozycje posiadające mniej niż 5 ocen
    public async Task<List<HardcoverBook>> GetBooks(int startNumber, int itemsPerPage)
    {
        // GraphQL pozwala zdefiniować dokładnie te pola, których potrzebujemy
        var query = new { 
            query = "query GetBooks($startNumber: Int!, $itemsPerPage: Int!) { books(offset: $startNumber, order_by: {rating: desc} limit: $itemsPerPage, where: {ratings_count: {_gt: 5} } ) {default_physical_edition_id release_date cached_image title description cached_tags contributions {author {name}} rating pages ratings_count}}",
            variables = new { startNumber, itemsPerPage }
        };

        var response = await _http.PostAsJsonAsync("", query);
        
        // Deserializacja generycznego wyniku opakowanego w strukturę GraphQLRoot
        var result = await response.Content.ReadFromJsonAsync<GraphQLRoot>();
        return result?.Data?.Books ?? new List<HardcoverBook>();
    }

    // Pobiera bardzo szczegółowe, mocno zagnieżdżone dane o konkretnym wydaniu książki
    public async Task<List<BookById>> GetBookById(int bookId)
    {
        // Złożona struktura zapytania: pobiera m.in. całą serię wydawniczą (book_series), sortuje książki w serii 
        // chronologicznie/pozycyjnie oraz pobiera biografie i zdjęcia autorów
        var query = new { 
            query = "query GetBookById($bookId: Int!) { editions(where: {id: {_eq: $bookId}}) { isbn_10 isbn_13 language {language} book  {default_physical_edition_id title cached_tags cached_image pages release_date rating ratings_count description book_series { series { name books_count book_series(distinct_on: position, order_by: [{position: asc}, {book: {users_count: desc}}], where: {book: {canonical_id: {_is_null: true}, is_partial_book: {_eq: false}}, compilation: {_eq: false}}) { position book { default_physical_edition_id title } } } } } publisher{name} contributions {author {name bio image{url}}} }}",
            variables = new { bookId }
        };

        var response = await _http.PostAsJsonAsync("", query);
        var result = await response.Content.ReadFromJsonAsync<GraphQLRoot>();
        return result?.Data?.Editions ?? new List<BookById>();
    }

    // Pobiera bazową pulę (domyślnie 40 pozycji) najlepiej ocenianych książek, z których później silnik rekomendacji wybiera najlepsze dopasowania
    public async Task<List<HardcoverBook>> GetRecommendations(int limit = 40)
    {
        var query = new { 
            query = "query GetRecommendations($limit: Int!) { books(order_by: {rating: desc}, limit: $limit, where: {ratings_count: {_gt: 5} }) { default_physical_edition_id release_date cached_image title description cached_tags contributions {author {name}} rating pages ratings_count}}",
            variables = new { limit }
        };

        var response = await _http.PostAsJsonAsync("", query);
        var result = await response.Content.ReadFromJsonAsync<GraphQLRoot>();
        return result?.Data?.Books ?? new List<HardcoverBook>();
    }
    // 1. Popularne teraz (Trending)
    public async Task<List<HardcoverBook>> GetTrendingBooks()
    {
        var query = new { 
            query = @"query GetTrending { 
                books(order_by: {ratings_count: desc}, limit: 20, where: {ratings_count: {_gt: 100}, default_physical_edition_id: {_is_null: false}}) { 
                    default_physical_edition_id title cached_image rating contributions {author {name}} 
                } 
            }",
            variables = new { }
        };
        var response = await _http.PostAsJsonAsync("", query);
        var result = await response.Content.ReadFromJsonAsync<GraphQLRoot>();
        return result?.Data?.Books ?? new List<HardcoverBook>();
    }

    // 2. Nowości (New Releases)
    public async Task<List<HardcoverBook>> GetNewReleases()
    {
        var query = new { 
            query = @"query GetNew { 
                books(order_by: {release_date: desc}, limit: 20, where: {release_date: {_is_null: false}, default_physical_edition_id: {_is_null: false}}) { 
                    default_physical_edition_id title cached_image release_date contributions {author {name}} 
                } 
            }",
            variables = new { }
        };
        var response = await _http.PostAsJsonAsync("", query);
        var result = await response.Content.ReadFromJsonAsync<GraphQLRoot>();
        return result?.Data?.Books ?? new List<HardcoverBook>();
    }
}