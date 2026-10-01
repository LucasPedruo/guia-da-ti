# Aplicação Guia da TI

React/TypeScript com Tailwind e shadcn/ui no frontend; ASP.NET Core 10 no backend. O build gera HTML para cada rota conhecida. A API oferece consultas paginadas sem banco de dados.

## Uso independente

Obtenha um `catalog.json` validado do repositório de dados. Configure `CATALOG_PATH` com seu caminho absoluto, instale dependências com `npm --prefix frontend ci` e execute `npm --prefix frontend run build`. Copie o conteúdo público de `frontend/dist` (excluindo `server/`) para `backend/GuiaDaTi.Api/wwwroot`. Execute `dotnet run --project backend/GuiaDaTi.Api --urls http://localhost:5080`.

O snapshot precisa permanecer disponível para a API na inicialização. A publicação deve substituir o diretório de arquivos públicos inteiro, evitando manter páginas removidas de builds anteriores. A automação de deploy será adicionada em uma fase posterior.
