import { useEffect, useState } from 'react';
import { Discussions } from './Discussions';
import { Community } from './Community';
import { ActiveUsers, CommunityMetrics, CommunityMetricsProvider } from './CommunityMetrics';
import { Maintainers, MaintainersProvider } from './Maintainers';
import { NavigationCard } from './NavigationCard';
import { BrandMark } from './BrandMark';
import { Motion } from './Motion';
import { Participation, UserControls } from './Participation';
import { ArrowLeft, ArrowUpRight, ChevronDown, Github, Menu, Search } from 'lucide-react';
import { Accordion } from 'radix-ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import { categories, groups, labels, normalize, pageInfo, resourcePath, resources, type Resource } from './catalog';

const repositoryValue = import.meta.env.VITE_DATA_REPOSITORY || 'https://github.com/guia-da-ti/guia-da-ti-dados';
const repository = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/.test(repositoryValue) ? repositoryValue.replace(/\/$/, '') : '';

function ResourceCard({ resource }: { resource: Resource }) {
  return (
    <Card data-motion className="h-full shadow-none">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{categories.find(c => c.id === resource.type)?.name}</Badge>
          {resource.demo && <Badge variant="outline">Exemplo fictício</Badge>}
        </div>
        <CardTitle className="pt-2 text-lg leading-snug">
          <a href={resourcePath(resource)} className="inline-flex items-center gap-2 rounded-sm hover:text-primary focus-visible:outline-2 focus-visible:outline-ring">{resource.name}<ArrowUpRight className="size-4 shrink-0" /></a>
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
    <Motion><Participation><CommunityMetricsProvider><MaintainersProvider><div className="flex min-h-dvh flex-col">
      <Button asChild className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50">
        <a href="#conteudo">Pular para o conteúdo</a>
      </Button>
      <header className="site-header relative shrink-0 bg-background">
        <div className="site-frame header-inner mx-auto flex h-[72px] max-w-7xl items-center gap-4 px-4 sm:px-6">
            <a href="/" aria-label="Guia da TI — página inicial" className="inline-flex shrink-0 items-center gap-2 rounded-sm text-xl font-bold tracking-tight focus-visible:outline-2 focus-visible:outline-ring"><BrandMark />guiadati<span className="text-primary">.</span></a>
          <NavigationMenu viewport={false} aria-label="Principal" className="!static hidden min-w-0 flex-1 justify-start xl:flex">
            <NavigationMenuList className="flex-nowrap justify-start gap-0.5">
              <NavigationMenuItem><NavigationMenuLink asChild active={home}><a href="/" aria-current={home ? 'page' : undefined}>Início</a></NavigationMenuLink></NavigationMenuItem>
              {groups.map(group => (
                <NavigationMenuItem key={group.id} value={group.id} className="!static">
                  <NavigationMenuTrigger
                    className="data-[current=true]:bg-accent data-[current=true]:text-primary"
                    data-current={group.categories.some(category => category.id === page.category?.id)}
                  >{group.name}</NavigationMenuTrigger>
                  <NavigationMenuContent className="mega-panel">
                    <ul className="grid max-h-[calc(100svh-7rem)] grid-cols-3 gap-x-4 gap-y-2 overflow-y-auto">
                      {group.categories.map(category => (
                        <li key={category.id}>
                          <NavigationMenuLink asChild active={category.id === page.category?.id}>
                            <a href={`/${category.route}`} aria-current={category.id === page.category?.id ? 'page' : undefined} className="navigation-card"><NavigationCard id={category.id} name={category.name} /></a>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ))}
              <NavigationMenuItem value="projeto" className="!static">
                <NavigationMenuTrigger data-current={['/sobre', '/apoiadores'].includes(path)} className="data-[current=true]:bg-accent data-[current=true]:text-primary">Projeto</NavigationMenuTrigger>
                <NavigationMenuContent className="mega-panel">
                  <ul className="grid grid-cols-3 gap-4">{[{ id: 'about', name: 'Sobre', href: '/sobre' }, { id: 'supporters', name: 'Empresas apoiadoras', href: '/apoiadores' }].map(link => <li key={link.href}><NavigationMenuLink asChild active={path === link.href}><a href={link.href} aria-current={path === link.href ? 'page' : undefined} className="navigation-card"><NavigationCard id={link.id} name={link.name} /></a></NavigationMenuLink></li>)}</ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          <div className="ml-auto flex shrink-0 items-center gap-1">
            <UserControls dark={dark} toggleTheme={toggleTheme} />
            <Sheet>
              <SheetTrigger asChild><Button variant="ghost" size="icon" className="xl:hidden" aria-label="Abrir navegação"><Menu /></Button></SheetTrigger>
              <SheetContent className="w-[min(88vw,24rem)] overflow-y-auto p-0">
                <SheetHeader className="border-b px-5 py-5">
                  <SheetTitle>Navegação</SheetTitle>
                  <SheetDescription>Escolha uma categoria para ver as opções.</SheetDescription>
                </SheetHeader>
                <nav aria-label="Navegação para celular" className="space-y-5 px-4 py-5">
                  <SheetClose asChild><Button asChild variant={home ? 'secondary' : 'ghost'} className="w-full justify-start"><a href="/" aria-current={home ? 'page' : undefined}>Início</a></Button></SheetClose>
                  <Accordion.Root type="single" collapsible className="divide-y" defaultValue={groups.find(group => group.categories.some(category => category.id === page.category?.id))?.id}>
                    {groups.map(group => (
                      <Accordion.Item key={group.id} value={group.id}>
                        <Accordion.Header>
                          <Accordion.Trigger asChild data-current={group.categories.some(category => category.id === page.category?.id)}><Button variant="ghost" size="menu" className="group justify-between data-[current=true]:bg-accent data-[current=true]:text-primary">
                            {group.name}<ChevronDown aria-hidden="true" className="size-4 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
                          </Button></Accordion.Trigger>
                        </Accordion.Header>
                        <Accordion.Content>
                          <ul className="mb-3 ml-3 space-y-1 border-l pl-2">
                            {group.categories.map(category => (
                              <li key={category.id}><SheetClose asChild><Button asChild size="menu" variant={category.id === page.category?.id ? 'secondary' : 'ghost'}><a href={`/${category.route}`} aria-current={category.id === page.category?.id ? 'page' : undefined}>{category.name}</a></Button></SheetClose></li>
                            ))}
                          </ul>
                        </Accordion.Content>
                      </Accordion.Item>
                    ))}
                  </Accordion.Root>
                  <Separator />
                  <div className="space-y-1">
                    {[{ name: 'Sobre', href: '/sobre' }, { name: 'Contribuir', href: '/contribuir' }, { name: 'Empresas apoiadoras', href: '/apoiadores' }].map(link => <SheetClose asChild key={link.href}><Button asChild variant={path === link.href ? 'secondary' : 'ghost'} className="w-full justify-start"><a href={link.href} aria-current={path === link.href ? 'page' : undefined}>{link.name}</a></Button></SheetClose>)}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main data-motion id="conteudo" className="site-frame mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        {!page.valid ? (
          <Empty><EmptyHeader><EmptyTitle>Página não encontrada</EmptyTitle><EmptyDescription>Esse endereço não está no guia.</EmptyDescription></EmptyHeader><EmptyContent><Button asChild><a href="/">Voltar ao início</a></Button></EmptyContent></Empty>
        ) : home ? (
          <Discussions />
        ) : path === '/apoiadores' ? (
          <Community area="supporters" />
        ) : path === '/sobre' ? (
          <article className="mx-auto max-w-4xl space-y-6 [&>p]:max-w-2xl">
            <h1 className="text-3xl font-semibold tracking-tight">Sobre o Guia da TI</h1>
            <p className="text-lg leading-relaxed">Um guia de links para sites, conteúdos e oportunidades de tecnologia, mantido pela comunidade.</p>
            <CommunityMetrics />
            <p className="leading-relaxed text-muted-foreground">Você encontra indicações organizadas por categoria e acessa o conteúdo no site de origem. Cursos, tutoriais, artigos e atividades ficam nesses sites externos.</p>
            <p className="leading-relaxed text-muted-foreground">As indicações vão além da programação e incluem dados, segurança, infraestrutura, redes, hardware, design, produto e inteligência artificial.</p>
            <h2 className="text-xl font-semibold">Converse no fórum</h2>
            <p className="leading-relaxed text-muted-foreground">No fórum, você pode tirar dúvidas, compartilhar experiências e aprender com outras pessoas aqui no Guia. Entre com sua conta do GitHub para criar tópicos e responder.</p>
            <Separator />
            <h2 className="text-xl font-semibold">Como funciona a curadoria</h2>
            <p className="leading-relaxed text-muted-foreground">Qualquer pessoa pode sugerir um recurso ou corrigir uma informação. As contribuições passam por revisão antes de entrar no catálogo. Você pode consultar a data de atualização de cada cadastro e propor correções.</p>
            <h2 className="text-xl font-semibold">Aberto e colaborativo</h2>
            <p className="leading-relaxed text-muted-foreground">O catálogo é público e seu histórico pode ser consultado no GitHub. Não é necessário criar uma conta para explorar o guia.</p>
            <p className="text-sm text-muted-foreground">Estamos começando. Os cadastros marcados como “Exemplo fictício” demonstram a navegação e não são recomendações de recursos reais.</p>
            <Button asChild variant="outline"><a href="/contribuir">Contribuir com o guia<ArrowUpRight /></a></Button>
            <Separator />
            <Maintainers />
          </article>
        ) : path === '/contribuir' ? (
          <article className="mx-auto max-w-2xl space-y-6">
            <h1 className="text-3xl font-semibold tracking-tight">Contribuir</h1>
            <p className="text-muted-foreground">Conhece um site, conteúdo ou oportunidade que merece entrar no guia? Envie o link para revisão. Você também pode corrigir informações das indicações existentes.</p>
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
            <p className="text-sm text-muted-foreground">O conteúdo fica no site de origem. O link abre em uma nova aba.</p>
            <div className="flex flex-wrap gap-3"><Button asChild><a href={page.resource.url} target="_blank" rel="noopener noreferrer">Abrir site<ArrowUpRight /></a></Button>{repository && <Button asChild variant="outline"><a href={`${repository}/edit/main/data/${page.resource.type}/${page.resource.slug}.json`}>Editar informação</a></Button>}</div>
          </article>
        ) : (
          <div className="space-y-8">
            <section aria-label="Busca" className="space-y-5">
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{page.title}</h1>
              <p className="text-sm text-muted-foreground">Encontre links para outros sites. Consulte os detalhes de cada indicação e acesse o conteúdo no site de origem.</p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div role="search" className="relative flex-1">
                  <Search className="pointer-events-none absolute top-3 left-3 size-4 text-muted-foreground" aria-hidden="true" />
                  <Input type="search" aria-label="Buscar recursos" placeholder="Buscar por nome, assunto ou tecnologia" value={query} onChange={event => setQuery(event.target.value)} className="h-10 pl-10" />
                </div>
                {!page.category && <Select value={type} onValueChange={setType}><SelectTrigger className="h-10 w-full sm:w-60" aria-label="Tipo de recurso"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos os tipos</SelectItem>{groups.map(group => <SelectGroup key={group.id}><SelectLabel>{group.name}</SelectLabel>{group.categories.map(c => <SelectItem value={c.id} key={c.id}>{c.name}</SelectItem>)}</SelectGroup>)}</SelectContent></Select>}
                <Select value={locale} onValueChange={setLocale}><SelectTrigger className="h-10 w-full sm:w-56" aria-label="Idioma e região dos recursos"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos os idiomas</SelectItem><SelectItem value="pt-BR">Português</SelectItem><SelectItem value="en-US">English (United States)</SelectItem><SelectItem value="es">Español</SelectItem></SelectContent></Select>
              </div>
            </section>

            <section aria-label="Resultados" className="space-y-4">
              <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-medium">{query || type !== 'all' ? 'Resultados' : 'Recursos'}</h2><span className="text-sm text-muted-foreground" aria-live="polite">{filtered.length} {filtered.length === 1 ? 'recurso' : 'recursos'}</span></div>
              {filtered.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{filtered.map(resource => <ResourceCard key={`${resource.type}/${resource.slug}`} resource={resource} />)}</div> : <Empty className="border"><EmptyHeader><EmptyTitle>{query ? 'Nenhum resultado' : 'Ainda não há recursos aqui'}</EmptyTitle><EmptyDescription>{query ? 'Tente outro nome, assunto ou tecnologia.' : 'Você pode sugerir o primeiro recurso desta categoria.'}</EmptyDescription></EmptyHeader><EmptyContent>{query ? <Button variant="outline" onClick={() => setQuery('')}>Limpar busca</Button> : <Button asChild variant="outline"><a href="/contribuir">Sugerir recurso</a></Button>}</EmptyContent></Empty>}
            </section>
          </div>
        )}
      </main>
      <footer className="site-footer w-full shrink-0">
        <div className="section-divider" aria-hidden="true" />
        <div className="site-frame mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 pt-4 pb-6 text-sm text-muted-foreground sm:px-6">
          <span>Feito com <span className="text-primary" aria-label="amor">&lt;3</span> por <a href="https://fulldev.com.br" target="_blank" rel="noopener noreferrer" className="rounded-sm font-medium hover:text-primary focus-visible:outline-2 focus-visible:outline-ring">FullDev</a></span>
          <ActiveUsers />
          <Maintainers compact />
        </div>
      </footer>
    </div></MaintainersProvider></CommunityMetricsProvider></Participation></Motion>
  );
}
