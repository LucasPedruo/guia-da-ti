using System.Net;
using System.Text.Json;
using Microsoft.Extensions.Configuration;

static class ContributorChecks
{
    public static async Task Run()
    {
        var handler = new ContributorGitHub();
        var config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?> {
            ["GITHUB_APP_REPOSITORY"] = "example/app", ["DISCUSSIONS_REPOSITORY"] = "example/data"
        }).Build();
        using var client = new ContributorsClient(new ContributorFactory(handler), config);
        var people = await client.ListAsync(default);
        Assert(people.Length == 2, "Deduplicate people and omit bots");
        Assert(people[0].Name == "ana" && people[0].Contributions == 5, "Sum contributions across repositories");
        Assert(people[0].AvatarUrl == "https://avatars.githubusercontent.com/u/1?s=80", "Avatar derived from verified GitHub user ID");
        Assert(people[1].Name == "bia" && people[1].Url == "https://github.com/bia", "Follow next-page link");
        var count = handler.Calls;
        await client.ListAsync(default);
        Assert(count == handler.Calls, "Cache avoids duplicate requests");
        foreach (var mode in new[] { "private-app", "missing-app" }) {
            handler.Mode = mode;
            using var publicOnly = new ContributorsClient(new ContributorFactory(handler), config);
            var visible = await publicOnly.ListAsync(default);
            Assert(visible.Length == 1 && visible[0].Name == "ana" && visible[0].Contributions == 2, $"Keep public data when application is {mode}");
        }
        foreach (var mode in new[] { "private", "rate-limit" }) {
            handler.Mode = mode;
            using var rejected = new ContributorsClient(new ContributorFactory(handler), config);
            var failed = false;
            try { await rejected.ListAsync(default); } catch (DiscussionsUnavailableException) { failed = true; }
            Assert(failed, $"Reject {mode}");
        }
        Console.WriteLine("Contributors OK: two repositories, pagination, deduplication, bot exclusion, cache and public-only data.");
    }
    static void Assert(bool value, string name) { if (!value) throw new Exception(name); }
}
sealed class ContributorFactory(ContributorGitHub handler) : IHttpClientFactory { public HttpClient CreateClient(string name) => new(handler, false); }
sealed class ContributorGitHub : HttpMessageHandler
{
    public string Mode = "ready";
    public int Calls;
    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellation)
    {
        Calls++;
        if (Mode == "rate-limit") return Task.FromResult(new HttpResponseMessage(HttpStatusCode.Forbidden));
        var url = request.RequestUri!.ToString();
        var listing = url.Contains("/contributors");
        var page2 = url.Contains("page=2");
        var app = url.Contains("/example/app");
        if (app && Mode == "missing-app") return Task.FromResult(new HttpResponseMessage(HttpStatusCode.NotFound));
        if (app && listing && Mode == "private-app") throw new Exception("Must not query private contributors");
        object body = !listing ? new { @private = Mode == "private" || (app && Mode == "private-app") } : page2
            ? new[] { new { id = 2, login = "bia", contributions = 1, type = "User" } }
            : app ? new[] { new { id = 1, login = "ana", contributions = 3, type = "User" }, new { id = 3, login = "bot", contributions = 20, type = "Bot" } }
            : new[] { new { id = 1, login = "ana", contributions = 2, type = "User" } };
        var response = new HttpResponseMessage(HttpStatusCode.OK) { Content = new StringContent(JsonSerializer.Serialize(body)) };
        if (listing && app && !page2) response.Headers.Add("Link", "<https://api.github.com/repos/example/app/contributors?per_page=100&page=2>; rel=\"next\"");
        return Task.FromResult(response);
    }
}
