# Guia da TI

Fundação do diretório colaborativo descrito em [guia.md.txt](guia.md.txt), usando **C#/.NET 10, React, TypeScript, Tailwind e shadcn/ui**.

- `web/`: aplicação, destinada a um repositório próprio.
- `database/`: dados públicos e validação, destinados a outro repositório.
- [Arquitetura](ARCHITECTURE.md) e [plano por fases](IMPLEMENTATION_PLAN.md).

Esta entrega implementa a fase inicial. O mapa, campos específicos de cada categoria e filtros avançados estão planejados; os cinco cadastros incluídos são **fictícios**. A publicação inicial reúne aplicação e dados em [LucasPedruo/guia-da-ti](https://github.com/LucasPedruo/guia-da-ti). A separação em dois repositórios fica preparada pela estrutura de pastas. Nenhum deploy foi realizado.

## Executar no PowerShell

Pré-requisitos: Node.js 22.12+ e SDK .NET 10.

```powershell
# Na raiz, instala dependências e valida os dados.
npm --prefix database ci
npm --prefix database run validate
npm --prefix database test
npm --prefix web/frontend ci

# Compila frontend, gera HTML e prepara os arquivos do servidor.
./scripts/build.ps1

# Abre o site completo em http://localhost:5080.
dotnet run --project web/backend/GuiaDaTi.Api --no-build --urls http://localhost:5080
```

Para trabalhar na interface com atualização automática:

```powershell
npm --prefix web/frontend run dev
```

O Vite informa o endereço local. A interface usa o snapshot gerado no build; execute novamente a validação dos dados e reinicie o Vite após alterar cadastros.

## Configuração

- `CATALOG_PATH`: caminho absoluto do `catalog.json` validado; deve ser o mesmo para frontend e backend.
- `SITE_URL`: origem canônica para geração de SEO; padrão `https://guiadati.com` (configuração não significa domínio publicado).
- `VITE_DATA_REPOSITORY`: URL do repositório real, por exemplo `https://github.com/ORGANIZACAO/REPOSITORIO`. Sem configuração, a página de contribuição explica que a publicação está em preparação.

As variáveis do frontend são lidas durante o build. Nunca coloque segredos em variáveis `VITE_*`.

## Verificação

```powershell
npm --prefix database run format:check
npm --prefix database test
./scripts/build.ps1
# Com o servidor em execução:
./scripts/smoke.ps1
```

Os workflows dentro de `database/.github` e `web/.github` passam a valer quando cada pasta for a raiz de seu próprio repositório. Eles ainda não são executados pelo GitHub Actions nesta estrutura unificada.

Validação local desta entrega: três testes de dados aprovados, formatação conferida, TypeScript e build de produção aprovados, 35 páginas pré-renderizadas e backend compilado sem avisos. O smoke HTTP passou para busca, acentos, páginas, metadados, sitemap, parâmetros inválidos e 404. A inspeção visual em navegador e os testes de interação permanecem na próxima fase; a responsividade e o tema foram implementados, mas ainda precisam dessa revisão visual.
