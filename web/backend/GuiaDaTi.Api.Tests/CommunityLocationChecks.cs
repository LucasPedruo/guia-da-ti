using System.Text.Json;

static class CommunityLocationChecks
{
    public static void Run()
    {
        CommunityLocationRules.ValidateContribution("communities", new("regional", ["SP", "RJ"]), ["discord"], "online");
        CommunityLocationRules.ValidateContribution("communities", new("national"), ["whatsapp", "telegram"], "hybrid");
        CommunityLocationRules.ValidateContribution("communities", new("international"), ["meetup"], "in-person");
        CommunityLocationRules.ValidateContribution("courses", null);
        foreach (var location in new CommunityLocation?[] { null, new("unknown"), new("regional"), new("regional", []),
            new("regional", ["XX"]), new("regional", ["SP", "SP"]), new("national", ["SP"]), new("international", []) }) {
            try { CommunityLocationRules.ValidateContribution("communities", location); throw new Exception("Accepted invalid community location"); }
            catch (ContributionRejectedException) { }
        }
        try { CommunityLocationRules.ValidateContribution("courses", new("national")); throw new Exception("Accepted community location for another type"); }
        catch (ContributionRejectedException) { }
        foreach (var (platforms,modality) in new (string[]?,string?)[] { (null,"online"),([],"online"),(["unknown"],"online"),(["discord","discord"],"online"),(["discord"],null),(["discord"],"unknown") }) {
            try { CommunityLocationRules.ValidateContribution("communities",new("national"),platforms,modality);throw new Exception("Accepted missing or invalid platforms or modality"); }
            catch(ContributionRejectedException) { }
        }
        var resource = new ContributionResource("test", "communities", "Test", "Description example", "Description example",
            "https://example.org/community", ["backend"], [], ["pt-BR"], "2026-10-06", CommunityLocation: new("regional", ["SP", "RJ"]), CommunityPlatforms:["discord","telegram"], CommunityModality:"hybrid");
        var options = new JsonSerializerOptions(JsonSerializerDefaults.Web);
        var restored = JsonSerializer.Deserialize<ContributionResource>(JsonSerializer.Serialize(resource, options), options)!;
        if (restored.ToDraft().CommunityLocation?.States?.SequenceEqual(["SP", "RJ"]) != true) throw new Exception("Lost location when approving a contribution");
        if(restored.ToDraft().CommunityPlatforms?.SequenceEqual(["discord","telegram"])!=true||restored.ToDraft().CommunityModality!="hybrid")throw new Exception("Lost platforms or modality when approving a contribution");
        Console.WriteLine("Community location OK: scopes, UFs, validation and contribution round trip.");
    }
}
