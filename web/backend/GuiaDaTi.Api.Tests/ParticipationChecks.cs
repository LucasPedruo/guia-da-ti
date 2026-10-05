using System.Net;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using System.Security.Claims;

static class ParticipationChecks
{
    public static async Task Run()
    {
        var handler = new WriteGitHub();
        var settings = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?> { ["DISCUSSIONS_REPOSITORY"] = "example/community", ["DISCUSSIONS_TOKEN"] = "read-only-token" }).Build();
        var writer = new DiscussionWriter(new WriteFactory(handler), settings);
        var topic = new DiscussionDraft(" Texto ", " Título ", "category-1");
        Assert(await writer.PublishAsync("user-token", topic, default) == 8, "Create topic");
        Assert(handler.LastInput.GetProperty("repositoryId").GetString() == "repo-1", "Repository derived server-side");
        Assert(handler.LastInput.GetProperty("title").GetString() == "Título", "Title trimming");
        await writer.PublishAsync("user-token", new("Comentário", Number: 7), default);
        Assert(handler.LastInput.GetProperty("discussionId").GetString() == "thread-7", "Comment uses selected topic");
        await writer.PublishAsync("user-token", new("Resposta", Number: 7, ReplyToId: "comment-1"), default);
        Assert(handler.LastInput.GetProperty("replyToId").GetString() == "comment-1", "Reply uses parent comment");
        Assert(handler.UserTokenOnly, "Every request uses visitor credential");
        foreach (var mode in new[] { "private", "disabled", "locked", "closed", "missing", "foreign-reply", "hidden-reply", "nested-reply", "denied" }) {
            handler.Mode = mode;
            var before = handler.Mutations;
            var rejected = false;
            try { await writer.PublishAsync("user-token", new("Resposta", Number: 7, ReplyToId: "comment-1"), default); }
            catch (Exception error) when (error is DiscussionWriteRejectedException or DiscussionsUnavailableException) { rejected = true; }
            Assert(rejected, $"Reject {mode}");
            Assert(handler.Mutations == before, $"No mutation for {mode}");
        }
        handler.Mode = "ready";
        var invalidCategory = false;
        try { await writer.PublishAsync("user-token", topic with { CategoryId = "foreign-category" }, default); }
        catch (DiscussionWriteRejectedException) { invalidCategory = true; }
        Assert(invalidCategory, "Reject category outside repository");
        using var memory = new MemoryCache(new MemoryCacheOptions());
        var tickets = new ServerTickets(memory);
        var properties = new AuthenticationProperties { ExpiresUtc = DateTimeOffset.UtcNow.AddMinutes(5) };
        properties.StoreTokens([new AuthenticationToken { Name = "access_token", Value = "user-token" }]);
        var ticket = new AuthenticationTicket(new ClaimsPrincipal(new ClaimsIdentity([new Claim(ClaimTypes.Name, "member")], "test")), properties, CookieAuthenticationDefaults.AuthenticationScheme);
        var key = await tickets.StoreAsync(ticket);
        Assert(!key.Contains("user-token"), "Opaque browser session");
        Assert((await tickets.RetrieveAsync(key))?.Properties.GetTokenValue("access_token") == "user-token", "Token stored on server");
        await tickets.RemoveAsync(key);
        Assert(await tickets.RetrieveAsync(key) is null, "Logout removes server credential");
        Console.WriteLine("Participation OK: visitor credentials, topics, comments, replies, permissions, repository boundaries, locked topics and server sessions.");
    }
    static void Assert(bool value, string name) { if (!value) throw new Exception(name); }
}

sealed class WriteFactory(WriteGitHub handler) : IHttpClientFactory { public HttpClient CreateClient(string name) => new(handler, false); }
sealed class WriteGitHub : HttpMessageHandler
{
    public string Mode = "ready";
    public bool UserTokenOnly = true;
    public int Mutations;
    public JsonElement LastInput;
    protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellation)
    {
        UserTokenOnly &= request.Headers.Authorization?.Parameter == "user-token";
        using var payload = JsonDocument.Parse(await request.Content!.ReadAsStringAsync(cancellation));
        var query = payload.RootElement.GetProperty("query").GetString()!;
        object data;
        if (query.Contains("mutation")) {
            Mutations++;
            LastInput = payload.RootElement.GetProperty("variables").GetProperty("input").Clone();
            data = query.Contains("createDiscussion") ? new { createDiscussion = new { discussion = new { number = 8 } } } : (object)new { addDiscussionComment = new { comment = new { id = "new-comment" } } };
        } else if (query.Contains("node(id:")) {
            data = new { node = new { isMinimized = Mode == "hidden-reply", replyTo = Mode == "nested-reply" ? new { id = "root" } : null, discussion = new { id = Mode == "foreign-reply" ? "foreign-thread" : "thread-7" } } };
        } else {
            data = new { repository = new { id = "repo-1", isPrivate = Mode == "private", hasDiscussionsEnabled = Mode != "disabled", discussionCategories = new { nodes = new[] { new { id = "category-1" } } }, discussion = Mode == "missing" ? null : new { id = "thread-7", locked = Mode == "locked", closed = Mode == "closed" } } };
        }
        var body = Mode == "denied" ? "{\"errors\":[{\"message\":\"sensitive upstream detail\"}]}" : JsonSerializer.Serialize(new { data });
        return new(HttpStatusCode.OK) { Content = new StringContent(body) };
    }
}
