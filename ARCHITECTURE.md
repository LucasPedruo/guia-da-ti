# Guia da TI — arquitetura

## Decisões

A stack definida é C#/.NET 10, React com TypeScript, Tailwind e shadcn/ui. O guia original está em `guia.md.txt` e foi preservado. Não haverá banco de dados, autenticação ou painel administrativo no MVP.

Dois repositórios independentes: `LucasPedruo/guia-da-ti` contém a aplicação e `LucasPedruo/guia-da-ti-dados` contém o catálogo público. A integração é um submódulo Git em `database/`, fixado em um commit reproduzível. A licença ainda precisa ser definida.

## Dados e segurança

Cada cadastro é um JSON em `data/<tipo>/<slug>.json`. O schema base exige slug, tipo, nome, resumo, descrição, URL HTTPS, áreas, tecnologias, idiomas e data de atualização. Campos desconhecidos são rejeitados; tamanhos e vocabulários são limitados. A validação verifica nomes de arquivos, referências à taxonomia e duplicados por URL normalizada. URLs privadas, credenciais e protocolos executáveis são rejeitados. A validação não acessa URLs: disponibilidade e legitimidade exigem revisão humana.

A taxonomia central usa IDs estáveis para áreas, tecnologias, idiomas e tipos. Localizações e schemas específicos por tipo serão ampliados na próxima fase. Não atribuir cidades a comunidades online. Nenhum conteúdo contribuído é executado como HTML, script ou código.

## Consumo e deploy

O validador confiável em `tools/catalog` lê somente os JSONs de `database/data` e produz `tools/catalog/dist/catalog.json`. Schema e taxonomia aceitos ficam na aplicação; mudanças de contrato exigem coordenação nos dois repositórios. O frontend gera HTML no build e C# carrega o mesmo snapshot na inicialização. HTML e catálogo devem ser publicados juntos. `CATALOG_PATH` permite configurar outro snapshot validado.

O workflow raiz valida pushes e PRs usando o commit fixado. Execuções agendadas a cada hora e manuais consultam a main dos dados e geram um artefato com os SHAs de aplicação e catálogo. Nenhum script do submódulo é executado. O ponteiro versionado não muda automaticamente; `scripts/update-data.ps1` atualiza e valida esse ponteiro localmente. Deploy e proteção obrigatória de branch ainda precisam ser configurados. Agendamentos podem atrasar.

## Rotas

Primeira entrega: `/`, `/explorar`, `/contribuir`, categorias do MVP e páginas individuais; `/areas/:id` e `/tecnologias/:id`. API: `/api/resources` (busca e tipo), `/api/resources/{type}/{slug}` e `/health`. Páginas desconhecidas retornam 404. HTML gerado inclui title, description, canonical, Open Graph, sitemap e robots. Busca interativa filtra o snapshot consolidado, sem milhares de downloads.

MVP completo: comunidades, cursos, roadmaps, criadores e YouTube. A central de comunidades receberá mapa Leaflet carregado sob demanda, clusters e filtros geográficos na fase seguinte. Demais categorias, favoritos, login, avaliações, eventos e oportunidades são posteriores ao MVP.

## Contribuição

Fork → JSON individual → PR → validação → revisão humana → merge → build → futuro deploy. O catálogo inclui guia, templates, formulário de sugestão e CI. Os links do site apontam por padrão para `LucasPedruo/guia-da-ti-dados`. Dados de demonstração são fictícios e não devem ser publicados como cadastros verificados.

## Referências técnicas

- https://vite.dev/guide/ssr.html (pré-renderização com React no build)
- https://ui.shadcn.com/docs/installation/manual (componentes locais)
- https://learn.microsoft.com/aspnet/core/fundamentals/static-files?view=aspnetcore-10.0
