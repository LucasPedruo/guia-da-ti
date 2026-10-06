using System.Net;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;

static class CatalogProposalChecks
{
    public static async Task Run()
    {
        var catalog = new Catalog(1, new(["geral"], [], ["pt-BR"], ["creators", "youtube", "communities", "courses"]), []);
        var settings = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?> {
            ["DISCUSSIONS_REPOSITORY"] = "example/catalog", ["DISCUSSIONS_TOKEN"] = "read-only-token"
        }).Build();
        foreach (var type in new[] { "creators", "youtube", "communities" }) {
            foreach (var mode in new[] { "existing-fork", "new-fork", "maintainer" }) {
                using var handler = new ProposalGitHub { Mode = mode };
                var service = new ContributionService(new ProposalFactory(handler), settings);
                var draft = new ContributionDraft(type, "Novo cadastro", "https://example.org/new", "Um resumo do cadastro", "Uma descrição do cadastro", ["geral"], [], ["pt-BR"],
                    CommunityLocation: type == "communities" ? new("national") : null,
                    CommunityPlatforms: type == "communities" ? ["discord"] : null, CommunityModality: type == "communities" ? "online" : null);
                var result = await service.Submit("user-token", draft, catalog, default);
                Check(result.Kind == "catalog" && result.Number is null && result.Url == "https://github.com/example/catalog/pull/10", "Catalog review result");
                Check(handler.Discussions == 0, "No forum operation for creator/community");
                Check(handler.UserTokenOnly, "Uses visitor credentials exclusively");
                Check(handler.Forks == (mode == "new-fork" ? 1 : 0), "Reuse fork or write as maintainer");
                Check(handler.FileTarget == $"/repos/{(mode == "maintainer" ? "example" : "ana")}/catalog/contents/data/{type}/novo-cadastro.json", "Catalog file target");
                Check(handler.Resource.GetProperty("type").GetString() == type && handler.Resource.GetProperty("areas")[0].GetString() == "geral", "Preserve validated resource");
                Check(handler.PullHead.StartsWith(mode == "maintainer" ? "example:contributions/" : "ana:contributions/"), "Open upstream PR from writable branch");
                if (type == "communities") Check(handler.Resource.GetProperty("communityLocation").GetProperty("scope").GetString() == "national"
                    && handler.Resource.GetProperty("communityPlatforms")[0].GetString() == "discord", "Preserve community metadata");
            }
        }
        foreach (var mode in new[] { "wrong-fork", "private" }) {
            using var handler = new ProposalGitHub { Mode = mode };
            var service = new ContributionService(new ProposalFactory(handler), settings);
            try { await service.Submit("user-token", new("creators", "Novo cadastro", "https://example.org/new", "Um resumo do cadastro", "Uma descrição do cadastro", ["geral"], [], ["pt-BR"]), catalog, default); throw new Exception("Accepted invalid target"); }
            catch (ContributionRejectedException) { }
            Check(handler.FileTarget == "" && handler.Writes == 0, "No writes to private or unrelated repository");
        }
        using (var handler = new ProposalGitHub()) {
            var service = new ContributionService(new ProposalFactory(handler), settings);
            var result = await service.Submit("user-token", new("courses", "Novo curso", "https://example.org/course", "Um resumo do curso", "Uma descrição do curso", ["geral"], [], ["pt-BR"]), catalog, default);
            Check(result.Kind == "discussion" && result.Number == 8 && handler.FileTarget == "", "Other suggestions keep forum flow");
        }
        Console.WriteLine("Catalog proposals OK: creators, YouTube and communities bypass the forum; visitor credentials, forks, permissions, metadata and other suggestions verified.");
    }
    static void Check(bool condition, string name) { if (!condition) throw new Exception(name); }
}

sealed class ProposalFactory(ProposalGitHub handler) : IHttpClientFactory
{ public HttpClient CreateClient(string name) => new(handler, false); }
sealed class ProposalGitHub : HttpMessageHandler
{
    public string Mode = "existing-fork", FileTarget = "", PullHead = "";
    public int Forks, Discussions, Writes;
    public bool UserTokenOnly = true;
    public JsonElement Resource;
    protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellation)
    {
        UserTokenOnly &= request.Headers.Authorization?.Parameter == "user-token";
        var path = request.RequestUri!.AbsolutePath;
        if (request.Method != HttpMethod.Get) Writes++;
        if (path == "/graphql") {
            Discussions++;
            using var body = JsonDocument.Parse(await request.Content!.ReadAsStringAsync(cancellation));
            return Response(body.RootElement.GetProperty("query").GetString()!.Contains("mutation")
                ? new { data = new { createDiscussion = new { discussion = new { number = 8 } } } }
                : (object)new { data = new { repository = new { id = "repo", isPrivate = false, hasDiscussionsEnabled = true, discussionCategories = new { nodes = new[] { new { id = "ideas", name = "Ideias" } } } } } });
        }
        if (path == "/repos/example/catalog" && request.Method == HttpMethod.Get)
            return Response(new { @private = Mode == "private", default_branch = "main", permissions = new { push = Mode == "maintainer" } });
        if (path == "/user") return Response(new { login = "ana" });
        if (path == "/repos/ana/catalog") {
            if (Mode == "new-fork" && Forks == 0) return new(HttpStatusCode.NotFound);
            return Response(new { @private = false, fork = true, source = new { full_name = Mode == "wrong-fork" ? "other/catalog" : "example/catalog" } });
        }
        if (path == "/repos/example/catalog/forks") { Forks++; return Response(new { full_name = "ana/catalog" }, HttpStatusCode.Accepted); }
        if (path.Contains("/git/ref/heads/")) return Response(new { @object = new { sha = "upstream-sha" } });
        if (path.EndsWith("/git/refs")) {
            using var payload = JsonDocument.Parse(await request.Content!.ReadAsStringAsync(cancellation));
            if (payload.RootElement.GetProperty("sha").GetString() != "upstream-sha") throw new Exception("Fork branch does not start from current upstream");
            return Response(new { }, HttpStatusCode.Created);
        }
        if (path.Contains("/contents/data/")) {
            FileTarget = path;
            using var payload = JsonDocument.Parse(await request.Content!.ReadAsStringAsync(cancellation));
            using var content = JsonDocument.Parse(Encoding.UTF8.GetString(Convert.FromBase64String(payload.RootElement.GetProperty("content").GetString()!)));
            Resource = content.RootElement.Clone();
            return Response(new { }, HttpStatusCode.Created);
        }
        if (path == "/repos/example/catalog/pulls") {
            using var payload = JsonDocument.Parse(await request.Content!.ReadAsStringAsync(cancellation));
            PullHead = payload.RootElement.GetProperty("head").GetString()!;
            return Response(new { html_url = "https://github.com/example/catalog/pull/10" }, HttpStatusCode.Created);
        }
        throw new Exception("Unexpected GitHub request: " + request.Method + " " + path);
    }
    static HttpResponseMessage Response(object body, HttpStatusCode status = HttpStatusCode.OK)
        => new(status) { Content = new StringContent(JsonSerializer.Serialize(body)) };
}
