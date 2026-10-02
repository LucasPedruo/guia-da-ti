import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Compass, Github, Menu, MessageSquareText, Moon, Search, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { categories, groups, labels, normalize, pageInfo, resourcePath, resources, taxonomy, type Resource } from './catalog';

const repositoryValue = import.meta.env.VITE_DATA_REPOSITORY || 'https://github.com/LucasPedruo/guia-da-ti-dados';
const repository = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/.test(repositoryValue) ? repositoryValue.replace(/\/$/, '') : '';
const megaMenuColumns = [
  groups.filter(group => ['learn', 'deepen'].includes(group.id)),
  groups.filter(group => ['inform', 'connect'].includes(group.id)),
  groups.filter(group => ['create', 'opportunities'].includes(group.id)),
];

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

type DiscussionPreview = {
  id: string;
  title: string;
  category: string;
  author: string;
  updatedAt: string;
  replyCount: number;
  url: string;
};

function DiscussionsPreview({ discussions = [] }: { discussions?: DiscussionPreview[] }) {
  return (
    <section id="comunidade" aria-labelledby="discussions-title" className="scroll-mt-8 space-y-4">
      <div className="space-y-1">
        <h2 id="discussions-title" className="text-xl font-semibold tracking-tight">Comunidade</h2>
        <p className="text-sm text-muted-foreground">Conversas, dúvidas e ideias de quem vive tecnologia.</p>
      </div>
      {discussions.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {discussions.map(discussion => (
            <Card key={discussion.id} className="shadow-none">
              <CardHeader className="gap-3">
                <div className="flex flex-wrap items-center gap-2"><Badge variant="secondary">{discussion.category}</Badge><CardDescription>por {discussion.author}</CardDescription></div>
                <CardTitle className="text-base leading-snug">{discussion.title}</CardTitle>
              </CardHeader>
              <CardFooter className="justify-between gap-3 border-t pt-4 text-sm text-muted-foreground">
                <span>{discussion.replyCount} respostas · {discussion.updatedAt}</span>
                <Button asChild variant="ghost" size="sm"><a href={discussion.url}>Abrir conversa<ArrowUpRight /></a></Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Empty className="min-h-44 border bg-card p-6 md:flex-row md:justify-between md:text-left">
          <EmptyHeader className="md:items-start md:text-left">
            <EmptyMedia variant="icon"><MessageSquareText /></EmptyMedia>
            <EmptyTitle>As conversas da comunidade vão aparecer aqui</EmptyTitle>
            <EmptyDescription>Estamos preparando a integração com o GitHub Discussions para você ler, navegar e participar pelo Guia da TI.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent className="md:w-auto md:max-w-none md:items-end">
            <Button variant="outline" disabled>Fórum em preparação</Button>
          </EmptyContent>
        </Empty>
      )}
    </section>
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
      <header className="relative border-b bg-background">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center gap-4 px-4 sm:px-6">
            <Button asChild variant="ghost" className="h-auto shrink-0 px-0 text-xl font-bold tracking-tight hover:bg-transparent">
            <a href="/" aria-label="Guia da TI — página inicial"><Compass className="size-5 text-primary" />guiadati<span className="text-primary">.</span></a>
            </Button>
          <NavigationMenu viewport={false} aria-label="Principal" className="hidden min-w-0 flex-1 justify-start xl:flex">
            <NavigationMenuList className="flex-nowrap justify-start gap-0.5">
              <NavigationMenuItem><NavigationMenuLink asChild active={home}><a href="/" aria-current={home ? 'page' : undefined}>Home</a></NavigationMenuLink></NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Explorar</NavigationMenuTrigger>
                <NavigationMenuContent className="!fixed !top-[72px] !left-0 z-50 mt-0 !w-screen max-w-none !translate-x-0 rounded-none border-x-0 border-t bg-background p-0 shadow-none">
                  <div className="mx-auto grid max-h-[min(70vh,36rem)] w-full max-w-7xl grid-cols-1 gap-x-10 gap-y-6 overflow-y-auto px-6 py-7 sm:grid-cols-2 lg:grid-cols-3 lg:px-10">
                    {megaMenuColumns.map((column, index) => (
                      <div key={index} className="space-y-5">
                        {column.map(group => (
                          <section key={group.id} aria-labelledby={`menu-${group.id}`} className="space-y-1.5">
                            <h2 id={`menu-${group.id}`} className="px-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{group.name}</h2>
                            <ul className="grid grid-cols-2 gap-x-2">
                              {group.categories.map(category => (
                                <li key={category.id}><NavigationMenuLink asChild active={category.id === page.category?.id}>
                                  <a href={`/${category.route}`} aria-current={category.id === page.category?.id ? 'page' : undefined} className="rounded-md px-2 py-1">{category.name}</a>
                                </NavigationMenuLink></li>
                              ))}
                            </ul>
                          </section>
                        ))}
                      </div>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem><NavigationMenuLink asChild active={path === '/comunidades'}><a href="/comunidades" aria-current={path === '/comunidades' ? 'page' : undefined}>Comunidades</a></NavigationMenuLink></NavigationMenuItem>
              <NavigationMenuItem><NavigationMenuLink asChild active={path === '/cursos'}><a href="/cursos">Aprender</a></NavigationMenuLink></NavigationMenuItem>
              <NavigationMenuItem><NavigationMenuLink asChild active={path === '/criadores'}><a href="/criadores">Criadores</a></NavigationMenuLink></NavigationMenuItem>
              <NavigationMenuItem><NavigationMenuLink asChild active={path === '/eventos'}><a href="/eventos">Eventos</a></NavigationMenuLink></NavigationMenuItem>
              <NavigationMenuItem><NavigationMenuLink asChild active={path === '/ferramentas'}><a href="/ferramentas">Ferramentas</a></NavigationMenuLink></NavigationMenuItem>
              <NavigationMenuItem><NavigationMenuLink asChild active={path === '/sobre'}><a href="/sobre" aria-current={path === '/sobre' ? 'page' : undefined}>Sobre</a></NavigationMenuLink></NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          <div className="ml-auto flex shrink-0 items-center gap-1">
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={dark ? 'Ativar tema claro' : 'Ativar tema escuro'}>
              {dark ? <Sun /> : <Moon />}
            </Button>
            <Sheet>
              <SheetTrigger asChild><Button variant="ghost" size="icon" className="xl:hidden" aria-label="Abrir navegação"><Menu /></Button></SheetTrigger>
              <SheetContent className="w-[min(88vw,24rem)] overflow-y-auto p-0">
                <SheetHeader className="border-b px-5 py-5">
                  <SheetTitle>Explore o Guia da TI</SheetTitle>
                  <SheetDescription>Encontre recursos e caminhos em tecnologia.</SheetDescription>
                </SheetHeader>
                <nav aria-label="Navegação para celular" className="space-y-5 px-4 py-5">
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: 'Home', href: '/' }, { name: 'Comunidades', href: '/comunidades' },
                      { name: 'Aprender', href: '/cursos' }, { name: 'Criadores', href: '/criadores' },
                      { name: 'Eventos', href: '/eventos' }, { name: 'Ferramentas', href: '/ferramentas' },
                      { name: 'Sobre', href: '/sobre' }, { name: 'Contribuir', href: '/contribuir' },
                    ].map(link => <SheetClose asChild key={link.href}><Button asChild variant="outline" className="justify-start"><a href={link.href}>{link.name}</a></Button></SheetClose>)}
                  </div>
                  <Separator />
                  {groups.map(group => (
                    <section key={group.id} aria-labelledby={`mobile-menu-${group.id}`} className="space-y-2">
                      <h2 id={`mobile-menu-${group.id}`} className="px-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{group.name}</h2>
                      <div className="grid grid-cols-2 gap-1">
                        {group.categories.map(category => <SheetClose asChild key={category.id}><Button asChild variant="ghost" size="sm" className="justify-start whitespace-normal text-left"><a href={`/${category.route}`}>{category.name}</a></Button></SheetClose>)}
                      </div>
                    </section>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
            <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex"><a href="/contribuir">Contribuir</a></Button>
          </div>
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

            {home && !query && type === 'all' && <DiscussionsPreview />}

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
