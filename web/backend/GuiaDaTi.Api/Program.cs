using System.Globalization;
using System.Text;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);
var catalogPath = Path.GetFullPath(builder.Configuration["CATALOG_PATH"]
    ?? Path.Combine(builder.Environment.ContentRootPath, "../../..", "tools/catalog/dist/catalog.json"));
var json = await File.ReadAllTextAsync(catalogPath);
var catalog = JsonSerializer.Deserialize<Catalog>(json, new JsonSerializerOptions(JsonSerializerDefaults.Web))
    ?? throw new InvalidDataException("Catálogo ausente. Execute a validação dos dados.");
if (catalog.Version != 1) throw new InvalidDataException("Versão de catálogo incompatível.");
builder.Services.AddSingleton(catalog);
builder.Services.AddHttpClient("discussions", client => client.Timeout = TimeSpan.FromSeconds(10));
builder.Services.AddSingleton<DiscussionsClient>();
builder.Services.AddSingleton<DiscussionWriter>();
builder.Services.AddSingleton<ContributorsClient>();
builder.AddCommunityAuth();
var app = builder.Build();
app.Use(async (context, next) => {
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    context.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
    // Radix menus/selects use inline positioning and scroll-lock styles. Scripts remain self-only.
    context.Response.Headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'";
    await next();
});
app.UseDefaultFiles();
app.UseStaticFiles();
app.UseRouting();
app.UseAuthentication();
app.MapCommunityAuth();
app.MapDiscussionWrites();
app.MapDiscussions();
app.MapContributors();
app.MapGet("/health", () => Results.Ok(new { status = "ok", resources = catalog.Resources.Length }));
app.MapGet("/api/resources", (string? q, string? type, int? page, int? pageSize) => {
    if (q?.Length > 200 || page is < 1 || pageSize is < 1 or > 100) return Results.BadRequest(new { error = "Parâmetros inválidos." });
    var tokens = Normalize(q ?? "").Split(' ', StringSplitOptions.RemoveEmptyEntries);
    var filtered = catalog.Resources.Where(r => (string.IsNullOrEmpty(type) || r.Type == type)
        && tokens.All(token => Normalize(string.Join(' ', new[] { r.Name, r.Summary, r.Description }.Concat(r.Areas).Concat(r.Technologies).Concat(r.Languages).Concat(r.Countries ?? []))).Contains(token))).ToArray();
    var current = page ?? 1; var size = pageSize ?? 24;
    return Results.Ok(new { total = filtered.Length, page = current, pageSize = size, items = filtered.Skip((int)Math.Min((long)(current - 1) * size, int.MaxValue)).Take(size) });
});
app.MapGet("/api/resources/{type}/{slug}", (string type, string slug) => {
    var resource = catalog.Resources.FirstOrDefault(r => r.Type == type && r.Slug == slug);
    return resource is null ? Results.NotFound() : Results.Ok(resource);
});
app.MapFallback(async context => {
    context.Response.StatusCode = 404;
    var notFound = Path.Combine(app.Environment.WebRootPath ?? Path.Combine(app.Environment.ContentRootPath, "wwwroot"), "404/index.html");
    if (File.Exists(notFound)) { context.Response.ContentType = "text/html; charset=utf-8"; await context.Response.SendFileAsync(notFound); }
});
app.Run();

static string Normalize(string value) => string.Concat(value.Normalize(NormalizationForm.FormD)
    .Where(c => CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)).ToLowerInvariant();

record Catalog(int Version, Resource[] Resources);
record Resource(string Slug, string Type, string Name, string Summary, string Description, string Url,
    string[] Areas, string[] Technologies, string[] Languages, string UpdatedAt, bool Demo, string[]? Countries = null);
