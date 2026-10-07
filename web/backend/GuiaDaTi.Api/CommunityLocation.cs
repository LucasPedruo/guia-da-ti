using System.Text.RegularExpressions;

public record CommunityLocation(string Scope, string[]? States = null);
public record CommunityLink(string Platform, string Url);
public record CommunityMembers(int Count, string CheckedAt, bool MoreThan = false);

public static class CommunityLocationRules
{
    public static readonly string[] States = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
        "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];

    public static readonly string[] Platforms = ["whatsapp","telegram","discord","slack","facebook","linkedin","meetup","reddit","github","discourse","circle","mighty-networks","website","other"];
    public static readonly string[] Audiences = ["general", "male", "female", "lgbt"];
    public static void ValidateContribution(string type, CommunityLocation? location, string[]? platforms = null, string? modality = null, string? audience = null, CommunityLink[]? links = null, CommunityMembers? members = null)
    {
        if (type != "communities") {
            if (location is not null || platforms is not null || modality is not null || audience is not null || links is not null || members is not null) throw new ContributionRejectedException("Os dados de comunidade estão disponíveis apenas para comunidades.");
            return;
        }
        if (location is null || location.Scope is not ("regional" or "national" or "international"))
            throw new ContributionRejectedException("Escolha o alcance regional, nacional ou internacional da comunidade.");
        if (location.Scope == "regional") {
            if (location.States is null || location.States.Length is < 1 or > 27
                || location.States.Distinct().Count() != location.States.Length || location.States.Any(uf => !States.Contains(uf)))
                throw new ContributionRejectedException("Selecione estados válidos para a comunidade regional.");
        } else if (location.States is not null)
            throw new ContributionRejectedException("Estados são usados apenas nas comunidades regionais.");
        if (modality is not ("online" or "in-person" or "hybrid"))
            throw new ContributionRejectedException("Escolha a modalidade online, presencial ou híbrida.");
        if (platforms is null || platforms.Length is < 1 or > 14 || platforms.Distinct().Count() != platforms.Length || platforms.Any(id=>!Platforms.Contains(id)))
            throw new ContributionRejectedException("Selecione pelo menos uma plataforma válida para a comunidade.");
        if (audience is null || !Audiences.Contains(audience))
            throw new ContributionRejectedException("Escolha o público da comunidade.");
        if (links is null || links.Length != platforms.Length || links.Any(link=>link is null)
            || links.Select(link=>link.Platform).Distinct().Count()!=links.Length || links.Any(link=>!platforms.Contains(link.Platform)))
            throw new ContributionRejectedException("Informe um link para cada plataforma selecionada.");
        foreach (var link in links) {
            if (string.IsNullOrWhiteSpace(link.Url) || link.Url.Length>500 || !Uri.TryCreate(link.Url,UriKind.Absolute,out var uri)
                || uri.Scheme!="https" || !uri.IsDefaultPort || !string.IsNullOrEmpty(uri.UserInfo) || !uri.Host.Contains('.')
                || Regex.IsMatch(uri.Host,@"(^localhost$|\.local$|\.localhost$|\.internal$|^[\d.]+$|:)",RegexOptions.IgnoreCase))
                throw new ContributionRejectedException("Os links das plataformas devem ser públicos e começar com https://.");
        }
        if (members is not null && (members.Count<0
            || !DateOnly.TryParseExact(members.CheckedAt,"yyyy-MM-dd",System.Globalization.CultureInfo.InvariantCulture,System.Globalization.DateTimeStyles.None,out var checkedAt)
            || checkedAt>DateOnly.FromDateTime(DateTime.UtcNow)))
            throw new ContributionRejectedException("Informe uma quantidade de membros válida e a data da contagem.");
    }
}
