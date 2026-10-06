import { useEffect, useState, type ReactNode } from 'react';
import { Discussions } from './Discussions';
import { Community } from './Community';
import { ActiveUsers, CommunityMetrics, CommunityMetricsProvider } from './CommunityMetrics';
import { Maintainers, MaintainersProvider } from './Maintainers';
import { NavigationCard } from './NavigationCard';
import { BrandMark } from './BrandMark';
import { Motion } from './Motion';
import { Participation, ResourceContribution, UserControls } from './Participation';
import { ArrowLeft, ArrowRight, ArrowUpRight, Award, BookOpen, BriefcaseBusiness, CalendarDays, ChevronDown, Code, ExternalLink, FileText, FlaskConical, Github, Globe2, GraduationCap, Headphones, Instagram, Linkedin, Mail, Map, Menu, Newspaper, Twitter, Users, Wrench, Youtube, type LucideIcon } from 'lucide-react';
import { Accordion } from 'radix-ui';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import { Dialog } from 'radix-ui';
import { categories, groups, labels, pageInfo, resourcePath, resources, type Resource } from './catalog';

const repositoryValue = import.meta.env.VITE_DATA_REPOSITORY || 'https://github.com/guia-da-ti/guia-da-ti-dados';
const repository = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/.test(repositoryValue) ? repositoryValue.replace(/\/$/, '') : '';

const resourceIcons: Record<string, LucideIcon> = {
  courses: GraduationCap, platforms: BookOpen, universities: GraduationCap, bootcamps: Code, roadmaps: Map, books: BookOpen, certifications: Award,
  news: Newspaper, blogs: FileText, newsletters: Mail, podcasts: Headphones, youtube: Youtube, creators: Users, articles: FileText, tutorials: Code,
  studies: FlaskConical, 'case-studies': BriefcaseBusiness, reports: FileText, communities: Users, events: CalendarDays, meetups: Users,
  conferences: CalendarDays, hackathons: Code, tools: Wrench, 'open-source': Code, challenges: Award, labs: FlaskConical, jobs: BriefcaseBusiness,
  internships: GraduationCap, scholarships: BookOpen, mentoring: Users, volunteering: Users,
};
const platformIcons: Record<string, LucideIcon> = { youtube: Youtube, instagram: Instagram, linkedin: Linkedin, twitter: Twitter, tiktok: Globe2 };
const dialogTypes = new Set(['articles', 'tutorials', 'studies', 'case-studies', 'reports', 'news', 'blogs', 'newsletters', 'podcasts']);
const profileTypes = new Set(['creators', 'youtube']);

function resourceExtra(resource: Resource) {
  if (profileTypes.has(resource.type)) {
    try { return new URL(resource.url).hostname.replace(/^www\./, ''); } catch { return 'Perfil externo'; }
  }
  if (['jobs', 'internships', 'scholarships', 'events', 'meetups', 'conferences', 'hackathons'].includes(resource.type)) {
    return resource.countries?.length ? resource.countries.map(country => labels[country] || country).join(' · ') : resource.areas.map(area => labels[area] || area).join(' · ');
  }
  if (resource.technologies.length) return resource.technologies.map(technology => labels[technology] || technology).join(' · ');
  return resource.areas.map(area => labels[area] || area).join(' · ');
}

function ResourceIcon({ resource, platform }: { resource: Resource; platform: string | null }) {
  const Icon = platformIcons[platform || resource.type] || resourceIcons[resource.type] || Globe2;
  return <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-lg border bg-muted/50 text-primary"><Icon className="size-5" /></span>;
}

function ResourcePreview({ resource, extra }: { resource: Resource; extra: string }) {
  return <span role="tooltip" className="absolute left-11 top-[calc(100%-4px)] z-30 hidden max-h-[calc(100dvh-2rem)] w-[min(28rem,calc(100vw-3rem))] overflow-y-auto rounded-lg border bg-popover p-4 text-popover-foreground shadow-xl group-hover:block group-focus-within:block">
    <span className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground"><Globe2 className="size-4" />{new URL(resource.url).hostname.replace(/^www\./, '')}</span>
    <span className="block text-base font-semibold">{resource.name}</span>
    <span className="mt-1 block text-sm leading-relaxed">{resource.description}</span>
    {extra && <span className="mt-3 block border-t pt-2 text-xs text-muted-foreground">{extra}</span>}
  </span>;
}

