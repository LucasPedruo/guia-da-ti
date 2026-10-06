public static class CreatorCategoryRules
{
    public static readonly string[] Ids = ["education", "career", "humor", "lifestyle", "news", "reviews", "projects", "other"];

    public static void ValidateContribution(string type, string[]? categories)
    {
        if (type is not ("creators" or "youtube")) {
            if (categories is not null) throw new ContributionRejectedException("Categorias de conteúdo são exclusivas dos criadores.");
            return;
        }
        if (categories is null || categories.Length is < 1 or > 8 || categories.Distinct().Count() != categories.Length || categories.Any(id => !Ids.Contains(id)))
            throw new ContributionRejectedException("Escolha pelo menos uma categoria de conteúdo disponível para o criador.");
    }
}
