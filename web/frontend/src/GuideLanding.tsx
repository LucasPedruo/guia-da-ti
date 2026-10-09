import { ArrowDown, ArrowUpRight, BookOpen, BriefcaseBusiness, Code, Compass, HeartHandshake, MessageSquare, Newspaper, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AboutGuide } from './UserGuide';
import { CommunityMetrics } from './CommunityMetrics';
import { Maintainers } from './Maintainers';
import { Community } from './Community';
import { openContribution } from './contribution-actions';

const paths = [
  { label: 'Quero estudar', description: 'Plataformas de cursos, livros e caminhos de estudo.', href: '/plataformas', icon: BookOpen },
  { label: 'Quero me informar', description: 'Notícias e publicações para acompanhar tecnologia.', href: '/noticias', icon: Newspaper },
  { label: 'Quero encontrar pessoas', description: 'Comunidades para conversar e trocar experiências.', href: '/comunidades', icon: Users },
  { label: 'Quero praticar', description: 'Desafios e projetos para aplicar o que aprendi.', href: '/desafios', icon: Code },
  { label: 'Quero crescer na carreira', description: 'Sites de vagas e oportunidades de mentoria.', href: '/vagas', icon: BriefcaseBusiness },
  { label: 'Quero trocar uma ideia', description: 'O fórum do Guia para perguntar e compartilhar.', href: '/', icon: MessageSquare },
];

export function GuideLanding({ dark }: { dark: boolean }) {
  return <article className="mx-auto w-full max-w-5xl space-y-12 sm:space-y-16">
    <header className="relative overflow-hidden rounded-3xl border bg-card p-6 sm:p-10 lg:p-14">
      <div aria-hidden="true" className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative max-w-3xl space-y-6">
        <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-primary"><Compass className="size-4" />Feito pela comunidade</p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">Sobre o Guia da TI</h1>
        <p className="max-w-2xl text-xl leading-relaxed sm:text-2xl">Um ponto de partida para encontrar seu caminho em tecnologia.</p>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">O Guia da TI reúne links para você estudar, conhecer comunidades e encontrar oportunidades. Escolha um assunto e acesse o conteúdo no site de origem.</p>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg"><a href="#por-onde-comecar">Escolher por onde começar<ArrowDown /></a></Button>
          <Button asChild size="lg" variant="outline"><a href="/">Conhecer o fórum<MessageSquare /></a></Button>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2 text-xs text-muted-foreground">
          <span>Você pode explorar sem criar uma conta</span>
          <a href="#conheca-o-guia" className="inline-flex items-center gap-2 rounded-sm text-foreground hover:text-primary focus-visible:outline-2 focus-visible:outline-ring">Veja como funciona<ArrowDown className="size-3.5" /></a>
        </div>
      </div>
    </header>

    <section aria-labelledby="por-onde-comecar" className="space-y-6">
      <div className="max-w-2xl space-y-2">
        <p className="text-xs font-medium uppercase tracking-widest text-primary">Seu próximo passo</p>
        <h2 id="por-onde-comecar" className="scroll-mt-28 text-2xl font-semibold tracking-tight sm:text-3xl">Por onde você quer começar?</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">Você pode estar começando na área ou procurando algo para o trabalho. Escolha o que faz sentido para você agora.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {paths.map(({ label, description, href, icon: Icon }) => <a key={href} href={href} className="group rounded-2xl border bg-card p-5 transition-colors hover:border-primary/50 hover:bg-accent/30 focus-visible:outline-2 focus-visible:outline-ring">
          <div className="mb-5 flex items-center justify-between"><span className="flex size-10 items-center justify-center rounded-xl border border-primary/20 bg-accent/50 text-primary"><Icon className="size-5" /></span><ArrowUpRight aria-hidden="true" className="size-4 text-muted-foreground group-hover:text-primary" /></div>
          <h3 className="mb-2 font-semibold">{label}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
        </a>)}
      </div>
    </section>

    <section id="conheca-o-guia" aria-labelledby="como-o-guia-funciona" className="scroll-mt-28 space-y-6">
      <div className="max-w-2xl space-y-2">
        <p className="text-xs font-medium uppercase tracking-widest text-primary">Conheça o projeto</p>
        <h2 id="como-o-guia-funciona" className="text-2xl font-semibold tracking-tight sm:text-3xl">Links para descobrir. Um fórum para conversar.</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">Veja o que você encontra no Guia e como suas indicações ajudam outras pessoas.</p>
      </div>
      <AboutGuide dark={dark} />
    </section>

    <CommunityMetrics />

    <section aria-labelledby="quem-cuida-do-guia" className="space-y-6">
      <div className="max-w-2xl space-y-2">
        <h2 id="quem-cuida-do-guia" className="text-2xl font-semibold tracking-tight sm:text-3xl">Quem ajuda o Guia a continuar</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">Conheça os mantenedores e as empresas que apoiam a construção do projeto.</p>
      </div>
      <div className="grid items-stretch gap-5 md:grid-cols-2"><Maintainers /><Community area="supporters" embedded /></div>
    </section>

    <section aria-labelledby="participar-do-guia" className="rounded-3xl border border-primary/20 bg-accent/40 p-6 sm:p-10">
      <HeartHandshake aria-hidden="true" className="mb-4 size-7 text-primary" />
      <h2 id="participar-do-guia" className="text-2xl font-semibold tracking-tight sm:text-3xl">Encontrou algo que vale compartilhar?</h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">Sugira um link ou uma correção para o catálogo. Para publicar, você entra com sua conta do GitHub.</p>
      <div className="mt-6 flex flex-wrap gap-3"><Button onClick={() => openContribution()}>Sugerir um recurso<ArrowUpRight /></Button><Button asChild variant="outline"><a href="#por-onde-comecar">Ver categorias<Compass /></a></Button></div>
    </section>
  </article>;
}
