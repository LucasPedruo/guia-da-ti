using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

static class RegisteredUserChecks
{
    public static async Task Run()
    {
        var folder = Path.Combine(Path.GetTempPath(), "guia-users-tests-" + Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(folder);
        try {
            var path = Path.Combine(folder, "users.json");
            var config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?> { ["COMMUNITY_USERS_PATH"] = path }).Build();
            var environment = new TestEnvironment { ContentRootPath = folder };
            var users = new RegisteredUsers(config, environment, TimeProvider.System);
            await users.RecordAsync(new ClaimsPrincipal(new ClaimsIdentity([new Claim(ClaimTypes.NameIdentifier, "1")])));
            await users.RecordAsync(Account("not-a-github-id", "invalid"));
            Assert((await users.SummaryAsync()).RegisteredUsers == 0, "Anonymous and malformed identities never count");
            await users.RecordAsync(Account("123", "original-name"));
            await users.RecordAsync(Account("123", "renamed-account"));
            Assert((await users.SummaryAsync()).RegisteredUsers == 1, "Same stable GitHub ID counts once despite rename or relogin");
            await Task.WhenAll(Enumerable.Range(0, 30).Select(index => users.RecordAsync(Account((200 + index % 5).ToString(), "other"))));
            var before = await users.SummaryAsync();
            Assert(before.RegisteredUsers == 6, "Concurrent first logins do not lose or duplicate accounts");
            var restarted = new RegisteredUsers(config, environment, TimeProvider.System);
            Assert(await restarted.SummaryAsync() == before, "Count and tracking start survive an application restart");
            var stored = await File.ReadAllTextAsync(path);
            Assert(!stored.Contains("original-name") && !stored.Contains("renamed-account") && !stored.Contains("private-test-token"), "Registry excludes names and credentials");
            await File.WriteAllTextAsync(path, "broken-registry");
            var rejected = false;
            try { await restarted.RecordAsync(Account("999", "new")); }
            catch (JsonException) { rejected = true; }
            Assert(rejected && await File.ReadAllTextAsync(path) == "broken-registry", "Corruption is reported without replacing historical data");

            await AuthChecks(Path.Combine(folder, "auth.json"));
            Console.WriteLine("Registered users OK: anonymous exclusion, ID deduplication, rename, concurrency, persistence, corrupt-file protection and real sign-in hook.");
        }
        finally {
            if (!Path.GetFullPath(folder).StartsWith(Path.GetFullPath(Path.GetTempPath()), StringComparison.OrdinalIgnoreCase)) throw new InvalidOperationException("Invalid test cleanup path.");
            Directory.Delete(folder, recursive: true);
        }
    }

    private static ClaimsPrincipal Account(string id, string name) => new(new ClaimsIdentity([
        new Claim(ClaimTypes.NameIdentifier, id), new Claim(ClaimTypes.Name, name)
    ], CookieAuthenticationDefaults.AuthenticationScheme));

    private static async Task AuthChecks(string path)
    {
        var builder = WebApplication.CreateBuilder(new WebApplicationOptions { EnvironmentName = Environments.Development });
        builder.Configuration.Sources.Clear();
        builder.Configuration.AddInMemoryCollection(new Dictionary<string, string?> { ["COMMUNITY_USERS_PATH"] = path, ["AUTH_STORAGE_PATH"] = Path.Combine(Path.GetDirectoryName(path)!, "auth") });
        builder.Logging.ClearProviders();
        builder.Services.AddSingleton(TimeProvider.System);
        builder.AddCommunityAuth();
        builder.WebHost.UseSetting("urls", "http://127.0.0.1:0");
        await using var app = builder.Build();
        app.UseAuthentication();
        app.MapRegisteredUsers();
        app.MapCommunityAuth();
        // Test-only sign-in endpoint: production authenticates identities through GitHub OAuth.
        app.MapGet("/test/sign-in", async (Microsoft.AspNetCore.Http.HttpContext context) => {
            await context.SignInAsync(Account("777", "test-account"));
        });
        await app.StartAsync();
        try {
            using var client = new HttpClient { BaseAddress = new Uri(app.Urls.Single()) };
            var empty = await client.GetStringAsync("/api/community/users");
            Assert(JsonDocument.Parse(empty).RootElement.GetProperty("registeredUsers").GetInt32() == 0, "Public count reads never create logged-in users");
            (await client.GetAsync("/test/sign-in")).EnsureSuccessStatusCode();
            (await client.GetAsync("/api/auth/session")).EnsureSuccessStatusCode();
            (await client.GetAsync("/test/sign-in")).EnsureSuccessStatusCode();
            using var response = await client.GetAsync("/api/community/users");
            using var summary = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
            Assert(summary.RootElement.GetProperty("registeredUsers").GetInt32() == 1, "Successful sign-in and session refresh count only once");
            Assert(summary.RootElement.EnumerateObject().Select(item => item.Name).Order().SequenceEqual(new[] { "registeredUsers", "trackingSince" }), "Public endpoint exposes only aggregates");
            Assert(response.Headers.CacheControl?.NoStore == true, "Counts are never cached by the browser");
            await File.WriteAllTextAsync(path, "broken-registry");
            (await client.GetAsync("/test/sign-in")).EnsureSuccessStatusCode();
            using var unavailable = await client.GetAsync("/api/community/users");
            Assert(unavailable.StatusCode == System.Net.HttpStatusCode.ServiceUnavailable, "Storage failure preserves login and reports an unavailable count");
            Assert(await File.ReadAllTextAsync(path) == "broken-registry", "Failed login metrics never reset the registry");
        }
        finally { await app.StopAsync(); }
    }

    private static void Assert(bool value, string message) { if (!value) throw new Exception(message); }
    private sealed class TestEnvironment : IHostEnvironment
    {
        public string EnvironmentName { get; set; } = Environments.Development;
        public string ApplicationName { get; set; } = "RegisteredUserChecks";
        public string ContentRootPath { get; set; } = "";
        public Microsoft.Extensions.FileProviders.IFileProvider ContentRootFileProvider { get; set; } = new Microsoft.Extensions.FileProviders.NullFileProvider();
    }
}
