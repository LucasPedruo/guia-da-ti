static class ActivityChecks
{
    public static void Run()
    {
        var clock = new ActivityClock();
        var activity = new CommunityActivity(clock);
        Assert(activity.Count() == 0, "Anonymous reads do not create users");
        Assert(activity.Count("1") == 1 && activity.Count("1") == 1, "Same anonymous browser counts once across tabs");
        clock.Advance(TimeSpan.FromMinutes(4));
        Assert(activity.Count("2") == 2, "Different anonymous browsers count separately");
        Assert(activity.Count("1") == 2, "Activity refreshes the five-minute window");
        clock.Advance(TimeSpan.FromMinutes(4));
        Assert(activity.Count() == 2, "Refreshed visitors remain active");
        clock.Advance(TimeSpan.FromMinutes(1));
        Assert(activity.Count() == 0, "Presence expires exactly at five minutes");
        Parallel.For(0, 100, index => activity.Count((index % 10).ToString()));
        Assert(activity.Count() == 10, "Concurrent presence updates preserve unique visitors");
        Assert(new CommunityActivity(clock).Count() == 0, "A new application instance starts empty");
        Console.WriteLine("Activity OK: anonymous reads, unique visitors, refresh, expiration and concurrency.");
    }
    private static void Assert(bool condition, string message) { if (!condition) throw new Exception(message); }
    private sealed class ActivityClock : TimeProvider
    {
        private DateTimeOffset now = DateTimeOffset.Parse("2026-10-05T12:00:00Z");
        public override DateTimeOffset GetUtcNow() => now;
        public void Advance(TimeSpan elapsed) => now += elapsed;
    }
}
