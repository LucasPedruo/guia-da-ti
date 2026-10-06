public record CommunityLocation(string Scope, string[]? States = null);

public static class CommunityLocationRules
{
    public static readonly string[] States = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
        "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];

    public static readonly string[] Platforms = ["whatsapp","telegram","discord","slack","facebook","linkedin","meetup","reddit","github","discourse","circle","mighty-networks","website","other"];
    public static void ValidateContribution(string type, CommunityLocation? location, string[]? platforms = null, string? modality = null)
    {
        if (type != "communities") {
            if (location is not null || platforms is not null || modality is not null) throw new ContributionRejectedException("Os dados de comunidade estão disponíveis apenas para comunidades.");
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
    }
}
