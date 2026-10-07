using System.Text.Json;

static class CommunityLocationChecks
{
    public static void Run()
    {
        CommunityLocationRules.ValidateContribution("communities", new("regional", ["SP", "RJ"]), ["discord"], "online", "general", [new("discord","https://discord.gg/example")]);
        CommunityLocationRules.ValidateContribution("communities", new("national"), ["whatsapp", "telegram"], "hybrid", "female", [new("whatsapp","https://chat.whatsapp.com/example"),new("telegram","https://t.me/example")]);
        CommunityLocationRules.ValidateContribution("communities", new("international"), ["meetup"], "in-person", "lgbt", [new("meetup","https://www.meetup.com/example/")]);
        CommunityLocationRules.ValidateContribution("courses", null);
        foreach(var members in new CommunityMembers[]{new(-1,"2026-10-07"),new(4000,"2099-01-01"),new(4000,"2026-02-30")}) {
            try{CommunityLocationRules.ValidateContribution("communities",new("national"),["website"],"online","general",[new("website","https://example.org")],members);throw new Exception("Accepted invalid member count");}
            catch(ContributionRejectedException){}
        }
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
        foreach (var audience in new string?[] {null,"unknown"}) {
            try { CommunityLocationRules.ValidateContribution("communities",new("national"),["discord"],"online",audience,[new("discord","https://discord.gg/example")]);throw new Exception("Accepted invalid audience"); }
            catch(ContributionRejectedException) { }
        }
        foreach (var links in new CommunityLink[]?[] {null,[],[new("telegram","https://t.me/example")],[new("discord","http://example.org")],[new("discord","https://127.0.0.1/test")],[new("discord","https://private.internal/test")],[new("discord","https://user:password@example.org")],[new("discord","https://example.org:444/test")]}) {
            try { CommunityLocationRules.ValidateContribution("communities",new("national"),["discord"],"online","male",links);throw new Exception("Accepted invalid platform links"); }
            catch(ContributionRejectedException) { }
        }
        var resource = new ContributionResource("test", "communities", "Test", "Description example", "Description example",
            "https://example.org/community", ["backend"], [], ["pt-BR"], "2026-10-06", CommunityLocation: new("regional", ["SP", "RJ"]), CommunityPlatforms:["discord","telegram"], CommunityModality:"hybrid", CommunityAudience:"female", CommunityLinks:[new("discord","https://discord.gg/example"),new("telegram","https://t.me/example")],CommunityMembers:new(4000,"2026-10-07",true));
        var options = new JsonSerializerOptions(JsonSerializerDefaults.Web);
        var restored = JsonSerializer.Deserialize<ContributionResource>(JsonSerializer.Serialize(resource, options), options)!;
        if (restored.ToDraft().CommunityLocation?.States?.SequenceEqual(["SP", "RJ"]) != true) throw new Exception("Lost location when approving a contribution");
        if(restored.ToDraft().CommunityPlatforms?.SequenceEqual(["discord","telegram"])!=true||restored.ToDraft().CommunityModality!="hybrid")throw new Exception("Lost platforms or modality when approving a contribution");
        if(restored.ToDraft().CommunityAudience!="female" || restored.ToDraft().CommunityLinks?.SequenceEqual(resource.CommunityLinks!)!=true)throw new Exception("Lost audience or platform links");
        if(restored.ToDraft().CommunityMembers!=resource.CommunityMembers)throw new Exception("Lost community member count");
        Console.WriteLine("Community location OK: scopes, UFs, validation and contribution round trip.");
    }
}