function ResourceDetailDialog({ resource, extra }: { resource: Resource; extra: string }) {
  return <Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-50 bg-black/55" /><Dialog.Content className="fixed top-1/2 left-1/2 z-50 max-h-[85dvh] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 space-y-4 overflow-y-auto rounded-xl border bg-popover p-6 text-popover-foreground shadow-xl">
    <Dialog.Title className="text-xl font-semibold">{resource.name}</Dialog.Title>
    <Dialog.Description className="text-sm leading-relaxed text-muted-foreground">{resource.summary}</Dialog.Description>
    <p className="whitespace-pre-wrap text-sm leading-relaxed">{resource.description}</p>
    {extra && <p className="text-sm text-muted-foreground">{extra}</p>}
    <div className="flex flex-wrap gap-2">{resource.areas.map(area => <Badge variant="outline" key={area}>{labels[area] || area}</Badge>)}{resource.languages.map(language => <Badge variant="secondary" key={language}>{language}</Badge>)}</div>
    <div className="flex gap-2"><Button asChild><a href={resource.url} target="_blank" rel="noopener noreferrer">Abrir conteúdo<ExternalLink /></a></Button><Dialog.Close asChild><Button variant="outline">Fechar</Button></Dialog.Close></div>
  </Dialog.Content></Dialog.Portal>;
}

function ResourceRow({ resource, platform }: { resource: Resource; platform: string | null }) {
  const extra = resourceExtra(resource);
  const content: ReactNode = <>
    <ResourceIcon resource={resource} platform={platform} />
    <span className="min-w-0 flex-1 py-0.5">
      <span className="flex flex-wrap items-center gap-x-2 gap-y-1"><span className="font-semibold leading-snug">{resource.name}</span>{resource.demo && <Badge variant="outline" className="text-[10px]">Exemplo</Badge>}</span>
      <span className="mt-1 block truncate text-sm text-muted-foreground">{resource.summary}</span>
      {extra && <span className="mt-1 block truncate text-xs text-muted-foreground">{extra}</span>}
    </span>
    <ArrowRight aria-hidden="true" className="mt-3 size-4 shrink-0 text-muted-foreground" />
  </>;
  const rowClass = 'group relative flex w-full items-start gap-3 px-3 py-3 text-left outline-none hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring';
  const preview = <ResourcePreview resource={resource} extra={extra} />;
  if (profileTypes.has(resource.type)) return <div className="group relative"><a className={`${rowClass} pr-4`} href={resource.url} target="_blank" rel="noopener noreferrer">{content}</a>{preview}</div>;
  if (dialogTypes.has(resource.type)) return <Dialog.Root><div className="group relative"><Dialog.Trigger asChild><button type="button" className={rowClass}>{content}</button></Dialog.Trigger>{preview}</div><ResourceDetailDialog resource={resource} extra={extra} /></Dialog.Root>;
  return <div className="group relative"><a className={`${rowClass} pr-4`} href={resourcePath(resource)}>{content}</a>{preview}</div>;
}

