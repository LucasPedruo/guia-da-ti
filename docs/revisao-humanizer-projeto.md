# Revisão de texto do projeto

Revisão em 08/10/2026 com [humanizer-br](../.agents/skills/humanizer-br/SKILL.md). O pedido abrangeu os textos existentes da interface e da documentação. Cada revisão foi aplicada ao trecho correspondente.

## Regras aplicadas

- Ponto e vírgula virou ponto no texto corrido.
- Frases longas foram divididas.
- Dois-pontos de ênfase viraram ponto.
- Gerúndios deram lugar a verbos diretos.
- Textos da interface passaram para voz ativa e segunda pessoa.
- Lifestyle virou Estilo de vida. Open source virou código aberto nos rótulos alterados. Os identificadores permanecem iguais.

## Antes e depois

### ARCHITECTURE.md

**Antes**

- A stack definida é C#/.NET 10, React com TypeScript, Tailwind e shadcn/ui. O guia original está em `guia.md.txt` e foi preservado. Não há banco de dados nem painel administrativo. A participação no fórum pode usar autenticação GitHub.
- Dois repositórios independentes: `guia-da-ti/guia-da-ti` contém a aplicação e `guia-da-ti/guia-da-ti-dados` centraliza o catálogo público e as conversas da comunidade no GitHub Discussions. A integração do catálogo é um submódulo Git em `database/`, fixado em um commit reproduzível; as conversas são consultadas pela API do GitHub. A licença ainda precisa ser definida.
- Cada cadastro é um JSON em `data/<tipo>/<slug>.json`. O schema base exige slug, tipo, nome, resumo, descrição, URL HTTPS, áreas, tecnologias, idiomas e data de atualização. Campos desconhecidos são rejeitados; tamanhos e vocabulários são limitados. A validação verifica nomes de arquivos, referências à taxonomia e duplicados por URL normalizada. URLs privadas, credenciais e protocolos executáveis são rejeitados. A validação não acessa URLs: disponibilidade e legitimidade exigem revisão humana.
- O validador confiável em `tools/catalog` lê somente os JSONs de `database/data` e produz `tools/catalog/dist/catalog.json`. Schema e taxonomia aceitos ficam na aplicação; mudanças de contrato exigem coordenação nos dois repositórios. O frontend gera HTML no build e C# carrega o mesmo snapshot na inicialização. HTML e catálogo devem ser publicados juntos. `CATALOG_PATH` permite configurar outro snapshot validado.
- A navegação oferece 32 categorias em seis grupos: Aprender, Conteúdos, Artigos e estudos, Comunidade, Praticar e Carreira, com expansão individual. Todas usam o schema base; campos específicos, mapa e filtros avançados continuam incrementais. `/sobre` concentra a apresentação do projeto. Favoritos e avaliações seguem fora do escopo atual.
- Os componentes visuais são instalados do registry oficial shadcn/ui. Apenas o tema e a composição de páginas são locais. Os menus Radix precisam de estilos inline para posicionamento e controle de rolagem; a CSP permite estilos inline, mantendo scripts restritos à origem do site. Conteúdo do catálogo continua renderizado como texto.
- O CSS global padroniza `cursor: pointer` nos controles interativos habilitados, incluindo menus e opções renderizados em portais Radix. Campos de texto mantêm seu cursor de edição e controles desabilitados não recebem o indicador de clique. A regra fica em `src/styles.css`, preservando os componentes do registry.

**Depois**

- O projeto usa C#/.NET 10, React com TypeScript, Tailwind e shadcn/ui. O guia original está em `guia.md.txt` e foi preservado. Não há banco de dados nem painel administrativo. A participação no fórum pode usar autenticação GitHub.
- O projeto usa dois repositórios independentes. `guia-da-ti/guia-da-ti` contém a aplicação e `guia-da-ti/guia-da-ti-dados` centraliza o catálogo público e as conversas da comunidade no GitHub Discussions. A integração do catálogo é um submódulo Git em `database/`, fixado em um commit reproduzível. As conversas são consultadas pela API do GitHub. A licença ainda precisa ser definida.
- Cada cadastro é um JSON em `data/<tipo>/<slug>.json`. O schema base exige slug, tipo, nome, resumo, descrição, URL HTTPS, áreas, tecnologias, idiomas e data de atualização. Campos desconhecidos são rejeitados. Tamanhos e vocabulários são limitados. A validação verifica nomes de arquivos, referências à taxonomia e duplicados por URL normalizada. URLs privadas, credenciais e protocolos executáveis são rejeitados. A validação não acessa URLs. A revisão humana confirma a disponibilidade e a legitimidade dos recursos.
- O validador confiável em `tools/catalog` lê somente os JSONs de `database/data` e produz `tools/catalog/dist/catalog.json`. Schema e taxonomia aceitos ficam na aplicação. Mudanças de contrato exigem coordenação nos dois repositórios. O frontend gera HTML no build e C# carrega o mesmo snapshot na inicialização. HTML e catálogo devem ser publicados juntos. `CATALOG_PATH` permite configurar outro snapshot validado.
- A navegação oferece 32 categorias em seis grupos: Aprender, Conteúdos, Artigos e estudos, Comunidade, Praticar e Carreira, com expansão individual. Todas usam o schema base. Campos específicos, mapa e filtros avançados continuam incrementais. `/sobre` concentra a apresentação do projeto. Favoritos e avaliações seguem fora do escopo atual.
- Os componentes visuais são instalados do registry oficial shadcn/ui. Apenas o tema e a composição de páginas são locais. Os menus Radix precisam de estilos inline para posicionamento e controle de rolagem. A CSP permite estilos inline. Os scripts continuam restritos à origem do site. Conteúdo do catálogo continua renderizado como texto.
- O CSS global padroniza `cursor: pointer` nos controles interativos habilitados, incluindo menus e opções renderizados em portais Radix. Campos de texto mantêm seu cursor de edição e controles desabilitados não recebem o indicador de clique. A regra fica em `src/styles.css`. Os componentes do registry permanecem iguais.

### IMPLEMENTATION_PLAN.md

**Antes**

- - [ ] Cadastros reais revisados; remover exemplos da publicação.

**Depois**

- - [ ] Cadastros reais revisados. Remover exemplos da publicação.

### README.md

**Antes**

