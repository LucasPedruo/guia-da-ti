# Guia da TI — arquitetura

## Decisões

A stack definida é C#/.NET 10, React com TypeScript, Tailwind e shadcn/ui. O guia original está em `guia.md.txt` e foi preservado. Não há banco de dados nem painel administrativo. A participação no fórum pode usar autenticação GitHub.

Dois repositórios independentes: `guia-da-ti/guia-da-ti` contém a aplicação e `guia-da-ti/guia-da-ti-dados` centraliza o catálogo público e as conversas da comunidade no GitHub Discussions. A integração do catálogo é um submódulo Git em `database/`, fixado em um commit reproduzível; as conversas são consultadas pela API do GitHub. A licença ainda precisa ser definida.

## Dados e segurança

Cada cadastro é um JSON em `data/<tipo>/<slug>.json`. O schema base exige slug, tipo, nome, resumo, descrição, URL HTTPS, áreas, tecnologias, idiomas e data de atualização. Campos desconhecidos são rejeitados; tamanhos e vocabulários são limitados. A validação verifica nomes de arquivos, referências à taxonomia e duplicados por URL normalizada. URLs privadas, credenciais e protocolos executáveis são rejeitados. A validação não acessa URLs: disponibilidade e legitimidade exigem revisão humana.

A taxonomia central usa IDs estáveis para áreas, tecnologias, idiomas e tipos. Localizações e schemas específicos por tipo serão ampliados na próxima fase. Não atribuir cidades a comunidades online. Nenhum conteúdo contribuído é executado como HTML, script ou código.

## Consumo e deploy

O validador confiável em `tools/catalog` lê somente os JSONs de `database/data` e produz `tools/catalog/dist/catalog.json`. Schema e taxonomia aceitos ficam na aplicação; mudanças de contrato exigem coordenação nos dois repositórios. O frontend gera HTML no build e C# carrega o mesmo snapshot na inicialização. HTML e catálogo devem ser publicados juntos. `CATALOG_PATH` permite configurar outro snapshot validado.

O workflow raiz valida pushes e PRs usando o commit fixado. Execuções agendadas a cada hora e manuais consultam a main dos dados e geram um artefato com os SHAs de aplicação e catálogo. Nenhum script do submódulo é executado. O ponteiro versionado não muda automaticamente; `scripts/update-data.ps1` atualiza e valida esse ponteiro localmente. Deploy e proteção obrigatória de branch ainda precisam ser configurados. Agendamentos podem atrasar.

## Rotas

Primeira entrega: `/`, `/explorar`, `/contribuir`, categorias do MVP e páginas individuais; `/areas/:id` e `/tecnologias/:id`. API: `/api/resources` (busca e tipo), `/api/resources/{type}/{slug}` e `/health`. Páginas desconhecidas retornam 404. HTML gerado inclui title, description, canonical, Open Graph, sitemap e robots. Busca interativa filtra o snapshot consolidado, sem milhares de downloads.

A navegação oferece 32 categorias em seis grupos: Aprender, Conteúdos, Artigos e estudos, Comunidade, Praticar e Carreira, com expansão individual. Todas usam o schema base; campos específicos, mapa e filtros avançados continuam incrementais. `/sobre` concentra a apresentação do projeto. Favoritos e avaliações seguem fora do escopo atual.

O Início é dedicado ao GitHub Discussions. A API consulta um repositório público configurável via GraphQL, com credencial exclusiva do backend, timeout de dez segundos e cache de um minuto limitado a 128 consultas. `GET /api/discussions` lista tópicos por atividade com categoria e cursor; `GET /api/discussions/{numero}` lê tópico e comentários paginados. A interface distingue carregamento, ausência de configuração, lista vazia, erro e tópico inexistente. O endereço `/?conversa=NUMERO` abre uma conversa na home. Respostas encadeadas têm uma prévia de cinco itens e continuação no GitHub. Texto contribuído não é renderizado como HTML e comentários moderados são ocultados. Login OAuth permite criar tópicos, comentários e respostas pelo Guia, com token do visitante guardado na sessão do servidor, cookie HttpOnly e proteção CSRF. A credencial de leitura nunca é usada para publicar. Categorias são administradas no GitHub. Apoiadores aparecem na home e em página própria a partir de database/community.json validado no build. Contribuidores aparecem em Sobre e vêm da API do GitHub para os dois repositórios, com paginação, remoção de duplicados por ID e cache de uma hora.

Os componentes visuais são instalados do registry oficial shadcn/ui. Apenas o tema e a composição de páginas são locais. Os menus Radix precisam de estilos inline para posicionamento e controle de rolagem; a CSP permite estilos inline, mantendo scripts restritos à origem do site. Conteúdo do catálogo continua renderizado como texto.

O CSS global padroniza `cursor: pointer` nos controles interativos habilitados, incluindo menus e opções renderizados em portais Radix. Campos de texto mantêm seu cursor de edição e controles desabilitados não recebem o indicador de clique. A regra fica em `src/styles.css`, preservando os componentes do registry.

Idioma é um filtro global baseado nos idiomas declarados por cada registro. A opção English (United States) exige tanto o idioma inglês (`en`) quanto o país `US` explicitamente marcado no cadastro. O campo opcional `countries` usa códigos ISO 3166-1 alpha-2 e indica o país de contexto/público do recurso. A aplicação nunca infere país ou nacionalidade pelo idioma.

## Contribuição

Fork → JSON individual → PR → validação → revisão humana → merge → build → futuro deploy. O catálogo inclui guia, templates, formulário de sugestão e CI. Os links do site apontam por padrão para `guia-da-ti/guia-da-ti-dados`. Dados de demonstração são fictícios e não devem ser publicados como cadastros verificados.

## Referências técnicas

- https://vite.dev/guide/ssr.html (pré-renderização com React no build)
- https://ui.shadcn.com/docs/installation/manual (componentes locais)
- https://learn.microsoft.com/aspnet/core/fundamentals/static-files?view=aspnetcore-10.0
