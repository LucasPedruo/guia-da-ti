using System.Text.Encodings.Web;
using System.Text.Json;

// Match the catalog's Prettier JSON contract without requiring Node on the API host.
public static class CatalogJson
{
    private static readonly JsonSerializerOptions Options = new(JsonSerializerDefaults.Web)
    {
        Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping
    };

    public static string Serialize(ContributionResource resource)
        => Format(JsonSerializer.SerializeToElement(resource, Options), 0, 0) + "\n";

    private static string Format(JsonElement value, int depth, int column)
    {
        var indent = new string(' ', depth * 2);
        var childIndent = indent + "  ";
        if (value.ValueKind == JsonValueKind.Object)
        {
            var properties = value.EnumerateObject().ToArray();
            if (properties.Length == 0) return "{}";
            return "{\n" + string.Join(",\n", properties.Select(property =>
            {
                var prefix = childIndent + JsonSerializer.Serialize(property.Name, Options) + ": ";
                return prefix + Format(property.Value, depth + 1, prefix.Length);
            })) + "\n" + indent + "}";
        }
        if (value.ValueKind == JsonValueKind.Array)
        {
            var items = value.EnumerateArray().ToArray();
            if (items.Length == 0) return "[]";
            if (items.All(item => item.ValueKind is not (JsonValueKind.Object or JsonValueKind.Array)))
            {
                var inline = "[" + string.Join(", ", items.Select(item => item.GetRawText())) + "]";
                if (column + inline.Length <= 80) return inline;
            }
            return "[\n" + string.Join(",\n", items.Select(item => childIndent + Format(item, depth + 1, childIndent.Length))) + "\n" + indent + "]";
        }
        return value.GetRawText();
    }
}