- O script interrompe se houver alterações locais no catálogo. Após conferir o build, registre o ponteiro com `git add database` e um commit na aplicação. Para editar o catálogo, crie uma branch dentro de `database/`; o submódulo normalmente fica em detached HEAD.
- O workflow raiz valida pushes e PRs com o commit fixado. A cada hora e por acionamento manual, consulta a main do catálogo, valida os JSONs e produz um artefato com site, servidor, catálogo e SHAs dos dois repositórios. Agendamentos podem atrasar.
- Nenhum script do submódulo é executado pelo build do site. `tools/catalog` contém o contrato aceito pela aplicação; mudanças de schema ou taxonomia devem ser coordenadas nos dois repositórios.
- O Início apresenta as conversas, os anúncios dentro do fórum e os apoiadores abaixo das conversas. Os mantenedores aparecem como avatares no rodapé e na página Sobre, com nome e contribuições ao passar o mouse ou focar com o teclado. A integração consulta o GitHub Discussions pela API .NET: lista de 20 tópicos por página, filtro por categoria e leitura do tópico com 20 comentários por página. Cada comentário mostra até cinco respostas, com link para continuar a leitura no GitHub. Com o login GitHub configurado, o visitante pode criar tópicos, comentar e responder pelo Guia. A publicação usa a autorização do visitante; a credencial de leitura do servidor nunca publica. Links para participar no GitHub continuam disponíveis.
- Sem credencial, a página mostra que o espaço está em preparação. Configuração inválida, serviço indisponível e lista vazia têm estados distintos. A API recusa repositórios privados e mantém um cache em memória por um minuto. Tópicos e comentários são exibidos como texto, sem executar HTML; comentários ocultados pela moderação não têm seu conteúdo exposto. A configuração não ativa Discussions nem cria publicações automaticamente.
- A home apresenta o fórum sem título visível, com busca, categoria e criação de tópico em uma barra compacta. A lista mostra autor, data, prévia de texto e comentários, separados por linhas. Há um espaço identificado como Publicidade entre os tópicos (ou após o único tópico, em listas com um item). O componente `Advertisement.tsx` reserva a posição e não carrega campanhas, scripts de anúncios ou rastreadores.
- A pesquisa acontece ao digitar, após uma pausa de 400 ms, e também ao pressionar Enter. Dentro do tópico, os comentários e respostas aparecem com linhas de encadeamento e podem ser recolhidos. A publicidade fica entre o tópico e o campo para comentar, em um cartão com menu para consultar o espaço reservado. O GitHub mantém respostas vinculadas ao comentário principal; a interface preserva essa estrutura.
- Cadastre uma OAuth App no GitHub. Configure `GITHUB_CLIENT_ID` e `GITHUB_CLIENT_SECRET` somente no backend, em User Secrets para desenvolvimento ou no gerenciador de segredos da hospedagem. O callback é `/api/auth/callback` no mesmo endereço usado para abrir o site: por exemplo, `http://localhost:5081/api/auth/callback` no desenvolvimento com Vite. Configure a URL pública HTTPS correspondente em produção; o proxy deve preservar o endereço e protocolo usados no callback. O fluxo usa OAuth com PKCE e o escopo `public_repo` exigido pela API para publicar em nome do visitante em repositórios públicos.
- O login aparece quando as duas configurações existem. A sessão dura até oito horas, usa cookie HttpOnly e guarda o token no servidor. Reiniciar o servidor encerra as sessões. Esta implementação atende uma instância; várias instâncias exigem armazenamento de sessões compartilhado. Os endpoints de publicação e saída validam CSRF. Falhas preservam o rascunho. A API recusa categorias de outros repositórios, respostas de outros tópicos, comentários moderados e tópicos encerrados. O GitHub valida as permissões de cada pessoa, inclusive categorias de anúncios. A administração de categorias permanece no GitHub.
- Endpoints: `GET /api/auth/session`, `GET /api/auth/login`, callback OAuth em `/api/auth/callback`, `POST /api/auth/logout` e `POST /api/discussions/publish`. Para publicar, envie o cabeçalho `X-CSRF-Token` recebido na sessão e JSON com `body`; um tópico novo também exige `title` e `categoryId`; comentário usa `number`; resposta acrescenta `replyToId` do comentário principal. Sem login configurado, a leitura e os links para o GitHub continuam funcionando.
- O Sobre mostra **Contas que já entraram**, separado dos visitantes ativos. `GET /api/community/users` retorna apenas `registeredUsers` e `trackingSince`, sem cache. Cada login concluído registra o ID estável da conta do GitHub uma vez, mesmo depois de trocar o nome, sair, entrar novamente ou reiniciar o servidor. Sessões autenticadas que já estavam abertas também entram no registro na próxima consulta à sessão. Não são armazenados nomes, tokens ou senhas. O histórico começa nesta implementação; acessos antigos sem registro não podem ser recuperados.
- O registro fica por padrão em `App_Data/community-users.json`, fora do Git, dos arquivos públicos e dos artefatos de publicação. Para produção, defina `COMMUNITY_USERS_PATH` com o caminho absoluto de um arquivo em armazenamento persistente, por exemplo `/var/lib/guia-da-ti/community-users.json`, e preserve esse arquivo nas atualizações e backups. O diretório precisa permitir escrita pelo processo do site. Essa camada usa um arquivo com gravação atômica para uma única instância; múltiplos processos ou réplicas precisam de um registro compartilhado com controle de concorrência. Se a leitura falhar, o site mostra indisponibilidade; falhas de gravação são registradas no servidor e não bloqueiam o login.
- Os apoiadores aparecem na home abaixo do fórum e em `/sobre#apoiadores`, a partir da lista `supporters` em `community.json` no repositório de dados. Cada registro contém `{ "name": "Nome", "url": "https://…", "description": "Descrição curta" }`. O build valida campos, tamanhos, links HTTPS e duplicados. A HostGator é a primeira apoiadora cadastrada. Novos apoiadores entram por PR no repositório de dados; depois, atualize o ponteiro do submódulo na aplicação.
- O Início mantém os apoiadores abaixo do fórum. A página Sobre apresenta contas únicas que já entraram com GitHub, recursos reais (exclui exemplos fictícios), categorias e empresas apoiadoras. O indicador de atividade aparece apenas no rodapé. O rodapé alinha o crédito à esquerda, a atividade ao centro e até 8 avatares de mantenedores à direita, com um link para os demais. `GET /api/community/activity` retorna apenas `activeUsers` e `windowMinutes`, sem cache e sem dados pessoais. A contagem considera navegadores distintos com a página visível nos últimos cinco minutos, incluindo visitantes sem login. Um cookie anônimo de sessão, HttpOnly e SameSite Strict, identifica o navegador sem usar dados do GitHub; várias abas contam uma vez. A página visível renova a presença a cada minuto, ao receber foco e ao voltar a ficar visível. A presença fica em memória por instância, expira após cinco minutos e reinicia quando o servidor reinicia; múltiplas réplicas exigem um armazenamento compartilhado para uma contagem global. Falhas de leitura aparecem como indisponibilidade, sem simular um zero.
- Os mantenedores de `/sobre#mantenedores` vêm diretamente de `GET /api/contributors`, que consulta a API de contribuidores do GitHub nos repositórios públicos disponíveis, percorre todas as páginas e reúne os usuários pelo ID sem duplicados. Bots e autores anônimos não aparecem. A lista representa autores de commits reconhecidos pelo GitHub, com a soma das contribuições nos repositórios; não inclui automaticamente participantes de issues ou Discussions. O servidor mantém cache por uma hora, e o próprio GitHub pode atrasar o reconhecimento de novos commits. A consulta pública funciona sem login do visitante; `DISCUSSIONS_TOKEN`, quando configurado, também autentica essas consultas no servidor. O servidor ignora repositórios privados ou indisponíveis e mantém os mantenedores dos repositórios públicos acessíveis.
- O Início apresenta as conversas, os anúncios dentro do fórum e os apoiadores abaixo das conversas. Os mantenedores aparecem como avatares no rodapé e na página Sobre, com nome e contribuições ao passar o mouse ou focar com o teclado. Busca e páginas de categorias, recursos, áreas e tecnologias estão implementadas. A navegação reúne as categorias do guia, com expansão de um grupo por vez e destaque da rota atual. A navegação começa por Início, Comunidade e Criadores. Comunidade é um link direto para `/comunidades`, separado de Networking. Criadores é um link direto para `/criadores`, sem dropdown no computador ou no celular. Essa página mostra abas com ícones de YouTube, Instagram, TikTok, LinkedIn e Twitter/X; a aba inicial é YouTube, e `?plataforma=` permite compartilhar a rede selecionada. Não há uma aba de todos os criadores. As listagens usam fundo branco no tema claro, acompanham o tema escuro e não têm sombra. Sobre é um link direto, sem dropdown, e reúne também as empresas apoiadoras. O endereço antigo `/apoiadores` redireciona para `/sobre#apoiadores`. O endereço antigo `/contribuidores` redireciona para `/sobre#mantenedores`. Categorias sem cadastros mostram um estado vazio; os cinco registros iniciais continuam fictícios.
- Ao colar um perfil em Contribuir (categoria Criadores ou YouTube), o site busca nome, descrição, foto e seguidores quando a rede disponibiliza esses dados. O cadastro permite revisar os campos antes de enviar. A listagem busca os dados pelo link aprovado no catálogo; os dados externos têm cache de 30 minutos e não alteram o catálogo automaticamente. Perfis fictícios não são consultados.
- `GET /api/creators/profile?url=...` aceita apenas HTTPS nos domínios das cinco redes e rotas de perfil. Links ainda não catalogados exigem login. Redirecionamentos são bloqueados; fotos usam apenas os CDNs das redes. Metadados públicos são uma alternativa parcial e podem estar bloqueados. Para importar inscritos do YouTube e seguidores do X pelas APIs oficiais, configure `YOUTUBE_API_KEY` e `X_BEARER_TOKEN` apenas no servidor (User Secrets), nunca em `VITE_*`. Sem esses acessos, alguns campos podem ficar indisponíveis. Contagens ocultas não são convertidas em zero e nenhum dado é inventado.
- `/comunidades` mostra todas as comunidades em ordem alfabética sem filtros. As abas com ícones filtram Geral, WhatsApp, Telegram, Discord, Facebook, LinkedIn, Reddit, GitHub e Outra. Geral inclui todos os cadastros; Outra reúne as plataformas restantes com metadados confirmados. O botão Filtrar comunidades abre apenas o diálogo de localização. A aba selecionada combina com o mapa e fica em `?plataforma=discord`. Limpar a localização preserva a plataforma. Os filtros são aplicados apenas após confirmar; Cancelar preserva a seleção anterior. O mapa SVG permite selecionar várias UFs; no modo Regiões, clicar num estado seleciona a região inteira. Os botões de região também podem ser combinados. Brasil inteiro filtra apenas comunidades nacionais; Internacionais filtra comunidades globais ou de fora do Brasil. As seleções são compartilháveis por `?alcance=regional&estados=SP,RJ`, `?alcance=national` e `?alcance=international`. Uma comunidade regional aparece quando atende pelo menos uma UF selecionada; o resultado não duplica cadastros. A lista de estados permite selecionar UFs pequenas e todo o filtro funciona com teclado.
- O campo opcional `communityLocation` usa `{ "scope": "regional", "states": ["SP", "RJ"] }`, `{ "scope": "national" }` ou `{ "scope": "international" }`. Novas sugestões de comunidades exigem localização, categoria, plataformas e modalidade; esses dados acompanham a proposta de revisão do catálogo. Cadastros antigos sem metadados permanecem na lista sem filtros; campos ausentes não correspondem a um filtro específico, sem inferir alcance por idioma ou país. Os schemas da aplicação e do submódulo de dados foram atualizados juntos.
- As plataformas de comunidade são WhatsApp, Telegram, Discord, Slack, Facebook, LinkedIn, Meetup, Reddit, GitHub Discussions, Discourse, Circle, Mighty Networks, site próprio e outra plataforma. Modalidades: `online`, `in-person` e `hybrid`. Campos: `communityPlatforms` (array com ao menos uma plataforma) e `communityModality`; categorias continuam em `areas`. O alcance, a plataforma e a modalidade são dimensões independentes: uma comunidade nacional pode ter encontros presenciais e usar Discord. As plataformas não são inferidas pelo link nem pelo idioma.
- `POST /api/contributions` usa a credencial do visitante e valida CSRF. Criadores, YouTube e comunidades retornam `{kind:"catalog",url:"https://github.com/.../pull/..."}`: o servidor prepara o arquivo validado e abre um Pull Request, sem publicar Discussion nem invalidar a lista do fórum. Mantenedores usam um branch no catálogo; visitantes usam uma cópia pública na própria conta, criada ou reutilizada após conferir a origem. A proposta parte da revisão atual do catálogo e preserva todos os metadados. Nenhuma proposta é mesclada automaticamente. As demais categorias retornam `{kind:"discussion",number:...}` e mantêm o fluxo de conversa e aprovação. Falhas preservam o formulário.
- O script público `theme.js`, carregado antes dos estilos, aplica o tema salvo e prepara a entrada das rotas. O GSAP revela o conteúdo em 450 ms; componentes novos, diálogos e menus mantêm suas animações. Movimento reduzido exibe tudo imediatamente. Se o bundle não carregar, o conteúdo é liberado após 1,5 segundo. O teste de navegação registra quadros de entradas nos dois temas e verifica que a opacidade progride sem voltar a ocultar o conteúdo.

