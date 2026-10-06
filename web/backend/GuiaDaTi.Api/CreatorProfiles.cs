using System.Net;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Caching.Memory;

public record CreatorLink(string Network, string Url, string Handle);
public record CreatorProfile(string Network, string Url, string Name, string Description,
    string? AvatarUrl, long? Followers, string? FollowersText, DateTimeOffset CheckedAt);

public sealed class CreatorProfiles(IHttpClientFactory clients, IConfiguration configuration, TimeProvider clock)
{
    private readonly MemoryCache cache = new(new MemoryCacheOptions { SizeLimit = 512 });
    private readonly SemaphoreSlim gate = new(1);
    public static CreatorLink? ParseLink(string? value)
    {
        if (value?.Length > 500 || !Uri.TryCreate(value, UriKind.Absolute, out var uri)
            || uri.Scheme != "https" || uri.Port != 443 || uri.UserInfo.Length != 0) return null;
        var network = uri.Host.ToLowerInvariant() switch {
            "youtube.com" or "www.youtube.com" or "m.youtube.com" => "youtube",
            "instagram.com" or "www.instagram.com" => "instagram",
            "tiktok.com" or "www.tiktok.com" => "tiktok",
            "linkedin.com" or "www.linkedin.com" => "linkedin",
            "x.com" or "www.x.com" or "twitter.com" or "www.twitter.com" => "twitter",
            _ => null
        };
        if (network is null) return null;
        var path = uri.AbsolutePath.Trim('/');
        var parts = path.Split('/');
        var handle = parts.Last();
        if (!Regex.IsMatch(handle, @"^@?[A-Za-z0-9_.~-]{1,100}$")) return null;
        var valid = network switch {
            "youtube" => parts.Length == 1 && handle.StartsWith('@')
                || parts.Length == 2 && parts[0] is "channel" or "user",
            "tiktok" => parts.Length == 1 && handle.StartsWith('@'),
            "linkedin" => parts.Length == 2 && parts[0] == "in",
            "instagram" => parts.Length == 1 && !handle.StartsWith('@') &&
                !new[] { "p", "reel", "reels", "stories", "explore", "accounts", "direct" }.Contains(handle.ToLowerInvariant()),
            "twitter" => parts.Length == 1 && Regex.IsMatch(handle, @"^[A-Za-z0-9_]{1,15}$") &&
                !new[] { "home", "search", "explore", "login", "intent", "settings", "i" }.Contains(handle.ToLowerInvariant()),
            _ => false
        };
        if (!valid) return null;
        var host = network switch { "youtube" => "www.youtube.com", "instagram" => "www.instagram.com",
            "tiktok" => "www.tiktok.com", "linkedin" => "www.linkedin.com", _ => "x.com" };
        return new(network, $"https://{host}/{path}", handle);
    }

    public static string? SafeAvatar(string? value)
    {
        if (value?.Length > 2000 || !Uri.TryCreate(value, UriKind.Absolute, out var uri)
            || uri.Scheme != "https" || uri.Port != 443 || uri.UserInfo.Length != 0) return null;
        string[] domains = ["googleusercontent.com", "ggpht.com", "cdninstagram.com", "fbcdn.net",
            "tiktokcdn.com", "tiktokcdn-us.com", "tiktokcdn-eu.com", "licdn.com", "twimg.com"];
        return domains.Any(domain => uri.Host == domain || uri.Host.EndsWith("." + domain, StringComparison.OrdinalIgnoreCase)) ? uri.AbsoluteUri : null;
    }

    public async Task<CreatorProfile> ResolveAsync(CreatorLink link, CancellationToken cancellation)
    {
        if (cache.TryGetValue(link.Url, out CreatorProfile? saved)) return saved!;
        await gate.WaitAsync(cancellation);
        try {
            if (cache.TryGetValue(link.Url, out saved)) return saved!;
            CreatorProfile? profile = null;
            try {
                if (link.Network == "youtube" && configuration["YOUTUBE_API_KEY"] is { Length: > 0 } key) {
                    var filter = link.Url.Contains("/channel/") ? "id" : link.Url.Contains("/user/") ? "forUsername" : "forHandle";
                    using var json = JsonDocument.Parse(await GetAsync($"https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&{filter}={Uri.EscapeDataString(link.Handle)}&key={Uri.EscapeDataString(key)}", cancellation));
                    var items = json.RootElement.GetProperty("items");
                    if (items.GetArrayLength() > 0) {
                        var item = items[0]; var snippet = item.GetProperty("snippet"); var stats = item.GetProperty("statistics");
                        long? count = stats.TryGetProperty("hiddenSubscriberCount", out var hidden) && hidden.GetBoolean() ? null :
                            stats.TryGetProperty("subscriberCount", out var total) && long.TryParse(total.GetString(), out var parsed) ? parsed : null;
                        profile = new(link.Network, link.Url, snippet.GetProperty("title").GetString()!, snippet.GetProperty("description").GetString() ?? "",
                            SafeAvatar(snippet.GetProperty("thumbnails").GetProperty("default").GetProperty("url").GetString()), count, null, clock.GetUtcNow());
                    }
                } else if (link.Network == "twitter" && configuration["X_BEARER_TOKEN"] is { Length: > 0 } token) {
                    using var json = JsonDocument.Parse(await GetAsync($"https://api.x.com/2/users/by/username/{Uri.EscapeDataString(link.Handle)}?user.fields=description,profile_image_url,public_metrics", cancellation, token));
                    var item = json.RootElement.GetProperty("data");
                    profile = new(link.Network, link.Url, item.GetProperty("name").GetString()!, item.TryGetProperty("description", out var bio) ? bio.GetString() ?? "" : "",
                        item.TryGetProperty("profile_image_url", out var photo) ? SafeAvatar(photo.GetString()) : null,
                        item.TryGetProperty("public_metrics", out var metrics) ? metrics.GetProperty("followers_count").GetInt64() : null, null, clock.GetUtcNow());
                }
            } catch (Exception ex) when (ex is HttpRequestException or JsonException or KeyNotFoundException || ex is OperationCanceledException && !cancellation.IsCancellationRequested) { }
            profile ??= FromHtml(link, await GetAsync(link.Url, cancellation), clock.GetUtcNow());
            cache.Set(link.Url, profile, new MemoryCacheEntryOptions { Size = 1, AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(30) });
            return profile;
        } finally { gate.Release(); }
    }

