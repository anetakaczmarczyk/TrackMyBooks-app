using Dapper;
using System.Data;
using System.Text.Json;

public class JsonTypeHandler<T> : SqlMapper.TypeHandler<T>
{
    // Gdy zapisujesz do bazy (nieużywane w twoim przypadku, ale wymagane)
    public override void SetValue(IDbDataParameter parameter, T value)
    {
        parameter.Value = JsonSerializer.Serialize(value);
    }

    // Gdy czytasz z bazy (to jest to, czego potrzebujesz!)
    public override T Parse(object value)
    {
        if (value == null || value is DBNull) return default;
        
        // Postgres zwraca to jako string, deserializujemy go
        return JsonSerializer.Deserialize<T>(value.ToString()!);
    }
}