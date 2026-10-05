using System.Net.Http.Headers;
using System.Text.Json;
using System.Text.RegularExpressions;

public sealed class ContributorsClient(IHttpClientFactory clients, IConfiguration configuration) : IDisposable
{
    private readonly SemaphoreSlim gate = new(1, 1);
    private Contributor[]? cached;
    private DateTimeOffset expires;
    private readonly string[] repositories = new[] {
        configuration["GITHUB_APP_REPOSITORY"] ?? "LucasPedruo/guia-da-ti",
        configuration["DISCUSSIONS_REPOSITORY"] ?? "LucasPedruo/guia-da-ti-dados"
    }.Distinct(StringComparer.OrdinalIgnoreCase).ToArray();

    public async Task<Contributor[]> ListAsync(CancellationToken cancellation)
    {
        await gate.WaitAsync(cancellation);
        try {
            if (cached is not null && expires > DateTimeOffset.UtcNow) return cached;
            var people = new Dictionary<long, Contributor>();
            foreach (var repository in repositories) {
                if (!Regex.IsMatch(repository, @"^[A-Za-z0-9][A-Za-z0-9-]*/[A-Za-z0-9_.-]+$")) throw new DiscussionsUnavailableException();
                // A server credential must never make private repository membership public.
                using var metadataResponse = await GetAsync($"repos/{repository}", cancellation);
                using var metadata = JsonDocument.Parse(await metadataResponse.Content.ReadAsStringAsync(cancellation));
                if (metadata.RootElement.GetProperty("private").GetBoolean()) throw new DiscussionsUnavailableException();
                for (var page = 1; ; page++) {
                    if (page > 100) throw new DiscussionsUnavailableException();
                    using var response = await GetAsync($"repos/{repository}/contributors?per_page=100&page={page}", cancellation);
                    if (response.StatusCode == System.Net.HttpStatusCode.NoContent) break;
                    using var document = JsonDocument.Parse(await response.Content.ReadAsStringAsync(cancellation));
                    foreach (var item in document.RootElement.EnumerateArray()) {
                        if (item.GetProperty("type").GetString() != "User") continue;
                        var login = item.GetProperty("login").GetString()!;
                        if (!Regex.IsMatch(login, @"^[A-Za-z0-9][A-Za-z0-9-]*$")) continue;
                        var id = item.GetProperty("id").GetInt64();
                        var count = item.GetProperty("contributions").GetInt32();
                        people[id] = new(login, $"https://github.com/{login}", count + (people.TryGetValue(id, out var previous) ? previous.Contributions : 0));
                    }
                    if (!response.Headers.TryGetValues("Link", out var links) || !links.Any(link => link.Contains("rel=\"next\""))) break;
                }
            }
            cached = people.Values.OrderByDescending(person => person.Contributions).ThenBy(person => person.Name, StringComparer.OrdinalIgnoreCase).ToArray();
            expires = DateTimeOffset.UtcNow.AddHours(1);
            return cached;
        }
        finally { gate.Release(); }
    }
    private async Task<HttpResponseMessage> GetAsync(string path, CancellationToken cancellation)
    {
        using var request = new HttpRequestMessage(HttpMethod.Get, $"https://api.github.com/{path}");
        request.Headers.UserAgent.ParseAdd("GuiaDaTi/1.0");
        request.Headers.Accept.ParseAdd("application/vnd.github+json");
        var token = configuration["DISCUSSIONS_TOKEN"];
        if (!string.IsNullOrWhiteSpace(token)) request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        using var client = clients.CreateClient("discussions");
        var response = await client.SendAsync(request, cancellation);
        if (!response.IsSuccessStatusCode) { response.Dispose(); throw new DiscussionsUnavailableException(); }
        return response;
    }
    public void Dispose() => gate.Dispose();
}
public record Contributor(string Name, string Url, int Contributions);
public static class ContributorEndpoints
{
    public static void MapContributors(this WebApplication app) => app.MapGet("/api/contributors", async (ContributorsClient client, CancellationToken cancellation) => {
        try { return Results.Ok(new { items = await client.ListAsync(cancellation) }); }
        catch (Exception error) when (error is HttpRequestException or JsonException or DiscussionsUnavailableException or InvalidOperationException or KeyNotFoundException or OperationCanceledException) {
            return Results.Json(new { error = "Não foi possível carregar os contribuidores do GitHub. Tente novamente." }, statusCode: 503);
        }
    });
}