    private async Task<string> GetAsync(string url, CancellationToken cancellation, string? token = null)
    {
        using var request = new HttpRequestMessage(HttpMethod.Get, url);
        request.Headers.UserAgent.ParseAdd("GuiaDaTi/1.0");
        if (token is not null) request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        using var response = await clients.CreateClient("creator-profiles").SendAsync(request, HttpCompletionOption.ResponseHeadersRead, cancellation);
        response.EnsureSuccessStatusCode();
        if (response.Content.Headers.ContentLength > 2_000_000) throw new HttpRequestException("Perfil muito grande.");
        // The HttpClient timeout covers headers; this deadline also bounds streamed bodies.
        using var deadline = CancellationTokenSource.CreateLinkedTokenSource(cancellation);
        deadline.CancelAfter(TimeSpan.FromSeconds(8));
        await using var stream = await response.Content.ReadAsStreamAsync(deadline.Token);
        using var body = new MemoryStream();
        var buffer = new byte[8192];
        int read;
        while ((read = await stream.ReadAsync(buffer, deadline.Token)) > 0) {
            if (body.Length + read > 2_000_000) throw new HttpRequestException("Perfil muito grande.");
            await body.WriteAsync(buffer.AsMemory(0, read), deadline.Token);
        }
        return System.Text.Encoding.UTF8.GetString(body.ToArray());
    }

    public static CreatorProfile FromHtml(CreatorLink link, string html, DateTimeOffset checkedAt)
    {
        var metadata = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        foreach (Match tag in Regex.Matches(html, @"<meta\b[^>]{0,4096}>", RegexOptions.IgnoreCase, TimeSpan.FromMilliseconds(300))) {
            var attributes = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            foreach (Match attribute in Regex.Matches(tag.Value, """([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')""", RegexOptions.None, TimeSpan.FromMilliseconds(100)))
                attributes[attribute.Groups[1].Value] = WebUtility.HtmlDecode(attribute.Groups[2].Success ? attribute.Groups[2].Value : attribute.Groups[3].Value);
            if ((attributes.TryGetValue("property", out var name) || attributes.TryGetValue("name", out name)) && attributes.TryGetValue("content", out var content))
                metadata[name] = content;
        }
        var title = metadata.GetValueOrDefault("og:title") ?? metadata.GetValueOrDefault("twitter:title") ?? "";
        title = Regex.Replace(title, @"\s*[-|•]\s*(YouTube|Instagram|TikTok|LinkedIn|X|Twitter)\s*$", "", RegexOptions.IgnoreCase).Trim();
        if (title.Length < 2 || new[] { "YouTube", "Instagram", "TikTok", "LinkedIn", "X", "Twitter" }.Contains(title, StringComparer.OrdinalIgnoreCase)
            || Regex.IsMatch(title, @"log\s?in|sign\s?in|access denied|entrar", RegexOptions.IgnoreCase)) throw new InvalidDataException("Perfil indisponível.");
        var description = metadata.GetValueOrDefault("og:description") ?? metadata.GetValueOrDefault("description") ?? "";
        string? followersText = null;
        if (link.Network == "instagram") {
            var match = Regex.Match(description, @"^([0-9][0-9.,]*(?:\s*[kKmMbB]|\s*mil)?)\s+(?:followers|seguidores)\b", RegexOptions.IgnoreCase);
            if (match.Success) followersText = match.Groups[1].Value;
        }
        return new(link.Network, link.Url, title[..Math.Min(title.Length, 100)], description[..Math.Min(description.Length, 4000)],
            SafeAvatar(metadata.GetValueOrDefault("og:image") ?? metadata.GetValueOrDefault("twitter:image")), null, followersText, checkedAt);
    }
}

public static class CreatorProfileEndpoints
{
    public static void MapCreatorProfiles(this WebApplication app)
    {
        app.MapGet("/api/creators/profile", async (string? url, HttpContext context, CreatorProfiles profiles, Catalog catalog) => {
            var link = CreatorProfiles.ParseLink(url);
            if (link is null) return Results.BadRequest(new { error = "Use o link de um perfil do YouTube, Instagram, TikTok, LinkedIn ou X." });
            var listed = catalog.Resources.Any(resource => resource.Type is "creators" or "youtube"
                && CreatorProfiles.ParseLink(resource.Url)?.Url == link.Url);
            if (!listed && context.User.Identity?.IsAuthenticated != true) return Results.Unauthorized();
            context.Response.Headers.CacheControl = "no-store";
            try { return Results.Ok(await profiles.ResolveAsync(link, context.RequestAborted)); }
            catch (Exception ex) when (ex is HttpRequestException or JsonException or KeyNotFoundException or InvalidDataException or RegexMatchTimeoutException
                || ex is OperationCanceledException && !context.RequestAborted.IsCancellationRequested) {
                return Results.Json(new { error = "A rede não disponibilizou os dados desse perfil. Confira o link ou preencha os dados manualmente." }, statusCode: 503);
            }
        });
    }
}
