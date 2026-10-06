using System.Net;
using Microsoft.Extensions.Configuration;

static class CreatorProfileChecks
{
    public static async Task Run()
    {
        static void Check(bool ok, string name) { if (!ok) throw new Exception(name); }
        foreach (var url in new[] { "http://youtube.com/@name", "https://localhost/@name",
            "https://youtube.com.evil.example/@name", "https://user@youtube.com/@name",
            "https://www.youtube.com/watch?v=test", "https://instagram.com/p/photo",
            "https://tiktok.com/video/123", "https://linkedin.com/feed", "https://x.com/home",
            "https://youtube.com:444/@name" })
            Check(CreatorProfiles.ParseLink(url) is null, "Reject non-profile or unsafe URL: " + url);
        foreach (var url in new[] { "https://youtube.com/@name", "https://youtube.com/channel/UC123",
            "https://instagram.com/ana", "https://tiktok.com/@ana", "https://linkedin.com/in/ana", "https://twitter.com/ana" })
            Check(CreatorProfiles.ParseLink(url) is not null, "Accept supported profile");
        Check(CreatorProfiles.SafeAvatar("https://images.evil.example/avatar.png") is null, "Reject arbitrary photo host");
        Check(CreatorProfiles.SafeAvatar("https://pbs.twimg.com/photo.jpg") is not null, "Allow platform CDN");
        var link = CreatorProfiles.ParseLink("https://instagram.com/ana")!;
        const string html = "<meta property='og:title' content='Ana &amp; Bia | Instagram'><meta content='12.5K Followers, Profile description' property='og:description'><meta property='og:image' content='https://scontent.cdninstagram.com/photo.jpg'>";
        var parsed = CreatorProfiles.FromHtml(link, html, DateTimeOffset.UtcNow);
        Check(parsed.Name == "Ana & Bia" && parsed.FollowersText == "12.5K" && parsed.Followers is null && parsed.AvatarUrl is not null, "Public metadata uses attributed count and decoded profile");
        try { CreatorProfiles.FromHtml(link, "<meta property='og:title' content='Login • Instagram'>", DateTimeOffset.UtcNow); throw new Exception("Accepted login page"); }
        catch (InvalidDataException) { }
        var handler = new ProfileHandler(html);
        var settings = new ConfigurationBuilder().Build();
        var profiles = new CreatorProfiles(new ProfileFactory(handler), settings, TimeProvider.System);
        await profiles.ResolveAsync(link, default);
        await profiles.ResolveAsync(link, default);
        Check(handler.Calls == 1, "Cache successful profile lookups");
        handler.Body = "";
        var other = CreatorProfiles.ParseLink("https://instagram.com/bia")!;
        for (var attempt = 0; attempt < 2; attempt++) {
            try { await profiles.ResolveAsync(other, default); throw new Exception("Accepted missing metadata"); }
            catch (InvalidDataException) { }
        }
        Check(handler.Calls == 3, "Failures can be retried");
        var apiSettings = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?> { ["YOUTUBE_API_KEY"] = "test-only-key" }).Build();
        handler.Body = """{"items":[{"snippet":{"title":"Canal da Ana","description":"Tecnologia","thumbnails":{"default":{"url":"https://yt3.ggpht.com/photo.jpg"}}},"statistics":{"hiddenSubscriberCount":false,"subscriberCount":"0"}}]}""";
        var channel = CreatorProfiles.ParseLink("https://youtube.com/@ana")!;
        var api = new CreatorProfiles(new ProfileFactory(handler), apiSettings, TimeProvider.System);
        Check((await api.ResolveAsync(channel, default)).Followers == 0, "Official zero is different from an unavailable count");
        handler.Body = handler.Body.Replace("false", "true");
        api = new CreatorProfiles(new ProfileFactory(handler), apiSettings, TimeProvider.System);
        Check((await api.ResolveAsync(channel, default)).Followers is null, "Hidden counts remain unavailable");
        Console.WriteLine("Creator profiles OK: URLs, metadata, photo hosts, public counts, cache and failures.");
    }
    sealed class ProfileFactory(ProfileHandler handler) : IHttpClientFactory
    {
        public HttpClient CreateClient(string name) => new(handler, disposeHandler: false);
    }
    sealed class ProfileHandler(string body) : HttpMessageHandler
    {
        public int Calls;
        public string Body = body;
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            Calls++;
            return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK) { Content = new StringContent(Body) });
        }
    }
}
