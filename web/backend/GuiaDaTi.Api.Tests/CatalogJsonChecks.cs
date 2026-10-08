using System.Text.Json;

static class CatalogJsonChecks
{
    public static void Run()
    {
        var resource = new ContributionResource("test", "communities", "Comunidade ação", "Um resumo válido", "Aspas \"texto\", linha\nseguinte e <link>",
            "https://example.org/", ["geral"], [], ["pt-BR"], "2026-10-08", CommunityLocation: new("regional", ["SP", "RJ"]),
            CommunityPlatforms: ["discord", "website"], CommunityLinks: [new("discord", "https://discord.gg/test")]);
        var serialized = CatalogJson.Serialize(resource);
        Check(serialized.Contains("\"areas\": [\"geral\"]") && serialized.Contains("\"states\": [\"SP\", \"RJ\"]"), "Inline short catalog arrays");
        Check(serialized.Contains("ação") && serialized.Contains("<link>") && serialized.EndsWith('\n'), "Readable Unicode and final newline");
        var restored = JsonSerializer.Deserialize<ContributionResource>(serialized, new JsonSerializerOptions(JsonSerializerDefaults.Web));
        Check(restored?.Description == resource.Description && restored.CommunityLinks![0].Url == resource.CommunityLinks![0].Url, "Preserve escaped text and nested links");
        var longArray = CatalogJson.Serialize(resource with { Areas = [new string('a', 60), new string('b', 60)] });
        Check(longArray.Contains("\"areas\": [\n    \""), "Wrap long catalog arrays");
        var output = Environment.GetEnvironmentVariable("CATALOG_FORMAT_CHECK_OUTPUT");
        if (!string.IsNullOrEmpty(output))
        {
            Directory.CreateDirectory(output);
            File.WriteAllText(Path.Combine(output, "community.json"), serialized);
            File.WriteAllText(Path.Combine(output, "long-array.json"), longArray);
        }
        Console.WriteLine("Catalog JSON checks passed.");
    }
    private static void Check(bool passed, string message) { if (!passed) throw new Exception(message); }
}
