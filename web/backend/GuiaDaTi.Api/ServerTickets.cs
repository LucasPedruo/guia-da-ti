using System.Security.Cryptography;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.DataProtection;

// The browser receives an opaque ID. Visitor credentials remain encrypted on the server.
// A single process owns this store. Deployments must preserve both sessions and the key ring.
public sealed class ServerTickets : ITicketStore
{
    private readonly string folder;
    private readonly IDataProtector protector;
    private readonly TimeProvider clock;
    private readonly object gate = new();

    public static string StoragePath(IConfiguration configuration, IHostEnvironment environment) =>
        Path.GetFullPath(configuration["AUTH_STORAGE_PATH"] ?? Path.Combine(environment.ContentRootPath, "App_Data", "auth"));

    internal static DirectoryInfo CreatePrivateDirectory(string path) => OperatingSystem.IsWindows()
        ? Directory.CreateDirectory(path)
        : Directory.CreateDirectory(path, UnixFileMode.UserRead | UnixFileMode.UserWrite | UnixFileMode.UserExecute);

    public ServerTickets(IConfiguration configuration, IHostEnvironment environment, IDataProtectionProvider protection, TimeProvider clock)
    {
        folder = Path.Combine(StoragePath(configuration, environment), "sessions");
        CreatePrivateDirectory(folder);
        protector = protection.CreateProtector("GuiaDaTi.ServerTickets.v1");
        this.clock = clock;
    }

    private string? TicketPath(string key) => key.Length == 64 && key.All(Uri.IsHexDigit)
        ? Path.Combine(folder, key + ".ticket") : null;

    public Task<string> StoreAsync(AuthenticationTicket ticket)
    {
        var key = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
        lock (gate) Write(TicketPath(key)!, ticket);
        return Task.FromResult(key);
    }

    public Task RenewAsync(string key, AuthenticationTicket ticket)
    {
        lock (gate) {
            // A renewal already in flight must not restore a session removed by logout.
            if (TicketPath(key) is { } path && File.Exists(path)) Write(path, ticket);
        }
        return Task.CompletedTask;
    }

    public Task<AuthenticationTicket?> RetrieveAsync(string key)
    {
        lock (gate) {
            var path = TicketPath(key);
            if (path is null || !File.Exists(path)) return Task.FromResult<AuthenticationTicket?>(null);
            AuthenticationTicket? ticket;
            try { ticket = TicketSerializer.Default.Deserialize(protector.Unprotect(File.ReadAllBytes(path))); }
            catch (CryptographicException) { ticket = null; }
            if (ticket?.Properties.ExpiresUtc is not { } expires || expires <= clock.GetUtcNow()) {
                File.Delete(path);
                ticket = null;
            }
            return Task.FromResult(ticket);
        }
    }

    public Task RemoveAsync(string key)
    {
        lock (gate) { if (TicketPath(key) is { } path) File.Delete(path); }
        return Task.CompletedTask;
    }

    private void Write(string path, AuthenticationTicket ticket)
    {
        ticket.Properties.ExpiresUtc ??= clock.GetUtcNow().AddDays(7);
        var temporary = path + "." + Guid.NewGuid().ToString("N") + ".tmp";
        try {
            File.WriteAllBytes(temporary, protector.Protect(TicketSerializer.Default.Serialize(ticket)));
            File.Move(temporary, path, overwrite: true);
        }
        finally { if (File.Exists(temporary)) File.Delete(temporary); }
    }
}
