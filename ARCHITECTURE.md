# Guia da TI — arquitetura

## Decisões

A stack definida é C#/.NET 10, React com TypeScript, Tailwind e shadcn/ui. O guia original está em `guia.md.txt` e foi preservado. Não haverá banco de dados, autenticação ou painel administrativo no MVP.

Dois diretórios representam dois futuros repositórios independentes: `web/` contém a aplicação e `database/` contém dados, schemas, taxonomia e validação. A publicação inicial usa o repositório unificado `LucasPedruo/guia-da-ti`, conforme destino indicado. Os repositórios separados e a licença ainda precisam ser definidos.

## Dados e segurança

Cada cadastro é um JSON em `data/<tipo>/<slug>.json`. O schema base exige slug, tipo, nome, resumo, descrição, URL HTTPS, áreas, tecnologias, idiomas e data de atualização. Campos desconhecidos são rejeitados; tamanhos e vocabulários são limitados. A validação verifica nomes de arquivos, referências à taxonomia e duplicados por URL normalizada. URLs privadas, credenciais e protocolos executáveis são rejeitados. A validação não acessa URLs: disponibilidade e legitimidade exigem revisão humana.

A taxonomia central usa IDs estáveis para áreas, tecnologias, idiomas e tipos. Localizações e schemas específicos por tipo serão ampliados na próxima fase. Não atribuir cidades a comunidades online. Nenhum conteúdo contribuído é executado como HTML, script ou código.

## Consumo e deploy

O validador produz `dist/catalog.json`. A aplicação aceita esse snapshot por `CATALOG_PATH`; no desenvolvimento, usa o diretório irmão `database`. O frontend consome o snapshot no build e gera HTML com React para cada rota conhecida. C# carrega o mesmo snapshot uma vez na inicialização, oferece API de leitura e serve os arquivos gerados. Um deploy deve publicar HTML e snapshot juntos, com reinício da aplicação; isso evita divergência entre busca e páginas.

Sincronização proposta: uma Action agendada no repositório da aplicação faz checkout de um commit aprovado do repositório de dados, valida, gera o catálogo e publica um artefato imutável. Executar somente os scripts confiáveis da aplicação nessa integração, nunca scripts do checkout externo. O SHA dos dados deve ser registrado no deploy. Integração remota e deploy ficam para uma fase posterior, após definir repositórios e VPS.

## Rotas

Primeira entrega: `/`, `/explorar`, `/contribuir`, categorias do MVP e páginas individuais; `/areas/:id` e `/tecnologias/:id`. API: `/api/resources` (busca e tipo), `/api/resources/{type}/{slug}` e `/health`. Páginas desconhecidas retornam 404. HTML gerado inclui title, description, canonical, Open Graph, sitemap e robots. Busca interativa filtra o snapshot consolidado, sem milhares de downloads.

MVP completo: comunidades, cursos, roadmaps, criadores e YouTube. A central de comunidades receberá mapa Leaflet carregado sob demanda, clusters e filtros geográficos na fase seguinte. Demais categorias, favoritos, login, avaliações, eventos e oportunidades são posteriores ao MVP.

## Contribuição

Fork → JSON individual → validação automática → PR → revisão humana → merge → build/deploy. O repositório de dados inclui guia, template e CI. Os links de contribuição só apontam ao GitHub quando `VITE_DATA_REPOSITORY` estiver configurado. Até lá, o site mostra instruções locais. Dados de demonstração são explicitamente fictícios e não devem ser publicados como cadastros verificados.

## Referências técnicas

- https://vite.dev/guide/ssr.html (pré-renderização com React no build)
- https://ui.shadcn.com/docs/installation/manual (componentes locais)
- https://learn.microsoft.com/aspnet/core/fundamentals/static-files?view=aspnetcore-10.0
