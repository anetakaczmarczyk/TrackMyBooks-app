namespace book_service.Models;

public class HardcoverBook
{
    public string Title { get; set; } = string.Empty;
    public Dictionary<string, List<TagDetail>> Cached_Tags { get; set; } = new();
}

public class TagDetail
{
    public string Tag { get; set; } = string.Empty;
}

public class GraphQLResponse
{
    public List<HardcoverBook>? Books { get; set; } = new();
}

public class GraphQLRoot { public GraphQLResponse? Data { get; set; } = new(); }