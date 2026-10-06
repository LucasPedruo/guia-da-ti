using System.Net.Http.Headers;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text.Json;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.OAuth;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.Extensions.Caching.Memory;

public static class CommunityAuth
{
    public static bool Enabled(IConfiguration config) => !string.IsNullOrWhiteSpace(config["GITHUB_CLIENT_ID"])
        && !string.IsNullOrWhiteSpace(config["GITHUB_CLIENT_SECRET"]);

    public static void AddCommunityAuth(this WebApplicationBuilder builder)
    {
        builder.Services.AddMemoryCache();
        builder.Services.AddSingleton<ServerTickets>();
        builder.Services.AddSingleton<RegisteredUsers>();
        builder.Services.AddAntiforgery(options => options.HeaderName = "X-CSRF-Token");
        var secure = builder.Environment.IsDevelopment() ? CookieSecurePolicy.SameAsRequest : CookieSecurePolicy.Always;
        var auth = builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
            .AddCookie(options => {
                options.Cookie.Name = "guia.session";
                options.Cookie.HttpOnly = true;
                options.Cookie.SameSite = SameSiteMode.Lax;
                options.Cookie.SecurePolicy = secure;
                options.ExpireTimeSpan = TimeSpan.FromHours(8);
                options.SlidingExpiration = false;
                options.Events.OnRedirectToLogin = context => { context.Response.StatusCode = 401; return Task.CompletedTask; };
                options.Events.OnSignedIn = context => RegisteredUsersEndpoints.RecordLoginAsync(context.HttpContext, context.Principal);
            });
        builder.Services.AddOptions<CookieAuthenticationOptions>(CookieAuthenticationDefaults.AuthenticationScheme)
            .Configure<ServerTickets>((options, tickets) => options.SessionStore = tickets);
        if (!Enabled(builder.Configuration)) return;
        auth.AddOAuth("GitHub", options => {
            options.ClientId = builder.Configuration["GITHUB_CLIENT_ID"]!;
            options.ClientSecret = builder.Configuration["GITHUB_CLIENT_SECRET"]!;
            options.CallbackPath = "/api/auth/callback";
            options.AuthorizationEndpoint = "https://github.com/login/oauth/authorize";
            options.TokenEndpoint = "https://github.com/login/oauth/access_token";
            options.UserInformationEndpoint = "https://api.github.com/user";
            options.Scope.Add("public_repo");
            options.UsePkce = true;
            options.SaveTokens = true;
            options.Events = new OAuthEvents {
                OnCreatingTicket = async context => {
                    using var request = new HttpRequestMessage(HttpMethod.Get, context.Options.UserInformationEndpoint);
                    request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", context.AccessToken);
                    request.Headers.UserAgent.ParseAdd("GuiaDaTi/1.0");
                    using var response = await context.Backchannel.SendAsync(request, context.HttpContext.RequestAborted);
                    response.EnsureSuccessStatusCode();
                    using var document = JsonDocument.Parse(await response.Content.ReadAsStringAsync(context.HttpContext.RequestAborted));
                    context.Identity!.AddClaim(new Claim(ClaimTypes.NameIdentifier, document.RootElement.GetProperty("id").ToString()));
                    context.Identity.AddClaim(new Claim(ClaimTypes.Name, document.RootElement.GetProperty("login").GetString()!));
                },
                OnRemoteFailure = context => {
                    context.HandleResponse();
                    context.Response.Redirect(context.Properties?.RedirectUri == "/auth/complete.html" ? "/auth/complete.html?login=failed" : "/?login=failed");
                    return Task.CompletedTask;
                }
            };
        });
    }

    public static void MapCommunityAuth(this WebApplication app)
    {
        app.MapGet("/api/auth/session", async (HttpContext context, IAntiforgery csrf, IConfiguration config) => {
            context.Response.Headers.CacheControl = "no-store";
            if (context.User.Identity?.IsAuthenticated == true) await RegisteredUsersEndpoints.RecordLoginAsync(context, context.User);
            return Results.Ok(new { enabled = Enabled(config), login = context.User.Identity?.IsAuthenticated == true ? context.User.Identity.Name : null,
                avatarUrl = context.User.Identity?.IsAuthenticated == true && long.TryParse(context.User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId)
                    ? $"https://avatars.githubusercontent.com/u/{userId}?s=80" : null,
                csrfToken = csrf.GetAndStoreTokens(context).RequestToken });
        });
        app.MapGet("/api/auth/login", (string? returnUrl, IConfiguration config) => {
            if (!Enabled(config)) return Results.Json(new { error = "Login em preparação." }, statusCode: 503);
            var local = returnUrl is not null && returnUrl.StartsWith('/') && !returnUrl.StartsWith("//")
                && !returnUrl.Contains('\\') && !returnUrl.Any(char.IsControl) && !returnUrl.StartsWith("/api", StringComparison.OrdinalIgnoreCase);
            return Results.Challenge(new AuthenticationProperties { RedirectUri = local ? returnUrl : "/" }, ["GitHub"]);
        });
        app.MapPost("/api/auth/logout", async (HttpContext context, IAntiforgery csrf) => {
            try { await csrf.ValidateRequestAsync(context); }
            catch (AntiforgeryValidationException) { return Results.BadRequest(new { error = "Atualize a página e tente novamente." }); }
            await context.SignOutAsync();
            return Results.NoContent();
        });
    }
}

// Only an opaque session ID reaches the browser. OAuth tokens remain in server memory.
public sealed class ServerTickets(IMemoryCache cache) : ITicketStore
{
    public Task<string> StoreAsync(AuthenticationTicket ticket) {
        var key = "auth:" + Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
        cache.Set(key, ticket, ticket.Properties.ExpiresUtc ?? DateTimeOffset.UtcNow.AddHours(8));
        return Task.FromResult(key);
    }
    public Task RenewAsync(string key, AuthenticationTicket ticket) { cache.Set(key, ticket, ticket.Properties.ExpiresUtc ?? DateTimeOffset.UtcNow.AddHours(8)); return Task.CompletedTask; }
    public Task<AuthenticationTicket?> RetrieveAsync(string key) => Task.FromResult(cache.Get<AuthenticationTicket>(key));
    public Task RemoveAsync(string key) { cache.Remove(key); return Task.CompletedTask; }
}
