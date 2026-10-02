# Guia da TI

Diretório colaborativo com **C#/.NET 10, React, TypeScript, Tailwind e shadcn/ui**.

- [guia-da-ti](https://github.com/LucasPedruo/guia-da-ti): aplicação e integração.
- [guia-da-ti-dados](https://github.com/LucasPedruo/guia-da-ti-dados): catálogo público e contribuições.

`database/` é um **submódulo Git**, fixado em um commit do repositório de dados. Envie contribuições de conteúdo para aquele repositório.

## Executar

Requer Node.js 22.12+ e SDK .NET 10.

```powershell
git clone --recurse-submodules https://github.com/LucasPedruo/guia-da-ti.git
cd guia-da-ti
# Se o clone já existia:
git submodule update --init database
npm --prefix tools/catalog ci
npm --prefix web/frontend ci
./scripts/build.ps1
dotnet run --project web/backend/GuiaDaTi.Api --no-build --urls http://localhost:5080
```

Para desenvolver a interface após gerar o catálogo: `npm --prefix web/frontend run dev`.

## Atualizar os dados

```powershell
./scripts/update-data.ps1
# Ou escolha uma versão específica:
./scripts/update-data.ps1 -Ref COMMIT_SHA
```

O script interrompe se houver alterações locais no catálogo. Após conferir o build, registre o ponteiro com `git add database` e um commit na aplicação. Para editar o catálogo, crie uma branch dentro de `database/`; o submódulo normalmente fica em detached HEAD.

## Integração automática

O workflow raiz valida pushes e PRs com o commit fixado. A cada hora e por acionamento manual, consulta a main do catálogo, valida os JSONs e produz um artefato com site, servidor, catálogo e SHAs dos dois repositórios. Agendamentos podem atrasar.

Nenhum script do submódulo é executado pelo build do site. `tools/catalog` contém o contrato aceito pela aplicação; mudanças de schema ou taxonomia devem ser coordenadas nos dois repositórios.

O workflow não faz deploy na VPS. Para executar o artefato, configure `CATALOG_PATH` com o caminho absoluto do `catalog.json` incluído e rode o servidor no diretório publicado. A publicação no domínio depende da futura etapa de deploy.

## Configuração

- `CATALOG_PATH`: snapshot validado, padrão local `tools/catalog/dist/catalog.json`.
- `SITE_URL`: origem canônica no build, padrão `https://guiadati.com`.
- `VITE_DATA_REPOSITORY`: padrão `https://github.com/LucasPedruo/guia-da-ti-dados`.

Frontend e backend devem usar o mesmo snapshot. Nunca coloque segredos em variáveis `VITE_*`.

## Verificação e estágio atual

```powershell
npm --prefix tools/catalog test
./scripts/build.ps1
# Com o servidor em execução:
./scripts/smoke.ps1
```

Home, busca e páginas de categorias, recursos, áreas e tecnologias estão implementadas. A navegação reúne 32 categorias em seis grupos, com dropdowns e escolhas visíveis na home. A apresentação do projeto fica em `/sobre`. Categorias sem cadastros mostram um estado vazio; os cinco registros iniciais continuam fictícios.

Todos os controles visuais usam componentes do registry oficial shadcn/ui: Button, Input, Card, Badge, DropdownMenu, Select, Separator e Empty. A composição das páginas usa Tailwind e tokens de tema laranja, sem os antigos componentes visuais manuais. Para atualizar componentes: `npx shadcn@latest add <nome> --overwrite`, dentro de `web/frontend`.

Com o site rodando em `http://localhost:5081`, execute `npm --prefix web/frontend run test:ui` para verificar menus, teclado, busca, estados vazios, página Sobre, tema escuro, filtro de idioma e região e largura de tela no Chrome. Use `TEST_URL` e `CHROME_PATH` para outros endereços e instalações. `English (United States)` mostra apenas cadastros com idioma `en` e país `US` explicitamente marcado.

Mapa e filtros avançados permanecem no [plano](IMPLEMENTATION_PLAN.md). Veja a [arquitetura](ARCHITECTURE.md) e o [guia original](guia.md.txt).
