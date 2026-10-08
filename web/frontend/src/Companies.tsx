import { BookOpen, HeartHandshake, Megaphone, MessageSquareText, MousePointerClick, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Advertisement } from './Advertisement';

const placements = [
  { icon: MessageSquareText, title: 'Entre os tópicos do fórum', location: 'Início', description: 'Um espaço por página da lista de conversas. Ele aparece depois do terceiro tópico quando há pelo menos quatro, ou antes quando a lista é menor.' },
  { icon: Users, title: 'Dentro de uma conversa', location: 'Tópicos do fórum', description: 'Depois do conteúdo do tópico e antes do campo para comentar. O anúncio fica separado da conversa e das respostas.' },
  { icon: BookOpen, title: 'Nas discussões de Estudar', location: 'Itens com discussão disponível', description: 'Na conversa vinculada a plataformas de cursos, faculdades, bootcamps, roadmaps, livros e certificações. O espaço aparece antes dos comentários.' },
];

export function Companies() {
  return <article className="mx-auto w-full max-w-4xl space-y-10">
    <header data-motion className="space-y-5 rounded-2xl border bg-card p-6 sm:p-8">
      <Badge variant="secondary"><Megaphone className="size-3.5" aria-hidden="true" />Para empresas</Badge>
      <h1 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">Sua empresa perto de quem vive tecnologia</h1>
      <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">O Guia da TI reúne links de estudo, carreira e comunidades. No fórum, as pessoas compartilham dúvidas e experiências sobre tecnologia.</p>
      <p className="max-w-2xl text-sm leading-relaxed">Divulgue uma solução relacionada a esse público em espaços identificados como publicidade. Sua mensagem aparece junto às conversas, com uma área própria.</p>
    </header>

    <section aria-labelledby="companies-benefits" className="space-y-5">
      <h2 id="companies-benefits" className="text-2xl font-semibold tracking-tight">Por que divulgar no Guia?</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {[{ icon: Users, title: 'Público de tecnologia', text: 'Fale com pessoas que procuram fontes de estudo, ferramentas e oportunidades de carreira.' }, { icon: MessageSquareText, title: 'Contexto de conversa', text: 'Apresente sua empresa onde as pessoas trocam experiências e discutem suas escolhas.' }, { icon: MousePointerClick, title: 'Visitas ao seu site', text: 'Uma campanha pode levar quem se interessa ao seu site, onde você apresenta sua oferta.' }].map(item => <Card key={item.title} data-motion className="gap-3 shadow-none"><CardHeader><item.icon className="mb-2 size-5 text-primary" aria-hidden="true" /><CardTitle className="text-base">{item.title}</CardTitle></CardHeader><CardContent><p className="text-sm leading-relaxed text-muted-foreground">{item.text}</p></CardContent></Card>)}
      </div>
    </section>

    <section aria-labelledby="companies-placements" className="space-y-5">
      <div className="space-y-2"><h2 id="companies-placements" className="text-2xl font-semibold tracking-tight">Onde sua empresa pode aparecer</h2><p className="text-sm leading-relaxed text-muted-foreground">Estes são os espaços de publicidade já previstos na estrutura do site.</p></div>
      <ol className="space-y-3">{placements.map((placement, index) => <li key={placement.title} data-motion className="flex gap-4 rounded-xl border bg-card p-5"><span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">{index + 1}</span><div className="min-w-0 space-y-2"><Badge variant="outline"><placement.icon className="size-3" aria-hidden="true" />{placement.location}</Badge><h3 className="font-semibold">{placement.title}</h3><p className="text-sm leading-relaxed text-muted-foreground">{placement.description}</p></div></li>)}</ol>
      <div className="rounded-xl border border-dashed p-4 sm:p-5"><p className="mb-3 text-xs font-medium text-muted-foreground">Prévia do espaço reservado</p><Advertisement preview /></div>
      <p className="text-sm leading-relaxed text-muted-foreground">Os anúncios ficam no fórum. As listagens de criadores, comunidades e recursos não têm esse bloco de publicidade.</p>
    </section>

    <section data-motion aria-labelledby="companies-supporters" className="flex flex-col gap-4 rounded-2xl border bg-card p-6 sm:flex-row sm:p-8">
      <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><HeartHandshake className="size-5" /></span>
      <div className="space-y-3"><h2 id="companies-supporters" className="text-xl font-semibold tracking-tight">Empresas apoiadoras</h2><p className="text-sm leading-relaxed text-muted-foreground">As empresas que apoiam o Guia também têm uma área no Início e em Sobre, com nome e link para o site oficial.</p><p className="text-sm leading-relaxed text-muted-foreground">Essa apresentação é separada dos anúncios do fórum. O formato de presença precisa ser combinado para cada parceria.</p></div>
    </section>

    <aside className="rounded-xl border bg-muted/30 p-5 text-sm leading-relaxed text-muted-foreground">As campanhas têm datas e espaços definidos para cada parceria. Os anúncios alternam dentro de cada espaço. Formatos, valores e duração das campanhas são combinados com a empresa.</aside>
  </article>;
}