**Depois**

- O script interrompe se houver alterações locais no catálogo. Após conferir o build, registre o ponteiro com `git add database` e um commit na aplicação. Para editar o catálogo, crie uma branch dentro de `database/`. O submódulo normalmente fica em detached HEAD.
- O workflow raiz valida pushes e PRs com o commit fixado. A cada hora, ou quando acionado manualmente, consulta a main do catálogo e valida os JSONs. O artefato gerado reúne site, servidor, catálogo e SHAs dos dois repositórios. Agendamentos podem atrasar.
- Nenhum script do submódulo é executado pelo build do site. `tools/catalog` contém o contrato aceito pela aplicação. Mudanças de schema ou taxonomia devem ser coordenadas nos dois repositórios.
- O **Início** mostra conversas e anúncios do fórum, com os apoiadores logo abaixo. Os mantenedores aparecem como fotos no rodapé e em **Sobre**. Passe o mouse ou use o teclado para ver o nome e as contribuições de cada pessoa. A integração consulta o GitHub Discussions pela API .NET. A lista mostra 20 tópicos por página e permite filtrar por categoria. Cada tópico mostra 20 comentários por página. Cada comentário mostra até cinco respostas, com link para continuar a leitura no GitHub. Com o login GitHub configurado, o visitante pode criar tópicos, comentar e responder pelo Guia. A publicação usa a autorização do visitante. A credencial de leitura do servidor nunca publica. Links para participar no GitHub continuam disponíveis.
- Sem credencial, a página mostra que o espaço está em preparação. Configuração inválida, serviço indisponível e lista vazia têm estados distintos. A API recusa repositórios privados e mantém um cache em memória por um minuto. Tópicos e comentários são exibidos como texto, sem executar HTML. Comentários ocultados pela moderação não têm seu conteúdo exposto. A configuração não ativa Discussions nem cria publicações automaticamente.
- O **Início** apresenta o fórum sem título visível, com busca, categoria e criação de tópico em uma barra compacta. A lista mostra autor, data, prévia de texto e comentários, separados por linhas. Há um espaço identificado como Publicidade entre os tópicos (ou após o único tópico, em listas com um item). O componente `Advertisement.tsx` reserva a posição e não carrega campanhas, scripts de anúncios ou rastreadores.
- A pesquisa acontece ao digitar, após uma pausa de 400 ms, e também ao pressionar Enter. Dentro do tópico, os comentários e respostas aparecem com linhas de encadeamento e podem ser recolhidos. A publicidade fica entre o tópico e o campo para comentar, em um cartão com menu para consultar o espaço reservado. O GitHub mantém respostas vinculadas ao comentário principal. A interface preserva essa estrutura.
- Cadastre uma OAuth App no GitHub. Configure `GITHUB_CLIENT_ID` e `GITHUB_CLIENT_SECRET` somente no backend, em User Secrets para desenvolvimento ou no gerenciador de segredos da hospedagem. O callback é `/api/auth/callback`, no mesmo endereço usado para abrir o site. Por exemplo, `http://localhost:5081/api/auth/callback` no desenvolvimento com Vite. Configure a URL pública HTTPS correspondente em produção. O proxy deve preservar o endereço e protocolo usados no callback. O fluxo usa OAuth com PKCE e o escopo `public_repo` exigido pela API para publicar em nome do visitante em repositórios públicos.
- O login aparece quando as duas configurações existem. A sessão dura até oito horas, usa cookie HttpOnly e guarda o token no servidor. Reiniciar o servidor encerra as sessões. Esta implementação atende uma instância. Várias instâncias exigem armazenamento de sessões compartilhado. Os endpoints de publicação e saída validam CSRF. Falhas preservam o rascunho. A API recusa categorias de outros repositórios, respostas de outros tópicos, comentários moderados e tópicos encerrados. O GitHub valida as permissões de cada pessoa, inclusive categorias de anúncios. A administração de categorias permanece no GitHub.
- Endpoints: `GET /api/auth/session`, `GET /api/auth/login`, callback OAuth em `/api/auth/callback`, `POST /api/auth/logout` e `POST /api/discussions/publish`. Para publicar, envie o cabeçalho `X-CSRF-Token` recebido na sessão e JSON com `body`. Um tópico novo também exige `title` e `categoryId`. Comentário usa `number`. Resposta acrescenta `replyToId` do comentário principal. Sem login configurado, a leitura e os links para o GitHub continuam funcionando.
- O Sobre mostra **Contas que já entraram**, separado dos visitantes ativos. `GET /api/community/users` retorna apenas `registeredUsers` e `trackingSince`, sem cache. Cada login concluído registra o ID estável da conta do GitHub uma vez, mesmo depois de trocar o nome, sair, entrar novamente ou reiniciar o servidor. Sessões autenticadas que já estavam abertas também entram no registro na próxima consulta à sessão. Não são armazenados nomes, tokens ou senhas. O histórico começa nesta implementação. Acessos antigos sem registro não podem ser recuperados.
- O registro fica por padrão em `App_Data/community-users.json`, fora do Git, dos arquivos públicos e dos artefatos de publicação. Para produção, defina `COMMUNITY_USERS_PATH` com o caminho absoluto de um arquivo em armazenamento persistente, por exemplo `/var/lib/guia-da-ti/community-users.json`, e preserve esse arquivo nas atualizações e backups. O diretório precisa permitir escrita pelo processo do site. Essa camada usa um arquivo com gravação atômica para uma única instância. Múltiplos processos ou réplicas precisam de um registro compartilhado com controle de concorrência. Se a leitura falhar, o site mostra indisponibilidade. Falhas de gravação são registradas no servidor e não bloqueiam o login.
- Os apoiadores aparecem no **Início**, abaixo do fórum e em `/sobre#apoiadores`, a partir da lista `supporters` em `community.json` no repositório de dados. Cada registro contém `{ "name": "Nome", "url": "https://…", "description": "Descrição curta" }`. O build valida campos, tamanhos, links HTTPS e duplicados. A HostGator é a primeira apoiadora cadastrada. Novos apoiadores entram por PR no repositório de dados. Depois, atualize o ponteiro do submódulo na aplicação.
- O Início mantém os apoiadores abaixo do fórum. A página Sobre apresenta contas únicas que já entraram com GitHub, recursos reais (exclui exemplos fictícios), categorias e empresas apoiadoras. O indicador de atividade aparece apenas no rodapé. O rodapé alinha o crédito à esquerda, a atividade ao centro e até 8 avatares de mantenedores à direita, com um link para os demais. `GET /api/community/activity` retorna apenas `activeUsers` e `windowMinutes`, sem cache e sem dados pessoais. A contagem considera navegadores distintos com a página visível nos últimos cinco minutos, incluindo visitantes sem login. Um cookie anônimo de sessão, HttpOnly e SameSite Strict, identifica o navegador sem usar dados do GitHub. Várias abas contam uma vez. A página visível renova a presença a cada minuto, ao receber foco e ao voltar a ficar visível. A presença fica em memória por instância, expira após cinco minutos e reinicia quando o servidor reinicia. Múltiplas réplicas exigem um armazenamento compartilhado para uma contagem global. Falhas de leitura aparecem como indisponibilidade, sem simular um zero.
- Os mantenedores de `/sobre#mantenedores` vêm diretamente de `GET /api/contributors`, que consulta a API de contribuidores do GitHub nos repositórios públicos disponíveis, percorre todas as páginas e reúne os usuários pelo ID sem duplicados. Bots e autores anônimos não aparecem. A lista representa autores de commits reconhecidos pelo GitHub, com a soma das contribuições nos repositórios. Não inclui automaticamente participantes de issues ou Discussions. O servidor mantém cache por uma hora, e o próprio GitHub pode atrasar o reconhecimento de novos commits. A consulta pública funciona sem login do visitante; `DISCUSSIONS_TOKEN`, quando configurado, também autentica essas consultas no servidor. O servidor ignora repositórios privados ou indisponíveis e mantém os mantenedores dos repositórios públicos acessíveis.
- O **Início** mostra conversas e anúncios do fórum, com os apoiadores logo abaixo. Os mantenedores aparecem como fotos no rodapé e em **Sobre**. Passe o mouse ou use o teclado para ver o nome e as contribuições de cada pessoa. Busca e páginas de categorias, recursos, áreas e tecnologias estão implementadas. A navegação reúne as categorias do guia, com expansão de um grupo por vez e destaque da rota atual. A navegação começa por Início, Comunidade e Criadores. Comunidade é um link direto para `/comunidades`, separado de Networking. Criadores é um link direto para `/criadores`, sem dropdown no computador ou no celular. Essa página mostra abas com ícones de YouTube, Instagram, TikTok, LinkedIn e Twitter/X. A aba inicial é YouTube, e `?plataforma=` permite compartilhar a rede selecionada. Não há uma aba de todos os criadores. As listagens usam fundo branco no tema claro, acompanham o tema escuro e não têm sombra. Sobre é um link direto, sem dropdown, e reúne também as empresas apoiadoras. O endereço antigo `/apoiadores` redireciona para `/sobre#apoiadores`. O endereço antigo `/contribuidores` redireciona para `/sobre#mantenedores`. Categorias sem cadastros mostram um estado vazio. Os cinco registros iniciais continuam fictícios.
- Ao colar um perfil em Contribuir (categoria Criadores ou YouTube), o site busca nome, descrição, foto e seguidores quando a rede disponibiliza esses dados. O cadastro permite revisar os campos antes de enviar. A listagem busca os dados pelo link aprovado no catálogo. Os dados externos têm cache de 30 minutos e não alteram o catálogo automaticamente. Perfis fictícios não são consultados.
- `GET /api/creators/profile?url=...` aceita apenas HTTPS nos domínios das cinco redes e rotas de perfil. Links ainda não catalogados exigem login. Redirecionamentos são bloqueados. Fotos usam apenas os CDNs das redes. Metadados públicos são uma alternativa parcial e podem estar bloqueados. Para importar inscritos do YouTube e seguidores do X pelas APIs oficiais, configure `YOUTUBE_API_KEY` e `X_BEARER_TOKEN` apenas no servidor (User Secrets), nunca em `VITE_*`. Sem esses acessos, alguns campos podem ficar indisponíveis. Contagens ocultas não são convertidas em zero e nenhum dado é inventado.
- `/comunidades` mostra todas as comunidades em ordem alfabética sem filtros. As abas com ícones filtram Geral, WhatsApp, Telegram, Discord, Facebook, LinkedIn, Reddit, GitHub e Outra. Geral inclui todos os cadastros. Outra reúne as plataformas restantes com metadados confirmados. O botão Filtrar comunidades abre apenas o diálogo de localização. A aba selecionada combina com o mapa e fica em `?plataforma=discord`. Limpar a localização preserva a plataforma. Os filtros são aplicados apenas após confirmar. Cancelar preserva a seleção anterior. O mapa SVG permite selecionar várias UFs. No modo Regiões, clicar num estado seleciona a região inteira. Os botões de região também podem ser combinados. Brasil inteiro filtra apenas comunidades nacionais. Internacionais filtra comunidades globais ou de fora do Brasil. As seleções são compartilháveis por `?alcance=regional&estados=SP,RJ`, `?alcance=national` e `?alcance=international`. Uma comunidade regional aparece quando atende pelo menos uma UF selecionada. O resultado não duplica cadastros. A lista de estados permite selecionar UFs pequenas e todo o filtro funciona com teclado.
- O campo opcional `communityLocation` usa `{ "scope": "regional", "states": ["SP", "RJ"] }`, `{ "scope": "national" }` ou `{ "scope": "international" }`. Novas sugestões de comunidades exigem localização, categoria, plataformas e modalidade. Esses dados acompanham a proposta de revisão do catálogo. Cadastros antigos sem metadados permanecem na lista sem filtros. Campos ausentes não correspondem a um filtro específico, sem inferir alcance por idioma ou país. Os schemas da aplicação e do submódulo de dados foram atualizados juntos.
- As plataformas de comunidade são WhatsApp, Telegram, Discord, Slack, Facebook, LinkedIn, Meetup, Reddit, GitHub Discussions, Discourse, Circle, Mighty Networks, site próprio e outra plataforma. Modalidades: `online`, `in-person` e `hybrid`. Campos: `communityPlatforms` (array com ao menos uma plataforma) e `communityModality`. Categorias continuam em `areas`. O alcance, a plataforma e a modalidade são dimensões independentes: uma comunidade nacional pode ter encontros presenciais e usar Discord. As plataformas não são inferidas pelo link nem pelo idioma.
- `POST /api/contributions` usa a credencial do visitante e valida CSRF. Criadores, YouTube e comunidades retornam `{kind:"catalog",url:"https://github.com/.../pull/..."}`: o servidor prepara o arquivo validado e abre um Pull Request, sem publicar Discussion nem invalidar a lista do fórum. Mantenedores usam um branch no catálogo. Visitantes usam uma cópia pública na própria conta, criada ou reutilizada após conferir a origem. A proposta parte da revisão atual do catálogo e preserva todos os metadados. Nenhuma proposta é mesclada automaticamente. As demais categorias retornam `{kind:"discussion",number:...}` e mantêm o fluxo de conversa e aprovação. Falhas preservam o formulário.
- O script público `theme.js`, carregado antes dos estilos, aplica o tema salvo e prepara a entrada das rotas. O GSAP revela o conteúdo em 450 ms. Componentes novos, diálogos e menus mantêm suas animações. Movimento reduzido exibe tudo imediatamente. Se o bundle não carregar, o conteúdo é liberado após 1,5 segundo. O teste de navegação registra quadros de entradas nos dois temas e verifica que a opacidade progride sem voltar a ocultar o conteúdo.

