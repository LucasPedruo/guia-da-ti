using System.Globalization;
using System.Security.Claims;
using System.Text.Json;

// Small, single-instance persistent registry. Catalog content remains in GitHub.
public sealed class RegisteredUsers(IConfiguration configuration, IHostEnvironment environment, TimeProvider clock)
{
    private readonly string path = Path.GetFullPath(configuration["COMMUNITY_USERS_PATH"]
        ?? Path.Combine(environment.ContentRootPath, "App_Data", "community-users.json"));
    private readonly SemaphoreSlim gate = new(1, 1);
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public async Task RecordAsync(ClaimsPrincipal? user, CancellationToken cancellation = default)
    {
        if (user?.Identity?.IsAuthenticated != true || !long.TryParse(user.FindFirstValue(ClaimTypes.NameIdentifier),
            NumberStyles.None, CultureInfo.InvariantCulture, out var id) || id <= 0) return;
        await gate.WaitAsync(cancellation);
        try {
            var data = await ReadAsync(cancellation);
            if (data.GithubIds.Contains(id)) return;
            await WriteAsync(data with { GithubIds = [.. data.GithubIds, id] }, cancellation);
        }
        finally { gate.Release(); }
    }

    public async Task<RegisteredUsersSummary> SummaryAsync(CancellationToken cancellation = default)
    {
        await gate.WaitAsync(cancellation);
        try {
            var data = await ReadAsync(cancellation);
            return new(data.GithubIds.Length, data.TrackingSince);
        }
        finally { gate.Release(); }
    }

    private async Task<Registry> ReadAsync(CancellationToken cancellation)
    {
        if (!File.Exists(path)) {
            var empty = new Registry(1, clock.GetUtcNow(), []);
            await WriteAsync(empty, cancellation);
            return empty;
        }
        await using var stream = File.OpenRead(path);
        var data = await JsonSerializer.DeserializeAsync<Registry>(stream, JsonOptions, cancellation);
        if (data is null || data.Version != 1 || data.TrackingSince == default || data.GithubIds is null
            || data.GithubIds.Any(id => id <= 0) || data.GithubIds.Distinct().Count() != data.GithubIds.Length)
            throw new InvalidDataException("Registro de contas inválido.");
        return data;
    }

    private async Task WriteAsync(Registry data, CancellationToken cancellation)
    {
        var folder = Path.GetDirectoryName(path)!;
        Directory.CreateDirectory(folder);
        var temporary = Path.Combine(folder, $".{Path.GetFileName(path)}.{Guid.NewGuid():N}.tmp");
        try {
            await using (var stream = new FileStream(temporary, FileMode.CreateNew, FileAccess.Write, FileShare.None)) {
                await JsonSerializer.SerializeAsync(stream, data, JsonOptions, cancellation);
                await stream.FlushAsync(cancellation);
                stream.Flush(flushToDisk: true);
            }
            File.Move(temporary, path, overwrite: true);
        }
        finally { if (File.Exists(temporary)) File.Delete(temporary); }
    }

    private sealed record Registry(int Version, DateTimeOffset TrackingSince, long[] GithubIds);
}

public record RegisteredUsersSummary(int RegisteredUsers, DateTimeOffset TrackingSince);

public static class RegisteredUsersEndpoints
{
    public static void MapRegisteredUsers(this WebApplication app) => app.MapGet("/api/community/users", async (
        HttpContext context, RegisteredUsers users, ILogger<RegisteredUsers> logger) => {
        context.Response.Headers.CacheControl = "no-store";
        try { return Results.Ok(await users.SummaryAsync(context.RequestAborted)); }
        catch (Exception error) when (error is IOException or UnauthorizedAccessException or JsonException) {
            logger.LogError("Não foi possível consultar o registro persistente de contas.");
            return Results.Json(new { error = "Não foi possível carregar o total de contas." }, statusCode: 503);
        }
    });

    public static async Task RecordLoginAsync(HttpContext context, ClaimsPrincipal? user)
    {
        try { await context.RequestServices.GetRequiredService<RegisteredUsers>().RecordAsync(user, context.RequestAborted); }
        catch (Exception error) when (error is IOException or UnauthorizedAccessException or JsonException) {
            // A metrics storage outage must not prevent people from participating.
            context.RequestServices.GetRequiredService<ILogger<RegisteredUsers>>()
                .LogError("Não foi possível registrar a conta no total persistente de logins.");
        }
    }
}
