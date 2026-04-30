using System.Text.Json.Serialization;

namespace book_service.Models;
public class HardcoverBook
{

    [JsonPropertyName("default_physical_edition_id")]
    public int? Id { get; set; } = 0;
    public string Title { get; set; } = string.Empty;

    public List<ContributorContainer> Contributions { get; set; } = new();
    public ImageDetail Cached_Image { get; set; } = new();
    public string Description { get; set; } = string.Empty;
    public double Rating { get; set; } = 0.0;
    public int Ratings_Count { get; set; } = 0;
    public int? Pages {get; set;} = 0;
    public string Release_Date { get; set; } = string.Empty;
    public Dictionary<string, List<TagDetail>> Cached_Tags { get; set; } = new();
}

public class BookById
{
    public string Isbn_10 { get; set; } = string.Empty;
    public string Isbn_13 { get; set; } = string.Empty;
    public LanguageDetail Language { get; set; } = new();
    public BookDetail Book { get; set; } = new();
    public List<ContributorContainer> Contributions { get; set; } = new();
    public PublisherDetail Publisher { get; set; } = new();

}

public class BookDetail
{
    [JsonPropertyName("default_cover_edition_id")]
    public int Id { get; set; } = 0;
    public string Title { get; set; } = string.Empty;
    public ImageDetail Cached_Image { get; set; } = new();
    public string Description { get; set; } = string.Empty;
    public double Rating { get; set; } = 0.0;
    public int Ratings_Count { get; set; } = 0;
    public int? Pages {get; set;} = 0;
    public Dictionary<string, List<TagDetail>> Cached_Tags { get; set; } = new();
    public string Release_Date { get; set; } = string.Empty;
    public List<BookSeriesContainer?> Book_Series { get; set; } = new();
    public PublisherDetail Publisher { get; set; } = new();
    public List<ContributorContainer> Contributions { get; set; } = new();
}

public class PublisherDetail
{
    public string Name { get; set; } = string.Empty;
}
public class BookSeriesContainer
{
    public SeriesDetail Series { get; set; } = new();
}

public class SeriesDetail
{
    public string Name { get; set; } = string.Empty;
    public int Books_Count { get; set; } = 0;
    public List<BookInSeriesContainer> Book_Series { get; set; } = new();
}

public class BookInSeriesContainer
{
    public int Position { get; set; } = 0;
    public BookDetail Book { get; set; } = new();
}

public class LanguageDetail
{
    public string Language { get; set; } = string.Empty;
}
public class TagDetail
{
    public string Tag { get; set; } = string.Empty;
}

public class ContributorContainer
{
    public AuthorData Author { get; set; } = new();
}

public class AuthorData
{
    public string Name { get; set; } = string.Empty;
    public string Bio { get; set; } = string.Empty;
    public ImageDetail Image { get; set; } = new();
}

public class ImageDetail
{
    public string Url { get; set; } = string.Empty;
}
public class GraphQLResponse
{
    public List<HardcoverBook>? Books { get; set; } = new();
    public List<BookById>? Editions { get; set; } = new();

}

public class GraphQLRoot { public GraphQLResponse? Data { get; set; } = new(); }