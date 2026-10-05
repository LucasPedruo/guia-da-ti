using System.Net.Http.Headers;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Antiforgery;

public sealed class DiscussionWriter(IHttpClientFactory clients, IConfiguration configuration)
{
    private readonly string repository = configuration["DISCUSSIONS_REPOSITORY"] ?? "LucasPedruo/guia-da-ti-dados";
    public async Task<int> PublishAsync(string token, DiscussionDraft draft, CancellationToken cancellation)
    {
        if (!Regex.IsMatch(repository, @"^[A-Za-z0-9][A-Za-z0-9-]*/[A-Za-z0-9_.-]+$")) throw new DiscussionsUnavailableException();
        var metadata = await Query(token, """
            query($owner:String!,$name:String!,$number:Int!,$existing:Boolean!){
              repository(owner:$owner,name:$name){ id isPrivate hasDiscussionsEnabled
                discussionCategories(first:100){nodes{id}}
                discussion(number:$number) @include(if:$existing){id locked closed}
              }
            }
            """, new { owner = repository.Split('/')[0], name = repository.Split('/')[1], number = draft.Number ?? 0, existing = draft.Number is not null }, cancellation);
        var repo = metadata.GetProperty("repository");
        if (repo.ValueKind == JsonValueKind.Null || repo.GetProperty("isPrivate").GetBoolean()
            || !repo.GetProperty("hasDiscussionsEnabled").GetBoolean()) throw new DiscussionsUnavailableException();
        if (draft.Number is null) {
            if (!repo.GetProperty("discussionCategories").GetProperty("nodes").EnumerateArray().Any(c => c.GetProperty("id").GetString() == draft.CategoryId))
                throw new DiscussionWriteRejectedException("Escolha uma categoria válida.");
            var result = await Query(token, """
                mutation($input:CreateDiscussionInput!){createDiscussion(input:$input){discussion{number}}}
                """, new { input = new { repositoryId = repo.GetProperty("id").GetString(), categoryId = draft.CategoryId, title = draft.Title!.Trim(), body = draft.Body.Trim() } }, cancellation);
            return result.GetProperty("createDiscussion").GetProperty("discussion").GetProperty("number").GetInt32();
        }
        var discussion = repo.GetProperty("discussion");
        if (discussion.ValueKind == JsonValueKind.Null) throw new DiscussionWriteRejectedException("O tópico não foi encontrado.");
        if (discussion.GetProperty("locked").GetBoolean() || discussion.GetProperty("closed").GetBoolean()) throw new DiscussionWriteRejectedException("Este tópico está encerrado para novas mensagens.");
        var id = discussion.GetProperty("id").GetString();
        if (draft.ReplyToId is not null) {
            var commentData = await Query(token, """
                query($id:ID!){node(id:$id){... on DiscussionComment { isMinimized replyTo { id } discussion { id } }}}
                """, new { id = draft.ReplyToId }, cancellation);
            var comment = commentData.GetProperty("node");
            if (comment.ValueKind == JsonValueKind.Null || !comment.TryGetProperty("discussion", out var parent)
                || parent.GetProperty("id").GetString() != id || comment.GetProperty("isMinimized").GetBoolean()
                || comment.GetProperty("replyTo").ValueKind != JsonValueKind.Null)
                throw new DiscussionWriteRejectedException("Escolha um comentário válido deste tópico.");
        }
        await Query(token, """
            mutation($input:AddDiscussionCommentInput!){addDiscussionComment(input:$input){comment{id}}}
            """, new { input = new { discussionId = id, body = draft.Body.Trim(), replyToId = draft.ReplyToId } }, cancellation);
        return draft.Number.Value;
    }

    private async Task<JsonElement> Query(string token, string query, object variables, CancellationToken cancellation)
    {
        using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.github.com/graphql");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        request.Headers.UserAgent.ParseAdd("GuiaDaTi/1.0");
        request.Content = JsonContent.Create(new { query, variables });
        using var client = clients.CreateClient("discussions");
        using var response = await client.SendAsync(request, cancellation);
        response.EnsureSuccessStatusCode();
        using var document = JsonDocument.Parse(await response.Content.ReadAsStringAsync(cancellation));
        if (document.RootElement.TryGetProperty("errors", out _)) throw new DiscussionWriteRejectedException("O GitHub não autorizou a publicação. Confira suas permissões e tente novamente.");
        return document.RootElement.GetProperty("data").Clone();
    }
}

public record DiscussionDraft(string Body, string? Title = null, string? CategoryId = null, int? Number = null, string? ReplyToId = null);
public sealed class DiscussionWriteRejectedException(string message) : Exception(message);
public static class DiscussionWriteEndpoints
{
    public static void MapDiscussionWrites(this WebApplication app)
    {
        app.MapPost("/api/discussions/publish", async (DiscussionDraft draft, HttpContext context, IAntiforgery csrf, DiscussionWriter writer, DiscussionsClient reader) => {
            context.Response.Headers.CacheControl = "no-store";
            if (context.User.Identity?.IsAuthenticated != true) return Results.Unauthorized();
            try { await csrf.ValidateRequestAsync(context); }
            catch (AntiforgeryValidationException) { return Results.BadRequest(new { error = "Atualize a página e tente novamente." }); }
            if (string.IsNullOrWhiteSpace(draft.Body) || draft.Body.Length > 10000 || draft.Number is <= 0
                || draft.CategoryId?.Length > 200 || draft.ReplyToId?.Length > 200
                || (draft.Number is null && (string.IsNullOrWhiteSpace(draft.Title) || draft.Title.Length > 256 || string.IsNullOrWhiteSpace(draft.CategoryId) || draft.ReplyToId is not null)))
                return Results.BadRequest(new { error = "Preencha o texto e, para um novo tópico, o título e a categoria." });
            var token = await context.GetTokenAsync("access_token");
            if (string.IsNullOrEmpty(token)) return Results.Unauthorized();
            try {
                var number = await writer.PublishAsync(token, draft, context.RequestAborted);
                await reader.InvalidateAsync(context.RequestAborted);
                return Results.Ok(new { number });
            }
            catch (DiscussionWriteRejectedException error) { return Results.Json(new { error = error.Message }, statusCode: 403); }
            catch (Exception error) when (error is HttpRequestException or JsonException or DiscussionsUnavailableException or InvalidOperationException or KeyNotFoundException or OperationCanceledException) {
                return Results.Json(new { error = "Não foi possível confirmar a publicação. Confira o tópico no GitHub antes de tentar novamente." }, statusCode: 503);
            }
        }).WithMetadata(new Microsoft.AspNetCore.Mvc.RequestSizeLimitAttribute(65536));
    }
}
