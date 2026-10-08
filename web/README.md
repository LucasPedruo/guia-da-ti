# Aplicação Guia da TI

React/TypeScript com Tailwind e shadcn/ui no frontend. ASP.NET Core 10 no backend. O build gera HTML para cada rota conhecida. A API oferece consultas paginadas sem banco de dados.

## Uso independente

Prefira o fluxo do README raiz, que inicializa o submódulo e valida os dados com `tools/catalog`. Para usar esta pasta isoladamente, obtenha um snapshot validado e configure `CATALOG_PATH` com seu caminho absoluto. Instale dependências com `npm --prefix frontend ci` e execute `npm --prefix frontend run build`. Copie o conteúdo público de `frontend/dist` (excluindo `server/`) para `backend/GuiaDaTi.Api/wwwroot`. Execute `dotnet run --project backend/GuiaDaTi.Api --urls http://localhost:5080`.

O snapshot precisa permanecer disponível para a API na inicialização. A publicação deve substituir todo o diretório de arquivos públicos. Isso remove páginas que não existem mais no build. A automação de deploy será adicionada em uma fase posterior.