### docs/github-organization.md

**Antes**

- A organização [guia-da-ti](https://github.com/guia-da-ti) é proprietária dos dois repositórios do projeto. A transferência foi verificada em 5 de outubro de 2026: os commits anteriores foram preservados e o GitHub Discussions continua ativado no repositório de dados. Na verificação final, a aplicação estava privada e o repositório de dados estava público.

**Depois**

- A organização [guia-da-ti](https://github.com/guia-da-ti) é proprietária dos dois repositórios do projeto. A transferência foi verificada em 5 de outubro de 2026. Os commits anteriores foram preservados e o GitHub Discussions continua ativado no repositório de dados. Na verificação final, a aplicação estava privada e o repositório de dados estava público.

### tools/catalog/README.md

**Antes**

- Este diretório contém o contrato aceito pela aplicação e seu validador confiável. Ele lê somente os JSONs de `database/data`, produzindo `dist/catalog.json`. Não importa módulos nem executa scripts do submódulo.
- O schema e a taxonomia aqui representam a versão que a aplicação suporta. Ao ampliar campos ou IDs no repositório de dados, atualize também este contrato e seus testes antes de atualizar o submódulo. Cadastros permanecem exclusivamente em `guia-da-ti-dados`; não copie o catálogo para cá.

**Depois**

- Este diretório contém o contrato aceito pela aplicação e seu validador confiável. Ele lê somente os JSONs de `database/data` e gera `dist/catalog.json`. Não importa módulos nem executa scripts do submódulo.
- O schema e a taxonomia aqui representam a versão que a aplicação suporta. Ao ampliar campos ou IDs no repositório de dados, atualize também este contrato e seus testes antes de atualizar o submódulo. Cadastros permanecem exclusivamente em `guia-da-ti-dados`. Não copie o catálogo para cá.

### web/README.md

**Antes**

- React/TypeScript com Tailwind e shadcn/ui no frontend; ASP.NET Core 10 no backend. O build gera HTML para cada rota conhecida. A API oferece consultas paginadas sem banco de dados.
- O snapshot precisa permanecer disponível para a API na inicialização. A publicação deve substituir o diretório de arquivos públicos inteiro, evitando manter páginas removidas de builds anteriores. A automação de deploy será adicionada em uma fase posterior.

**Depois**

- React/TypeScript com Tailwind e shadcn/ui no frontend. ASP.NET Core 10 no backend. O build gera HTML para cada rota conhecida. A API oferece consultas paginadas sem banco de dados.
- O snapshot precisa permanecer disponível para a API na inicialização. A publicação deve substituir todo o diretório de arquivos públicos. Isso remove páginas que não existem mais no build. A automação de deploy será adicionada em uma fase posterior.

### web/frontend/src/App.tsx

**Antes**

- As indicações vão além da programação e incluem dados, segurança, infraestrutura, redes, hardware, design, produto e inteligência artificial.
- O catálogo é público e seu histórico pode ser consultado no GitHub. Não é necessário criar uma conta para explorar o guia.

**Depois**

- Você encontra indicações de programação, dados, segurança, infraestrutura, redes, hardware, design, produto e inteligência artificial.
- Você pode consultar o catálogo e seu histórico no GitHub. Para explorar o guia, não precisa criar uma conta.

### web/frontend/src/Discussions.tsx

**Antes**

- Estamos preparando este espaço para trocar experiências, tirar dúvidas e compartilhar ideias.

**Depois**

- Estamos preparando o fórum para você tirar dúvidas e compartilhar experiências.

### web/frontend/src/Maintainers.tsx

**Antes**

- Autores de contribuições nos repositórios públicos do Guia, reconhecidos pelo GitHub.

**Depois**

- O GitHub reúne aqui quem contribuiu com alterações nos repositórios públicos do Guia.

### web/frontend/src/Participation.tsx

**Antes**

- Sua mensagem será pública no Guia e no GitHub, em nome de
- Entre com GitHub para sugerir um recurso. Criadores e comunidades vão para revisão do catálogo; as demais sugestões abrem uma conversa no fórum.
- A sugestão vai para revisão dos mantenedores e entra no catálogo após a aprovação. Ela não abre uma conversa no fórum. Para enviar, o GitHub pode preparar uma cópia do catálogo na sua conta.
- A publicação cria uma conversa em Ideias. A comunidade pode comentar ali; após a revisão, a aprovação prepara estes dados no catálogo.
- Pull Request criado:

**Depois**

- Sua mensagem aparecerá no Guia e no GitHub com o nome de
- Entre com GitHub para sugerir um recurso. Criadores e comunidades vão para revisão do catálogo. As demais sugestões abrem uma conversa no fórum.
- Os mantenedores revisam sua sugestão antes de adicioná-la ao catálogo. Criadores e comunidades não abrem conversas no fórum. O GitHub pode criar uma cópia do catálogo na sua conta para enviar a proposta.
- Sua sugestão abre uma conversa em Ideias, onde a comunidade pode comentar. Após a revisão, um mantenedor prepara o cadastro para entrar no catálogo.
- Proposta de cadastro criada:

### web/frontend/src/Study.tsx

**Antes**

- Uma avaliação e um hype por conta. As interações somam comentários, avaliações e hypes.
- Seu comentário será público no Guia e no GitHub, em nome de

**Depois**

- Você pode dar uma nota e um hype por conta. As interações somam comentários, avaliações e hypes.
- Seu comentário aparecerá no Guia e no GitHub com o nome de

### web/frontend/src/SuggestResource.tsx

**Antes**

- projeto open source

**Depois**

- projeto de código aberto

### web/frontend/src/auth-complete.tsx

**Antes**

- A autorização terminou. Você pode fechar esta janela e continuar na página do Guia.

**Depois**

- A autorização terminou. Feche esta janela e continue no Guia.

### web/frontend/src/catalog.ts

**Antes**

- Conheça o Guia da TI, um catálogo de links para sites de tecnologia e um fórum para trocar conhecimento com a comunidade.

**Depois**

- Conheça o Guia da TI. Encontre links de tecnologia e troque experiências no fórum da comunidade.

### web/frontend/src/creator-categories.ts

**Antes**

- Lifestyle

**Depois**

- Estilo de vida

### database/CONTRIBUTING.md

**Antes**

- 4. Use a URL oficial HTTPS. Procure por nome e URL antes de criar um cadastro; atualize o existente se já houver.
- Para identificar recursos associados a um país, adicione `countries` com os códigos ISO de duas letras, por exemplo `"countries": ["US"]`. Marque o país do contexto ou público do recurso conforme a sua categoria e as fontes disponíveis; não deduza o país pelo idioma. Esse campo é opcional.
- Consulte os [tipos e caminhos de cadastro](docs/categories.md). As novas categorias usam o mesmo schema base. Crie a pasta do tipo quando adicionar o primeiro recurso; uma pasta vazia não precisa de arquivo de exemplo. Não inclua arquivos `.gitkeep` dentro de `data/`, pois o validador aceita apenas registros JSON.
- Os arquivos com `demo: true` são exemplos fictícios. Não use essa marca para recursos reais. A verificação automática valida formato e referências; a revisão humana confirma legitimidade, URLs, imagens e conteúdo.

**Depois**

- 4. Use a URL oficial HTTPS. Procure por nome e URL antes de criar um cadastro. Atualize o existente se já houver.
- Para identificar recursos associados a um país, adicione `countries` com os códigos ISO de duas letras, por exemplo `"countries": ["US"]`. Marque o país do contexto ou público do recurso conforme a sua categoria e as fontes disponíveis. Não deduza o país pelo idioma. Esse campo é opcional.
- Consulte os [tipos e caminhos de cadastro](docs/categories.md). As novas categorias usam o mesmo schema base. Crie a pasta do tipo quando adicionar o primeiro recurso. Uma pasta vazia não precisa de arquivo de exemplo. Não inclua arquivos `.gitkeep` dentro de `data/`, pois o validador aceita apenas registros JSON.
- Os arquivos com `demo: true` são exemplos fictícios. Não use essa marca para recursos reais. A verificação automática valida formato e referências. A revisão humana confirma legitimidade, URLs, imagens e conteúdo.

### database/README.md

**Antes**

- Catálogo público que alimenta o [Guia da TI](https://github.com/guia-da-ti/guia-da-ti). O código do site fica no outro repositório; aqui a comunidade adiciona e corrige recursos.

**Depois**

- Catálogo público que alimenta o [Guia da TI](https://github.com/guia-da-ti/guia-da-ti). O código do site fica no outro repositório. Aqui você adiciona e corrige recursos.

### database/docs/curadoria/comunidades-2026-10-07.md

**Antes**

- Foram consultados sites e repositórios oficiais. O cadastro reúne plataformas e links públicos vinculados à comunidade, sem entrar em grupos nem publicar mensagens. Plataforma indica onde a comunidade se comunica ou mantém seu espaço público; páginas de LinkedIn, canais de WhatsApp e organizações GitHub não são necessariamente salas de conversa. Nenhum tamanho de grupo foi copiado como contador de usuários do Guia. Convites podem exigir cadastro, aprovação ou ser alterados pelos organizadores.
- Público é a proposta declarada da comunidade, não uma inferência sobre seus participantes. Geral não significa masculina. Não foi encontrada nesta seleção uma comunidade de tecnologia explicitamente masculina com fonte suficiente; o filtro e o cadastro aceitam essa opção, com estado vazio quando não houver resultado.
- FullDev fica no topo quando atende aos filtros, com alcance nacional informado pelo responsável. As demais entradas são ordenadas alfabeticamente. Queens of Deploy e RainbowStack são espaços separados anunciados no site da FullDev e foram classificados pelo público declarado. Seus links foram conferidos no módulo público da página inicial, main-2XA4W5F5.js e chunk-P6KXK226.js; o link do grupo geral foi associado ao registro rotulado como grupo principal, sem confundi-lo com os subgrupos.
- A rede PyLadies Brasil foi cadastrada como nacional, enquanto seus capítulos locais têm atuação própria. Os grupos Python, Django, FastAPI e Data Science foram selecionados no diretório oficial da Python Brasil; o recorte nacional descreve essa comunidade em português, sem afirmar que só brasileiros podem participar. WoMakersCode, Out in Tech, tech.lgbt e freeCodeCamp foram classificados como internacionais conforme a apresentação de suas redes. PHPSP tem atuação regional em SP. Modalidade é uma classificação editorial baseada nos espaços online e nos encontros apresentados pelas fontes, sem garantir agenda atual.
- communityAudience aceita general, male, female e lgbt. communityPlatforms aceita várias opções; communityLinks armazena um link HTTPS público para cada plataforma, sem plataformas repetidas ou links para opções desmarcadas. Os campos são exigidos nas novas sugestões. Registros antigos sem esses campos continuam válidos, mas não recebem público presumido quando há filtro ativo. O exemplo completo está em templates/comunidade-exemplo.json.

**Depois**

- Foram consultados sites e repositórios oficiais. O cadastro reúne plataformas e links públicos vinculados à comunidade, sem entrar em grupos nem publicar mensagens. Plataforma indica onde a comunidade se comunica ou mantém seu espaço público. Páginas de LinkedIn, canais de WhatsApp e organizações GitHub não são necessariamente salas de conversa. Nenhum tamanho de grupo foi copiado como contador de usuários do Guia. Convites podem exigir cadastro, aprovação ou ser alterados pelos organizadores.
- Público é a proposta declarada da comunidade, não uma inferência sobre seus participantes. Geral não significa masculina. Não foi encontrada nesta seleção uma comunidade de tecnologia explicitamente masculina com fonte suficiente. O filtro e o cadastro aceitam essa opção, com estado vazio quando não houver resultado.
- FullDev fica no topo quando atende aos filtros, com alcance nacional informado pelo responsável. As demais entradas são ordenadas alfabeticamente. Queens of Deploy e RainbowStack são espaços separados anunciados no site da FullDev e foram classificados pelo público declarado. Seus links foram conferidos no módulo público da página inicial, main-2XA4W5F5.js e chunk-P6KXK226.js. O link do grupo geral foi associado ao registro rotulado como grupo principal, sem confundi-lo com os subgrupos.
- A rede PyLadies Brasil foi cadastrada como nacional, enquanto seus capítulos locais têm atuação própria. Os grupos Python, Django, FastAPI e Data Science foram selecionados no diretório oficial da Python Brasil. O recorte nacional descreve essa comunidade em português, sem afirmar que só brasileiros podem participar. WoMakersCode, Out in Tech, tech.lgbt e freeCodeCamp foram classificados como internacionais conforme a apresentação de suas redes. PHPSP tem atuação regional em SP. Modalidade é uma classificação editorial baseada nos espaços online e nos encontros apresentados pelas fontes, sem garantir agenda atual.
- communityAudience aceita general, male, female e lgbt. communityPlatforms aceita várias opções. CommunityLinks armazena um link HTTPS público para cada plataforma, sem plataformas repetidas ou links para opções desmarcadas. Os campos são exigidos nas novas sugestões. Registros antigos sem esses campos continuam válidos, mas não recebem público presumido quando há filtro ativo. O exemplo completo está em templates/comunidade-exemplo.json.

### database/docs/curadoria/instagram-2026-10-06.md

**Antes**

- Prioridade para conteúdo em português relacionado ao estudo e ao trabalho em tecnologia. A busca combinou nomes conhecidos, descoberta em diretórios e consulta a sites, páginas de links e repositórios dos próprios autores. As descrições são editoriais e resumem o acervo identificado; não são cópias das bios. As áreas são classificações do Guia da TI.
- - Contas de projetos com conteúdo autoral identificadas como projetos; perfis de cotidiano descritos como complemento.
- A página Alura Stars foi usada para seis apresentações dos próprios participantes e os respectivos links. Essa confirmação identifica pessoa e tema; não comprova frequência ou profundidade do feed.
- O acesso público ao Instagram foi bloqueado em consultas diretas. Os endereços foram cruzados com fontes públicas; não houve auditoria integral de Reels, Stories, atividade recente ou frequência de publicação. Não se afirma que todo material do site ou do YouTube também está no Instagram. Fontes antigas, quando usadas, estão apontadas abaixo.
- @devlucaspedro foi incluído por solicitação do titular. Seu cadastro permanece com descrição neutra e área Geral; especialidades e demais dados dependem de confirmação pública ou informações do titular.
- As fontes desta tabela sustentam a identidade, o endereço e o recorte do cadastro. “Abrir perfil” leva ao Instagram; as fontes externas permitem conferir e aprofundar.
- Esses são materiais externos consultados; o código não foi executado e os vídeos não foram integralmente assistidos nesta pesquisa.
- Código Fonte TV, Diego Fernandes, Mario Souto, Glaucia Lemos e Julio de Lima ficam para uma próxima revisão: nesta rodada a cadeia de confirmação de identidade, endereço e conteúdo do Instagram não foi concluída para esses candidatos. Isso não é avaliação negativa do conteúdo. QA tem cobertura limitada nesta seleção; redes, hardware especializado e perfis internacionais ainda precisam de uma rodada específica.
- Revisar mudanças de handle, links quebrados e alterações de foco antes de ampliar a seleção. A data updatedAt indica a revisão editorial do cadastro; não é a data do último post nem uma garantia de atividade. Atualizar este relatório junto dos JSONs quando houver novas evidências.

**Depois**

- Prioridade para conteúdo em português relacionado ao estudo e ao trabalho em tecnologia. A busca combinou nomes conhecidos, descoberta em diretórios e consulta a sites, páginas de links e repositórios dos próprios autores. As descrições são editoriais e resumem o acervo identificado. Não são cópias das bios. As áreas são classificações do Guia da TI.
- - Contas de projetos com conteúdo autoral identificadas como projetos. Perfis de cotidiano descritos como complemento.
- A página Alura Stars foi usada para seis apresentações dos próprios participantes e os respectivos links. Essa confirmação identifica pessoa e tema. Não comprova frequência ou profundidade do feed.
- O acesso público ao Instagram foi bloqueado em consultas diretas. Os endereços foram cruzados com fontes públicas. Não houve auditoria integral de Reels, Stories, atividade recente ou frequência de publicação. Não se afirma que todo material do site ou do YouTube também está no Instagram. Fontes antigas, quando usadas, estão apontadas abaixo.
- @devlucaspedro foi incluído por solicitação do titular. Seu cadastro permanece com descrição neutra e área Geral. Especialidades e demais dados dependem de confirmação pública ou informações do titular.
- As fontes desta tabela sustentam a identidade, o endereço e o recorte do cadastro. “Abrir perfil” leva ao Instagram. As fontes externas permitem conferir e aprofundar.
- Esses são materiais externos consultados. O código não foi executado e os vídeos não foram integralmente assistidos nesta pesquisa.
- Código Fonte TV, Diego Fernandes, Mario Souto, Glaucia Lemos e Julio de Lima ficam para uma próxima revisão: nesta rodada a cadeia de confirmação de identidade, endereço e conteúdo do Instagram não foi concluída para esses candidatos. Isso não é avaliação negativa do conteúdo. QA tem cobertura limitada nesta seleção. Redes, hardware especializado e perfis internacionais ainda precisam de uma rodada específica.
- Revisar mudanças de handle, links quebrados e alterações de foco antes de ampliar a seleção. A data updatedAt indica a revisão editorial do cadastro. Não é a data do último post nem uma garantia de atividade. Atualizar este relatório junto dos JSONs quando houver novas evidências.

### database/docs/curadoria/linkedin-tiktok-twitter-2026-10-06.md

**Antes**

- Seleção em português sobre programação, carreira, dados, design, segurança, infraestrutura e educação. Foram consultados sites dos autores, perfis públicos no GitHub e a página oficial do programa Alura Stars. Cada endereço aparece vinculado à pessoa ou ao projeto na fonte indicada; não foram gerados handles por aproximação com nomes ou com outras redes. Links de Twitter foram normalizados para X sem alterar o identificador. Foram descartados links de intenção de seguir e páginas empresariais do LinkedIn, pois o cadastro de perfil usa /in/.
- Descrições e categorias são classificações editoriais da atuação pública do autor, apoiadas nas fontes; não são transcrições da bio nem afirmações sobre cada publicação em cada rede. Nenhuma categoria Humor foi atribuída por suposição. Os perfis de Lucas Pedro ficaram em Outra até haver confirmação do recorte de conteúdo de cada rede; seu LinkedIn também foi localizado no GitHub autoral. TikTok e X foram incluídos pela indicação expressa do titular.

**Depois**

- Seleção em português sobre programação, carreira, dados, design, segurança, infraestrutura e educação. Foram consultados sites dos autores, perfis públicos no GitHub e a página oficial do programa Alura Stars. Cada endereço aparece vinculado à pessoa ou ao projeto na fonte indicada. Não foram gerados handles por aproximação com nomes ou com outras redes. Links de Twitter foram normalizados para X sem alterar o identificador. Foram descartados links de intenção de seguir e páginas empresariais do LinkedIn, pois o cadastro de perfil usa /in/.
- Descrições e categorias são classificações editoriais da atuação pública do autor, apoiadas nas fontes. Não são transcrições da bio nem afirmações sobre cada publicação em cada rede. Nenhuma categoria Humor foi atribuída por suposição. Os perfis de Lucas Pedro ficaram em Outra até haver confirmação do recorte de conteúdo de cada rede. Seu LinkedIn também foi localizado no GitHub autoral. TikTok e X foram incluídos pela indicação expressa do titular.

### database/docs/curadoria/youtube-2026-10-06.md

**Antes**

- Pesquisa realizada em 6 de outubro de 2026. Seleção inicial: 28 canais reais em português, incluindo @devlucaspedro. O canal fictício de demonstração foi substituído pelos cadastros reais; o modelo de cadastro continua em templates/canal-exemplo.json.
- As fontes abaixo confirmam identidade e tema; a inclusão não significa que todos os vídeos foram assistidos ou avaliados. Playlists ou cursos exclusivos para membros são mencionados quando essa distinção aparece publicamente. Fotos e inscritos continuam sendo consultados pelo mecanismo de perfis do site, quando a plataforma disponibiliza os campos. Nenhum número de inscritos foi estimado ou fixado no catálogo.
- - Rafaella Ballerini: o endereço do canal está vinculado em seu GitHub; os vídeos públicos incluem automação e projetos.
- - Plataformas com cursos comerciais, como balta.io, Rocketseat e Hashtag, foram identificadas como projetos educacionais; o cadastro aponta para o canal, sem prometer que todo o catálogo comercial seja gratuito.

**Depois**

- Pesquisa realizada em 6 de outubro de 2026. Seleção inicial: 28 canais reais em português, incluindo @devlucaspedro. O canal fictício de demonstração foi substituído pelos cadastros reais. O modelo de cadastro continua em templates/canal-exemplo.json.
- As fontes abaixo confirmam identidade e tema. A inclusão não significa que todos os vídeos foram assistidos ou avaliados. Playlists ou cursos exclusivos para membros são mencionados quando essa distinção aparece publicamente. Fotos e inscritos continuam sendo consultados pelo mecanismo de perfis do site, quando a plataforma disponibiliza os campos. Nenhum número de inscritos foi estimado ou fixado no catálogo.
- - Rafaella Ballerini: o endereço do canal está vinculado em seu GitHub. Os vídeos públicos incluem automação e projetos.
- - Plataformas com cursos comerciais, como balta.io, Rocketseat e Hashtag, foram identificadas como projetos educacionais. O cadastro aponta para o canal, sem prometer que todo o catálogo comercial seja gratuito.

### database/docs/editorial.md

**Antes**

- - Use `countries` (ISO 3166-1 alpha-2, como `US`) para associar o recurso ao seu contexto/público quando puder confirmar; país não é inferido pelo idioma.
- - Pesquise nome e URL antes de adicionar; corrija o cadastro existente quando houver duplicação.
- Use `communityLocation` somente em comunidades. Informe o alcance confirmado: `regional` com `states` (siglas de UFs oficiais, por exemplo `["SP", "RJ"]`); `national` para atuação em todo o Brasil; ou `international` para comunidades globais ou de fora do Brasil. Nacional e internacional não usam `states`. Idioma e país não definem o alcance automaticamente. Os cadastros antigos sem este campo continuam válidos, mas não aparecem nos filtros por localização até serem revisados.
- Novas sugestões de comunidades exigem a categoria em `areas`, `communityPlatforms` (uma ou várias plataformas do schema), `communityLinks` (um link público HTTPS para cada plataforma marcada), `communityAudience` (`general`, `male`, `female` ou `lgbt`) e `communityModality` (`online`, `in-person` ou `hybrid`). Plataforma é onde a comunidade conversa ou mantém seu espaço público; modalidade descreve como os encontros acontecem. Um grupo presencial também pode usar WhatsApp.
- Classifique o público pela proposta declarada pela comunidade. Não presuma gênero ou orientação dos participantes: uma comunidade geral não é masculina. Links de plataformas não podem repetir a mesma plataforma nem incluir opções que não estejam em `communityPlatforms`. Registros antigos sem esses campos continuam válidos para migração e aparecem sem filtros; campos ausentes não recebem classificação presumida. A FullDev aparece primeiro quando atende aos filtros; as demais comunidades são ordenadas alfabeticamente.
- Perfis em creators e youtube usam creatorCategories para os tipos de conteúdo, separadamente de areas (assuntos técnicos). Os valores disponíveis são education (Tutoriais e educação), career (Carreira), humor (Humor), lifestyle (Lifestyle), news (Notícias), reviews (Análises e opiniões), projects (Projetos e bastidores) e other (Outra). É possível escolher várias categorias, sem repetições.
- O formulário do Guia exige pelo menos uma categoria ao sugerir um perfil. Confirme as categorias com o conteúdo público do criador; não deduza Humor ou Lifestyle apenas por popularidade. Cadastros antigos sem classificação continuam válidos e aparecem como Categoria não informada até a revisão.

**Depois**

- - Use `countries` (ISO 3166-1 alpha-2, como `US`) para associar o recurso ao seu contexto/público quando puder confirmar. País não é inferido pelo idioma.
- - Pesquise nome e URL antes de adicionar. Corrija o cadastro existente quando houver duplicação.
- Use `communityLocation` somente em comunidades. Informe o alcance confirmado:
- - `regional`, com `states` para as siglas de UFs oficiais, por exemplo `["SP", "RJ"]`.
- - `national`, para atuação em todo o Brasil.
- - `international`, para comunidades globais ou de fora do Brasil.
-  Nacional e internacional não usam `states`. Idioma e país não definem o alcance automaticamente. Os cadastros antigos sem este campo continuam válidos, mas não aparecem nos filtros por localização até serem revisados.
- Novas sugestões de comunidades exigem a categoria em `areas`, `communityPlatforms` (uma ou várias plataformas do schema), `communityLinks` (um link público HTTPS para cada plataforma marcada), `communityAudience` (`general`, `male`, `female` ou `lgbt`) e `communityModality` (`online`, `in-person` ou `hybrid`). Plataforma é onde a comunidade conversa ou mantém seu espaço público. Modalidade descreve como os encontros acontecem. Um grupo presencial também pode usar WhatsApp.
- Classifique o público pela proposta declarada pela comunidade. Não presuma gênero ou orientação dos participantes. Uma comunidade geral não é masculina. Links de plataformas não podem repetir a mesma plataforma nem incluir opções que não estejam em `communityPlatforms`. Registros antigos sem esses campos continuam válidos para migração e aparecem sem filtros. Campos ausentes não recebem classificação presumida. A FullDev aparece primeiro quando atende aos filtros. As demais comunidades são ordenadas alfabeticamente.
- Perfis em creators e youtube usam creatorCategories para os tipos de conteúdo, separadamente de areas (assuntos técnicos). Os valores disponíveis são education (Tutoriais e educação), career (Carreira), humor (Humor), lifestyle (Lifestyle), news (Notícias), reviews (Análises e opiniões), projects (Projetos e bastidores) e other (Outra). Você pode escolher várias categorias, sem repetir a mesma opção.
- O formulário do Guia exige pelo menos uma categoria ao sugerir um perfil. Confirme as categorias com o conteúdo público do criador. Não deduza Humor ou Lifestyle apenas por popularidade. Cadastros antigos sem classificação continuam válidos e aparecem como Categoria não informada até a revisão.

## Trechos mantidos

“Preencha os dados e confira a prévia antes de enviar sua sugestão”, “O conteúdo fica no site de origem” e “Cada navegador conta uma vez” já estavam claros. Os estados vazios, nomes de redes e termos de produto, como hype, foram mantidos quando não exigiam revisão.

JSON, código, contratos da API, identificadores, blocos de código e tabelas de caminhos ficaram fora da revisão. Os relatórios anteriores de humanização e o guia original foram preservados como histórico. A revisão de estilo não altera as decisões de arquitetura nem comprova que informações históricas continuam atuais.

## Correção da sessão

- O novo aviso ficou “Não foi possível verificar seu login. Tentaremos novamente.” Diz o que aconteceu e o próximo passo, sem culpar você.
- O README agora diz “A sessão dura sete dias e renova a validade durante o uso”. O prazo e o efeito substituem uma descrição vaga.
- As instruções “Preserve toda a pasta nas atualizações” e “Restrinja o acesso ao usuário que executa o servidor” usam voz ativa.
- Os novos trechos usam frases curtas. Não exigiram mudanças de travessão, ponto e vírgula ou anglicismos.

## Dicas para usar o Guia

- Cada seção recebeu instruções em frases curtas, com ações como “Escolha”, “Pesquise” e “Abra”. Os novos trechos já seguem voz ativa.
- “Encontre links, participe das conversas e compartilhe suas indicações” virou “Encontre links e veja como participar da comunidade”. A descrição do diálogo perdeu uma sequência de três ações.
- Os botões nomeiam seus destinos, como “Ver comunidades” e “Abrir fórum”. As instruções deixam claro que o conteúdo fica no site de origem.
- O aviso “A animação não carregou. As instruções estão abaixo” informa o ocorrido e mostra onde continuar. Não exigiu outra mudança.
- A barra usa “Novo por aqui? Veja as dicas para usar o Guia” e “Fechar barra de dicas”. Os trechos já estavam curtos e descrevem a ação.
- “O navegador salva essa escolha e mantém a barra oculta nas próximas visitas” explica o efeito de fechar a barra, sem usar “cache” no texto da interface.

## Dicas das seções, Sobre e GitHub

- “Tirar dúvidas, trocar experiências e conhecer pessoas com interesses parecidos” virou “tirar dúvidas e trocar experiências com pessoas de interesses parecidos”. A frase perdeu uma sequência de três ações.
- As dicas orientam você com verbos como “Compare”, “Confira” e “Leia”. Os textos explicam por que participar e como escolher sem prometer resultados.
- Os passos “Crie sua conta no GitHub”, “Volte ao Guia e entre” e “Participe com sua conta” usam voz ativa. Os novos trechos já estavam curtos.
- A explicação de Sobre mantém “guia de links” e “página de origem”. As instruções do GitHub dizem que o nome e as publicações ficam públicos.
