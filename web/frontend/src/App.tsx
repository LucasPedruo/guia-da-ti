import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowUpRight, ChevronDown, Compass, Github, Moon, Search, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import { categories, groups, labels, normalize, pageInfo, resourcePath, resources, taxonomy, type Resource } from './catalog';

const repositoryValue = import.meta.env.VITE_DATA_REPOSITORY || 'https://github.com/LucasPedruo/guia-da-ti-dados';
const repository = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/.test(repositoryValue) ? repositoryValue.replace(/\/$/, '') : '';

function ResourceCard({ resource }: { resource: Resource }) {
  return (
    <Card className="h-full shadow-none">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{categories.find(c => c.id === resource.type)?.name}</Badge>
          {resource.demo && <Badge variant="outline">Exemplo fictício</Badge>}
        </div>
        <CardTitle className="pt-2 text-lg leading-snug">
          <Button asChild variant="link" className="h-auto p-0 text-left text-lg whitespace-normal text-foreground">
            <a href={resourcePath(resource)}>{resource.name}<ArrowUpRight className="shrink-0" /></a>
          </Button>
        </CardTitle>
        <CardDescription className="leading-relaxed">{resource.summary}</CardDescription>
      </CardHeader>
      <CardFooter className="mt-auto flex flex-wrap gap-2">
        {resource.areas.map(area => <Badge variant="outline" key={area}>{labels[area] || area}</Badge>)}
        {resource.countries?.map(country => <Badge variant="outline" key={country}>{labels[country] || country}</Badge>)}
      </CardFooter>
    </Card>
  );
}