export function App({ path }: { path: string }) {
  const page = pageInfo(path);
  const home = path === '/';
  const [dark, setDark] = useState(false);
  const platform = typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('plataforma');

  useEffect(() => {
    try { setDark(localStorage.getItem('theme') === 'dark'); } catch { /* Optional preference. */ }
  }, []);
  useEffect(() => { document.documentElement.classList.toggle('dark', dark); }, [dark]);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    try { localStorage.setItem('theme', next ? 'dark' : 'light'); } catch { /* Optional preference. */ }
  }

  const platformDomains: Record<string, string[]> = {
    youtube: ['youtube.com', 'youtu.be'], instagram: ['instagram.com'], tiktok: ['tiktok.com'],
    linkedin: ['linkedin.com'], twitter: ['twitter.com', 'x.com'],
  };
  const filtered = resources.filter(r =>
    (!page.category || r.type === page.category.id || (page.category.id === 'creators' && r.type === 'youtube')) &&
    (!platform || (platformDomains[platform] || []).some(domain => {
      try { const host = new URL(r.url).hostname.toLowerCase(); return host === domain || host.endsWith(`.${domain}`); }
      catch { return false; }
    })) &&
    (!page.area || r.areas.includes(page.area)) &&
    (!page.technology || r.technologies.includes(page.technology))
  );

  return (
    <Motion><Participation><CommunityMetricsProvider><MaintainersProvider><div className="flex min-h-dvh flex-col">
      <Button asChild className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50">
        <a href="#conteudo">Pular para o conteúdo</a>
      </Button>
      <header className="site-header relative shrink-0 bg-background">
        <div className="site-frame header-inner mx-auto flex h-[72px] max-w-7xl items-center gap-4 px-4 sm:px-6">
            <a href="/" aria-label="Guia da TI — página inicial" className="inline-flex shrink-0 items-center rounded-sm focus-visible:outline-2 focus-visible:outline-ring"><BrandMark /></a>
          <div className="pointer-events-none absolute inset-0 hidden items-center justify-center xl:flex">
          <NavigationMenu viewport={false} aria-label="Principal" className="!static pointer-events-auto min-w-0 flex">
            <NavigationMenuList className="flex-nowrap gap-0.5">
              <NavigationMenuItem><NavigationMenuLink asChild active={home}><a href="/" aria-current={home ? 'page' : undefined}>Início</a></NavigationMenuLink></NavigationMenuItem>
              {groups.map(group => (
                <NavigationMenuItem key={group.id} value={group.id} className="!static">
                  <NavigationMenuTrigger
                    className="data-[current=true]:bg-accent data-[current=true]:text-primary"
                    data-current={group.categories.some(category => category.id === page.category?.id)}
                  >{group.name}</NavigationMenuTrigger>
                  <NavigationMenuContent className="mega-panel">
                    <ul className="grid max-h-[calc(100svh-7rem)] grid-cols-3 gap-x-4 gap-y-2 overflow-y-auto">
                      {group.categories.filter(category => category.id !== 'courses').map(category => (
                        <li key={category.id}>
                          <NavigationMenuLink asChild active={category.id === page.category?.id}>
                            <a href={'platform' in category ? `/criadores?plataforma=${category.platform}` : `/${category.route}`} aria-current={category.id === page.category?.id && (!('platform' in category) || platform === category.platform) ? 'page' : undefined} className="navigation-card"><NavigationCard id={category.id.startsWith('creator-') ? 'creators' : category.id} name={category.name} /></a>
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
          </div>
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
                            {group.categories.filter(category => category.id !== 'courses').map(category => (
                              <li key={category.id}><SheetClose asChild><Button asChild size="menu" variant={category.id === page.category?.id && (!('platform' in category) || platform === category.platform) ? 'secondary' : 'ghost'}><a href={'platform' in category ? `/criadores?plataforma=${category.platform}` : `/${category.route}`} aria-current={category.id === page.category?.id && (!('platform' in category) || platform === category.platform) ? 'page' : undefined}>{category.name}</a></Button></SheetClose></li>
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

      <main data-motion id="conteudo" className="site-frame mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-6 sm:py-10">
        {!page.valid ? (
          <Empty><EmptyHeader><EmptyTitle>Página não encontrada</EmptyTitle><EmptyDescription>Esse endereço não está no guia.</EmptyDescription></EmptyHeader><EmptyContent><Button asChild><a href="/">Voltar ao início</a></Button></EmptyContent></Empty>
        ) : home ? (
          <div className="flex flex-1 flex-col gap-8"><Discussions className="w-full flex-1" /><div className="section-divider" aria-hidden="true" /><Community area="supporters" preview /></div>
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
            <p className="text-muted-foreground">Sugira um recurso uma vez. A conversa, os comentários e a revisão ficam no mesmo tópico do fórum.</p>
            <ResourceContribution />
            {repository && <Button asChild variant="outline"><a href={`${repository}/blob/main/CONTRIBUTING.md`}><Github />Guia de contribuição</a></Button>}
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
          <section aria-label="Recursos" className="space-y-5">
            <div className="flex items-center justify-between gap-3"><div className="space-y-1"><h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{page.title}</h1><p className="text-sm text-muted-foreground">Indicações organizadas para você explorar no próprio ritmo.</p></div><span className="shrink-0 text-sm text-muted-foreground" aria-live="polite">{filtered.length} {filtered.length === 1 ? 'item' : 'itens'}</span></div>
            {filtered.length ? <ul aria-label={`Lista: ${page.title}`} className="divide-y border-y">{filtered.map(resource => <li key={`${resource.type}/${resource.slug}`}><ResourceRow resource={resource} platform={platform} /></li>)}</ul> : <Empty className="border"><EmptyHeader><EmptyTitle>Ainda não há recursos aqui</EmptyTitle><EmptyDescription>Você pode sugerir o primeiro item desta categoria.</EmptyDescription></EmptyHeader><EmptyContent><Button asChild variant="outline"><a href="/contribuir">Sugerir recurso</a></Button></EmptyContent></Empty>}
          </section>
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
