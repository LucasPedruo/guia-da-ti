# Guia da TI

Guia colaborativo de links para sites, conteúdos e oportunidades de tecnologia. Os guias organizam indicações e levam você ao site de origem, onde ficam os cursos, artigos, tutoriais e atividades. No fórum, a comunidade pode tirar dúvidas e trocar conhecimento dentro do Guia.

Aplicação com **C#/.NET 10, React, TypeScript, Tailwind e shadcn/ui**.

- [guia-da-ti](https://github.com/guia-da-ti/guia-da-ti): aplicação e integração.
- [guia-da-ti-dados](https://github.com/guia-da-ti/guia-da-ti-dados): catálogo público e contribuições.

`database/` é um **submódulo Git**, fixado em um commit do repositório de dados. Envie contribuições de conteúdo para aquele repositório.

## Executar

Requer Node.js 22.12+ e SDK .NET 10.

```powershell
git clone --recurse-submodules https://github.com/guia-da-ti/guia-da-ti.git
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
- `VITE_DATA_REPOSITORY`: padrão `https://github.com/guia-da-ti/guia-da-ti-dados`.
- `DISCUSSIONS_REPOSITORY`: repositório público das conversas, padrão `guia-da-ti/guia-da-ti-dados` (somente no backend).
- `DISCUSSIONS_TOKEN`: credencial de leitura da API GraphQL do GitHub (somente no backend).

Frontend e backend devem usar o mesmo snapshot. Nunca coloque segredos em variáveis `VITE_*`.

## Conversas da comunidade

O Início apresenta as conversas, os anúncios dentro do fórum e os apoiadores abaixo das conversas. Os mantenedores aparecem como avatares no rodapé e na página Sobre, com nome e contribuições ao passar o mouse ou focar com o teclado. A integração consulta o GitHub Discussions pela API .NET: lista de 20 tópicos por página, filtro por categoria e leitura do tópico com 20 comentários por página. Cada comentário mostra até cinco respostas, com link para continuar a leitura no GitHub. Com o login GitHub configurado, o visitante pode criar tópicos, comentar e responder pelo Guia. A publicação usa a autorização do visitante; a credencial de leitura do servidor nunca publica. Links para participar no GitHub continuam disponíveis.

Para conectar dados reais:

1. Ative Discussions nas configurações de `guia-da-ti/guia-da-ti-dados` e organize as categorias no GitHub.
2. O servidor usa esse repositório por padrão. Se já existir uma variável `DISCUSSIONS_REPOSITORY`, atualize-a para `guia-da-ti/guia-da-ti-dados` ou remova-a para usar o padrão.
3. Configure `DISCUSSIONS_TOKEN` no gerenciador de segredos do servidor. Use uma credencial com acesso de leitura a Discussions no repositório. Para desenvolvimento, use os [User Secrets do .NET](https://learn.microsoft.com/aspnet/core/security/app-secrets) no projeto `web/backend/GuiaDaTi.Api`, com a chave `DISCUSSIONS_TOKEN`, e execute em ambiente `Development`. Não registre a credencial em arquivos versionados nem envie ao frontend.
4. Execute `dotnet run --project web/backend/GuiaDaTi.Api`: o perfil local usa `Development`, carrega os User Secrets e inicia em `http://localhost:5080`, sem abrir o navegador. Inicie o frontend com `npm --prefix web/frontend run dev`. A prévia Vite também encaminha `/api` para essa API. O perfil local não configura o servidor de produção.

Sem credencial, a página mostra que o espaço está em preparação. Configuração inválida, serviço indisponível e lista vazia têm estados distintos. A API recusa repositórios privados e mantém um cache em memória por um minuto. Tópicos e comentários são exibidos como texto, sem executar HTML; comentários ocultados pela moderação não têm seu conteúdo exposto. A configuração não ativa Discussions nem cria publicações automaticamente.

Endpoints: `GET /api/discussions?category=ID&after=CURSOR` e `GET /api/discussions/{numero}?after=CURSOR`. Um tópico pode ser compartilhado pelo endereço `/?conversa=NUMERO`.

Referência: [API GraphQL para Discussions](https://docs.github.com/en/graphql/guides/using-the-graphql-api-for-discussions).

A home apresenta o fórum sem título visível, com busca, categoria e criação de tópico em uma barra compacta. A lista mostra autor, data, prévia de texto e comentários, separados por linhas. Há um espaço identificado como Publicidade entre os tópicos (ou após o único tópico, em listas com um item). O componente `Advertisement.tsx` reserva a posição e não carrega campanhas, scripts de anúncios ou rastreadores.

A pesquisa acontece ao digitar, após uma pausa de 400 ms, e também ao pressionar Enter. Dentro do tópico, os comentários e respostas aparecem com linhas de encadeamento e podem ser recolhidos. A publicidade fica entre o tópico e o campo para comentar, em um cartão com menu para consultar o espaço reservado. O GitHub mantém respostas vinculadas ao comentário principal; a interface preserva essa estrutura.

### Publicar pelo Guia

Cadastre uma OAuth App no GitHub. Configure `GITHUB_CLIENT_ID` e `GITHUB_CLIENT_SECRET` somente no backend, em User Secrets para desenvolvimento ou no gerenciador de segredos da hospedagem. O callback é `/api/auth/callback` no mesmo endereço usado para abrir o site: por exemplo, `http://localhost:5081/api/auth/callback` no desenvolvimento com Vite. Configure a URL pública HTTPS correspondente em produção; o proxy deve preservar o endereço e protocolo usados no callback. O fluxo usa OAuth com PKCE e o escopo `public_repo` exigido pela API para publicar em nome do visitante em repositórios públicos.

O login abre em uma janela menor e retorna para `/auth/complete.html`, que avisa a página original e fecha a janela. O Guia confirma a sessão pelo backend e atualiza o usuário sem recarregar a página. Se o navegador bloquear a janela, o login usa a navegação normal. A foto de perfil usa o ID autenticado do GitHub. No ambiente local, o Vite redireciona `127.0.0.1` para `localhost` para manter o endereço cadastrado no OAuth.

O login aparece quando as duas configurações existem. A sessão dura até oito horas, usa cookie HttpOnly e guarda o token no servidor. Reiniciar o servidor encerra as sessões. Esta implementação atende uma instância; várias instâncias exigem armazenamento de sessões compartilhado. Os endpoints de publicação e saída validam CSRF. Falhas preservam o rascunho. A API recusa categorias de outros repositórios, respostas de outros tópicos, comentários moderados e tópicos encerrados. O GitHub valida as permissões de cada pessoa, inclusive categorias de anúncios. A administração de categorias permanece no GitHub.

Endpoints: `GET /api/auth/session`, `GET /api/auth/login`, callback OAuth em `/api/auth/callback`, `POST /api/auth/logout` e `POST /api/discussions/publish`. Para publicar, envie o cabeçalho `X-CSRF-Token` recebido na sessão e JSON com `body`; um tópico novo também exige `title` e `categoryId`; comentário usa `number`; resposta acrescenta `replyToId` do comentário principal. Sem login configurado, a leitura e os links para o GitHub continuam funcionando.

### Contas únicas que já entraram

O Sobre mostra **Contas que já entraram**, separado dos visitantes ativos. `GET /api/community/users` retorna apenas `registeredUsers` e `trackingSince`, sem cache. Cada login concluído registra o ID estável da conta do GitHub uma vez, mesmo depois de trocar o nome, sair, entrar novamente ou reiniciar o servidor. Sessões autenticadas que já estavam abertas também entram no registro na próxima consulta à sessão. Não são armazenados nomes, tokens ou senhas. O histórico começa nesta implementação; acessos antigos sem registro não podem ser recuperados.

O registro fica por padrão em `App_Data/community-users.json`, fora do Git, dos arquivos públicos e dos artefatos de publicação. Para produção, defina `COMMUNITY_USERS_PATH` com o caminho absoluto de um arquivo em armazenamento persistente, por exemplo `/var/lib/guia-da-ti/community-users.json`, e preserve esse arquivo nas atualizações e backups. O diretório precisa permitir escrita pelo processo do site. Essa camada usa um arquivo com gravação atômica para uma única instância; múltiplos processos ou réplicas precisam de um registro compartilhado com controle de concorrência. Se a leitura falhar, o site mostra indisponibilidade; falhas de gravação são registradas no servidor e não bloqueiam o login.

### Apoiadores e mantenedores

Os apoiadores aparecem na home abaixo do fórum e em `/sobre#apoiadores`, a partir da lista `supporters` em `community.json` no repositório de dados. Cada registro contém `{ "name": "Nome", "url": "https://…", "description": "Descrição curta" }`. O build valida campos, tamanhos, links HTTPS e duplicados. A HostGator é a primeira apoiadora cadastrada. Novos apoiadores entram por PR no repositório de dados; depois, atualize o ponteiro do submódulo na aplicação.

O Início mantém os apoiadores abaixo do fórum. A página Sobre apresenta contas únicas que já entraram com GitHub, recursos reais (exclui exemplos fictícios), categorias e empresas apoiadoras. O indicador de atividade aparece apenas no rodapé. O rodapé alinha o crédito à esquerda, a atividade ao centro e até 8 avatares de mantenedores à direita, com um link para os demais. `GET /api/community/activity` retorna apenas `activeUsers` e `windowMinutes`, sem cache e sem dados pessoais. A contagem considera navegadores distintos com a página visível nos últimos cinco minutos, incluindo visitantes sem login. Um cookie anônimo de sessão, HttpOnly e SameSite Strict, identifica o navegador sem usar dados do GitHub; várias abas contam uma vez. A página visível renova a presença a cada minuto, ao receber foco e ao voltar a ficar visível. A presença fica em memória por instância, expira após cinco minutos e reinicia quando o servidor reinicia; múltiplas réplicas exigem um armazenamento compartilhado para uma contagem global. Falhas de leitura aparecem como indisponibilidade, sem simular um zero.

Os mantenedores de `/sobre#mantenedores` vêm diretamente de `GET /api/contributors`, que consulta a API de contribuidores do GitHub nos repositórios públicos disponíveis, percorre todas as páginas e reúne os usuários pelo ID sem duplicados. Bots e autores anônimos não aparecem. A lista representa autores de commits reconhecidos pelo GitHub, com a soma das contribuições nos repositórios; não inclui automaticamente participantes de issues ou Discussions. O servidor mantém cache por uma hora, e o próprio GitHub pode atrasar o reconhecimento de novos commits. A consulta pública funciona sem login do visitante; `DISCUSSIONS_TOKEN`, quando configurado, também autentica essas consultas no servidor. O servidor ignora repositórios privados ou indisponíveis e mantém os mantenedores dos repositórios públicos acessíveis.

`GITHUB_APP_REPOSITORY` define o repositório da aplicação, com padrão `guia-da-ti/guia-da-ti`. O repositório de dados usa `DISCUSSIONS_REPOSITORY`. Atualize ambos após transferir os repositórios para uma organização.

A migração dos dois repositórios para uma organização está descrita em [docs/github-organization.md](docs/github-organization.md).

## Verificação e estágio atual

```powershell
npm --prefix tools/catalog test
dotnet run --project web/backend/GuiaDaTi.Api.Tests
./scripts/build.ps1
# Com o servidor em execução:
./scripts/smoke.ps1
```

O Início apresenta as conversas, os anúncios dentro do fórum e os apoiadores abaixo das conversas. Os mantenedores aparecem como avatares no rodapé e na página Sobre, com nome e contribuições ao passar o mouse ou focar com o teclado. Busca e páginas de categorias, recursos, áreas e tecnologias estão implementadas. A navegação reúne as categorias do guia, com expansão de um grupo por vez e destaque da rota atual. A navegação começa por Início, Comunidade e Criadores. Comunidade é um link direto para `/comunidades`, separado de Networking. Criadores é um link direto para `/criadores`, sem dropdown no computador ou no celular. Essa página mostra abas com ícones de YouTube, Instagram, TikTok, LinkedIn e Twitter/X; a aba inicial é YouTube, e `?plataforma=` permite compartilhar a rede selecionada. Não há uma aba de todos os criadores. As listagens usam fundo branco no tema claro, acompanham o tema escuro e não têm sombra. Sobre é um link direto, sem dropdown, e reúne também as empresas apoiadoras. O endereço antigo `/apoiadores` redireciona para `/sobre#apoiadores`. O endereço antigo `/contribuidores` redireciona para `/sobre#mantenedores`. Categorias sem cadastros mostram um estado vazio; os cinco registros iniciais continuam fictícios.

Todos os controles visuais usam componentes do registry oficial shadcn/ui: Button, Input, Card, Badge, DropdownMenu, Select, Separator e Empty. A composição das páginas usa Tailwind e tokens de tema laranja, sem os antigos componentes visuais manuais. Para atualizar componentes: `npx shadcn@latest add <nome> --overwrite`, dentro de `web/frontend`.

Com o site rodando em `http://localhost:5081`, execute `npm --prefix web/frontend run test:ui` para verificar menus, teclado, busca, estados vazios, página Sobre, tema escuro, filtro de idioma e região e largura de tela no Chrome. Os testes de conversas usam respostas simuladas no navegador para verificar categorias, paginação, leitura, respostas, falha e nova tentativa, sem publicar no GitHub. Os testes .NET verificam o cliente GraphQL com um servidor HTTP simulado. Use `TEST_URL` e `CHROME_PATH` para outros endereços e instalações. `English (United States)` mostra apenas cadastros com idioma `en` e país `US` explicitamente marcado.

Mapa e filtros avançados permanecem no [plano](IMPLEMENTATION_PLAN.md). Veja a [arquitetura](ARCHITECTURE.md) e o [guia original](guia.md.txt).

### Perfis de criadores

Ao colar um perfil em Contribuir (categoria Criadores ou YouTube), o site busca nome, descrição, foto e seguidores quando a rede disponibiliza esses dados. O cadastro permite revisar os campos antes de enviar. A listagem busca os dados pelo link aprovado no catálogo; os dados externos têm cache de 30 minutos e não alteram o catálogo automaticamente. Perfis fictícios não são consultados.

`GET /api/creators/profile?url=...` aceita apenas HTTPS nos domínios das cinco redes e rotas de perfil. Links ainda não catalogados exigem login. Redirecionamentos são bloqueados; fotos usam apenas os CDNs das redes. Metadados públicos são uma alternativa parcial e podem estar bloqueados. Para importar inscritos do YouTube e seguidores do X pelas APIs oficiais, configure `YOUTUBE_API_KEY` e `X_BEARER_TOKEN` apenas no servidor (User Secrets), nunca em `VITE_*`. Sem esses acessos, alguns campos podem ficar indisponíveis. Contagens ocultas não são convertidas em zero e nenhum dado é inventado.

### Comunidades por localização

`/comunidades` mostra todas as comunidades em ordem alfabética sem filtros. O botão Filtrar comunidades abre um diálogo com localização, categoria (Geral, Networking, Eventos, Vagas e temas técnicos) e plataforma. Os filtros são aplicados apenas após confirmar; Cancelar preserva a seleção anterior. O mapa SVG permite selecionar várias UFs; no modo Regiões, clicar num estado seleciona a região inteira. Os botões de região também podem ser combinados. Brasil inteiro filtra apenas comunidades nacionais; Internacionais filtra comunidades globais ou de fora do Brasil. As seleções são compartilháveis por `?alcance=regional&estados=SP,RJ`, `?alcance=national` e `?alcance=international`. Uma comunidade regional aparece quando atende pelo menos uma UF selecionada; o resultado não duplica cadastros. A lista de estados permite selecionar UFs pequenas e todo o filtro funciona com teclado.

O campo opcional `communityLocation` usa `{ "scope": "regional", "states": ["SP", "RJ"] }`, `{ "scope": "national" }` ou `{ "scope": "international" }`. Novas sugestões de comunidades exigem localização, categoria, plataformas e modalidade; ela acompanha a conversa e o PR de aprovação. Cadastros antigos sem metadados permanecem na lista sem filtros; campos ausentes não correspondem a um filtro específico, sem inferir alcance por idioma ou país. Os schemas da aplicação e do submódulo de dados foram atualizados juntos.

O mapa usa [malhas simplificadas do IBGE](https://servicodados.ibge.gov.br/api/docs/malhas?versao=3), convertido em um SVG local com as 27 UFs, sem consulta externa durante a navegação. Para gerar o asset novamente: `node web/frontend/scripts/prepare-brazil-map.mjs [arquivo-GeoJSON]`. Execute `npm --prefix web/frontend run test:location` para verificar combinações, isolamento de escopos e links compartilhados.

As plataformas de comunidade são WhatsApp, Telegram, Discord, Slack, Facebook, LinkedIn, Meetup, Reddit, GitHub Discussions, Discourse, Circle, Mighty Networks, site próprio e outra plataforma. Modalidades: `online`, `in-person` e `hybrid`. Campos: `communityPlatforms` (array com ao menos uma plataforma) e `communityModality`; categorias continuam em `areas`. O alcance, a plataforma e a modalidade são dimensões independentes: uma comunidade nacional pode ter encontros presenciais e usar Discord. As plataformas não são inferidas pelo link nem pelo idioma.

Ao selecionar Internacionais, o diálogo mostra o mapa mundial em laranja com GSAP. A animação respeita `prefers-reduced-motion`. O asset local usa [Natural Earth](https://www.naturalearthdata.com/about/terms-of-use/), em domínio público, e pode ser atualizado com `node web/frontend/scripts/prepare-world-map.mjs [arquivo-GeoJSON]`.

Toda página válida, exceto o próprio formulário de contribuição, expõe um botão de sugestão. O texto corresponde à categoria e o link `/contribuir?categoria=communities` preseleciona o formulário.
