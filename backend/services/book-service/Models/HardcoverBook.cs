namespace book_service.Models;
public class HardcoverBook
{
    public int Id { get; set; } = 0;
    public string Title { get; set; } = string.Empty;

    public List<ContributorContainer> Cached_Contributors { get; set; } = new();
    public ImageDetail Cached_Image { get; set; } = new();
    public string Description { get; set; } = string.Empty;
    public int Ratings_Count { get; set; } = 0;
    public Dictionary<string, List<TagDetail>> Cached_Tags { get; set; } = new();
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
}

public class ImageDetail
{
    public string Url { get; set; } = string.Empty;
}
public class GraphQLResponse
{
    public List<HardcoverBook>? Books { get; set; } = new();
}

public class GraphQLRoot { public GraphQLResponse? Data { get; set; } = new(); }