export function App({ path }: { path: string }) {
  const page = pageInfo(path);
  const home = path === '/';
  const [query, setQuery] = useState('');
  const [type, setType] = useState(page.category?.id || 'all');
  const [locale, setLocale] = useState('all');
  const [dark, setDark] = useState(false);

  useEffect(() => {
    try { setDark(localStorage.getItem('theme') === 'dark'); } catch { /* Optional preference. */ }
    setQuery(new URLSearchParams(window.location.search).get('q') || '');
  }, []);
  useEffect(() => { document.documentElement.classList.toggle('dark', dark); }, [dark]);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    try { localStorage.setItem('theme', next ? 'dark' : 'light'); } catch { /* Optional preference. */ }
  }

  const tokens = normalize(query).trim().split(/\s+/).filter(Boolean);
  const selectedLocale: { language: string; country?: string } = locale === 'en-US' ? { language: 'en', country: 'US' } : { language: locale };
  const filtered = resources.filter(r =>
    (type === 'all' || r.type === type) &&
    (locale === 'all' || (r.languages.includes(selectedLocale.language) && (!selectedLocale.country || Boolean(r.countries?.includes(selectedLocale.country))))) &&
    (!page.area || r.areas.includes(page.area)) &&
    (!page.technology || r.technologies.includes(page.technology)) &&
    tokens.every(token => normalize([r.name, r.summary, r.description, ...r.areas, ...r.technologies, ...r.languages].join(' ')).includes(token))
  );

  return (
    <div className="min-h-svh">
      <Button asChild className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50">
        <a href="#conteudo">Pular para o conteúdo</a>
      </Button>
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Button asChild variant="ghost" className="h-auto px-0 text-xl font-bold tracking-tight hover:bg-transparent">
            <a href="/" aria-label="Guia da TI — página inicial"><Compass className="size-5 text-primary" />guiadati<span className="text-primary">.</span></a>
          </Button>
          <div className="flex items-center gap-1 xl:order-3">
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={dark ? 'Ativar tema claro' : 'Ativar tema escuro'}>
              {dark ? <Sun /> : <Moon />}
            </Button>
            <Button asChild variant="outline" size="sm"><a href="/contribuir">Contribuir</a></Button>
          </div>
          <nav aria-label="Principal" className="flex w-full flex-wrap items-center gap-1 xl:w-auto">
            <Button asChild variant={home ? 'secondary' : 'ghost'} size="sm"><a href="/" aria-current={home ? 'page' : undefined}>Home</a></Button>
            {groups.map(group => (
              <DropdownMenu key={group.id}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className={group.categories.some(c => c.id === page.category?.id) ? 'bg-accent' : ''}>
                    {group.name}<ChevronDown className="size-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  {group.categories.map(category => (
                    <DropdownMenuItem asChild key={category.id}>
                      <a href={`/${category.route}`} aria-current={category.id === page.category?.id ? 'page' : undefined}>{category.name}</a>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ))}
            <Button asChild variant={path === '/sobre' ? 'secondary' : 'ghost'} size="sm"><a href="/sobre" aria-current={path === '/sobre' ? 'page' : undefined}>Sobre</a></Button>
          </nav>
        </div>
      </header>

      <main id="conteudo" className="mx-auto min-h-[70vh] max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        {!page.valid ? (
          <Empty><EmptyHeader><EmptyTitle>Página não encontrada</EmptyTitle><EmptyDescription>Esse endereço não está no guia.</EmptyDescription></EmptyHeader><EmptyContent><Button asChild><a href="/">Voltar para a home</a></Button></EmptyContent></Empty>
        ) : path === '/sobre' ? (
          <article className="mx-auto max-w-2xl space-y-6">
            <h1 className="text-3xl font-semibold tracking-tight">Sobre o Guia da TI</h1>
            <p className="text-lg leading-relaxed">Um catálogo aberto para encontrar recursos de tecnologia, mantido com a ajuda da comunidade.</p>
            <p className="leading-relaxed text-muted-foreground">Aqui você encontra caminhos para aprender, se informar, aprofundar conhecimentos, conhecer pessoas, praticar e descobrir oportunidades. O guia vai além da programação: inclui dados, segurança, infraestrutura, redes, hardware, design, produto e inteligência artificial.</p>
            <Separator />
            <h2 className="text-xl font-semibold">Como funciona a curadoria</h2>
            <p className="leading-relaxed text-muted-foreground">Qualquer pessoa pode sugerir um recurso ou corrigir uma informação. As contribuições passam por revisão antes de entrar no catálogo. Você pode consultar a data de atualização de cada cadastro e propor correções.</p>
            <h2 className="text-xl font-semibold">Aberto e colaborativo</h2>
            <p className="leading-relaxed text-muted-foreground">O catálogo é público e seu histórico pode ser consultado no GitHub. Não é necessário criar uma conta para explorar o guia.</p>
            <p className="text-sm text-muted-foreground">Estamos começando. Os cadastros marcados como “Exemplo fictício” demonstram a navegação e não são recomendações de recursos reais.</p>
            <Button asChild variant="outline"><a href="/contribuir">Contribuir com o guia<ArrowUpRight /></a></Button>
          </article>
        ) : path === '/contribuir' ? (
          <article className="mx-auto max-w-2xl space-y-6">
            <h1 className="text-3xl font-semibold tracking-tight">Contribuir</h1>
            <p className="text-muted-foreground">Conhece um recurso ou encontrou uma informação desatualizada? Envie uma sugestão para revisão.</p>
            {repository ? <div className="flex flex-wrap gap-3"><Button asChild><a href={`${repository}/issues/new?template=recurso.yml`}>Sugerir recurso<ArrowUpRight /></a></Button><Button asChild variant="outline"><a href={`${repository}/blob/main/CONTRIBUTING.md`}><Github />Guia de contribuição</a></Button></div> : <p>O canal de contribuições está em preparação.</p>}
          </article>
        ) : page.resource ? (
          <article className="mx-auto max-w-3xl space-y-6">
            <Button asChild variant="ghost" className="-ml-3"><a href={`/${page.category!.route}`}><ArrowLeft />{page.category!.name}</a></Button>
            <div className="space-y-3">{page.resource.demo && <Badge variant="outline">Exemplo fictício</Badge>}<h1 className="text-3xl font-semibold tracking-tight">{page.resource.name}</h1><p className="text-lg text-muted-foreground">{page.resource.summary}</p></div>
            <p className="whitespace-pre-wrap leading-relaxed">{page.resource.description}</p>
            <div className="flex flex-wrap gap-2">{page.resource.technologies.map(t => <Badge asChild variant="secondary" key={t}><a href={`/tecnologias/${t}`}>{labels[t] || t}</a></Badge>)}</div>
            <Separator />
            <div className="space-y-2 text-sm text-muted-foreground"><p>Idiomas: {page.resource.languages.join(', ')}</p><p>Última atualização: {page.resource.updatedAt.split('-').reverse().join('/')}</p></div>
            <div className="flex flex-wrap gap-3"><Button asChild><a href={page.resource.url} target="_blank" rel="noopener noreferrer">Visitar recurso<ArrowUpRight /></a></Button>{repository && <Button asChild variant="outline"><a href={`${repository}/edit/main/data/${page.resource.type}/${page.resource.slug}.json`}>Editar informação</a></Button>}</div>
          </article>
        ) : (
          <div className="space-y-8">
            <section aria-label="Busca" className="space-y-5">
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{page.title}</h1>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div role="search" className="relative flex-1">
                  <Search className="pointer-events-none absolute top-3 left-3 size-4 text-muted-foreground" aria-hidden="true" />
                  <Input type="search" aria-label="Buscar recursos" placeholder="Buscar por nome, assunto ou tecnologia" value={query} onChange={event => setQuery(event.target.value)} className="h-10 pl-10" />
                </div>
                {!page.category && <Select value={type} onValueChange={setType}><SelectTrigger className="h-10 w-full sm:w-60" aria-label="Tipo de recurso"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos os tipos</SelectItem>{groups.map(group => <SelectGroup key={group.id}><SelectLabel>{group.name}</SelectLabel>{group.categories.map(c => <SelectItem value={c.id} key={c.id}>{c.name}</SelectItem>)}</SelectGroup>)}</SelectContent></Select>}
                <Select value={locale} onValueChange={setLocale}><SelectTrigger className="h-10 w-full sm:w-56" aria-label="Idioma e região dos recursos"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos os idiomas</SelectItem><SelectItem value="pt-BR">Português</SelectItem><SelectItem value="en-US">English (United States)</SelectItem><SelectItem value="es">Español</SelectItem></SelectContent></Select>
              </div>
            </section>

            {home && !query && type === 'all' && (
              <section aria-label="Categorias" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {groups.map(group => <Card key={group.id} className="gap-3 shadow-none"><CardHeader><CardTitle><h2>{group.name}</h2></CardTitle></CardHeader><CardContent className="flex flex-wrap gap-x-2 gap-y-1">{group.categories.map(category => <Button asChild key={category.id} variant="ghost" size="sm" className="h-9 justify-start px-2 font-normal"><a href={`/${category.route}`}>{category.name}</a></Button>)}</CardContent></Card>)}
              </section>
            )}

            <section aria-label="Resultados" className="space-y-4">
              <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-medium">{query || type !== 'all' ? 'Resultados' : 'Recursos'}</h2><span className="text-sm text-muted-foreground" aria-live="polite">{filtered.length} {filtered.length === 1 ? 'recurso' : 'recursos'}</span></div>
              {filtered.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{filtered.map(resource => <ResourceCard key={`${resource.type}/${resource.slug}`} resource={resource} />)}</div> : <Empty className="border"><EmptyHeader><EmptyTitle>{query ? 'Nenhum resultado' : 'Ainda não há recursos aqui'}</EmptyTitle><EmptyDescription>{query ? 'Tente outro nome, assunto ou tecnologia.' : 'Você pode sugerir o primeiro recurso desta categoria.'}</EmptyDescription></EmptyHeader><EmptyContent>{query ? <Button variant="outline" onClick={() => setQuery('')}>Limpar busca</Button> : <Button asChild variant="outline"><a href="/contribuir">Sugerir recurso</a></Button>}</EmptyContent></Empty>}
            </section>
          </div>
        )}
      </main>
      <footer className="mx-auto max-w-7xl px-4 pb-6 sm:px-6"><Separator /><div className="flex items-center justify-between gap-3 pt-4 text-sm text-muted-foreground"><span>Guia da TI</span><Button asChild variant="link" size="sm" className="text-muted-foreground"><a href="/sobre">Sobre o projeto</a></Button></div></footer>
    </div>
  );
}
