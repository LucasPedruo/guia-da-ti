import { BookOpen, GraduationCap, Newspaper, Headphones, Video, Users, CalendarDays, Code, Wrench, BriefcaseBusiness, FlaskConical, FileText, Mail, Map, Award, HeartHandshake, Info, type LucideIcon } from 'lucide-react';

const details: Record<string, { icon: LucideIcon; description: string }> = {
  courses: { icon: GraduationCap, description: 'Aprenda com cursos de tecnologia.' },
  platforms: { icon: BookOpen, description: 'Encontre onde estudar no seu ritmo.' },
  universities: { icon: GraduationCap, description: 'Explore a formação acadêmica em TI.' },
  bootcamps: { icon: Code, description: 'Programas intensivos para sua formação.' },
  roadmaps: { icon: Map, description: 'Caminhos para orientar seus estudos.' },
  books: { icon: BookOpen, description: 'Leituras para ampliar seu repertório.' },
  certifications: { icon: Award, description: 'Qualificações para sua trajetória.' },
  news: { icon: Newspaper, description: 'Acompanhe o que acontece em tecnologia.' },
  blogs: { icon: FileText, description: 'Ideias e experiências de quem faz TI.' },
  newsletters: { icon: Mail, description: 'Conteúdos para receber por e-mail.' },
  podcasts: { icon: Headphones, description: 'Tecnologia para ouvir onde quiser.' },
  youtube: { icon: Video, description: 'Canais para aprender e se atualizar.' },
  creators: { icon: Users, description: 'Conheça quem compartilha conhecimento.' },
  articles: { icon: FileText, description: 'Aprofunde seus conhecimentos.' },
  tutorials: { icon: Code, description: 'Aprenda seguindo exemplos práticos.' },
  studies: { icon: FlaskConical, description: 'Pesquisas para explorar novas ideias.' },
  'case-studies': { icon: BriefcaseBusiness, description: 'Veja como soluções funcionam na prática.' },
  reports: { icon: FileText, description: 'Dados e análises sobre tecnologia.' },
  communities: { icon: Users, description: 'Encontre pessoas com interesses em comum.' },
  events: { icon: CalendarDays, description: 'Descubra encontros de tecnologia.' },
  meetups: { icon: Users, description: 'Troque experiências em encontros locais.' },
  conferences: { icon: CalendarDays, description: 'Conecte-se com ideias e profissionais.' },
  hackathons: { icon: Code, description: 'Crie soluções junto com outras pessoas.' },
  tools: { icon: Wrench, description: 'Recursos para facilitar seu trabalho.' },
  'open-source': { icon: Code, description: 'Projetos abertos para usar e contribuir.' },
  challenges: { icon: Award, description: 'Coloque seus conhecimentos em prática.' },
  labs: { icon: FlaskConical, description: 'Experimente e aprenda fazendo.' },
  jobs: { icon: BriefcaseBusiness, description: 'Encontre oportunidades em tecnologia.' },
  internships: { icon: GraduationCap, description: 'Dê os primeiros passos na carreira.' },
  scholarships: { icon: BookOpen, description: 'Apoio para continuar seus estudos.' },
  mentoring: { icon: Users, description: 'Orientação para o seu próximo passo.' },
  volunteering: { icon: HeartHandshake, description: 'Contribua com causas e projetos.' },
  about: { icon: Info, description: 'Conheça o Guia e seus contribuidores.' },
  supporters: { icon: HeartHandshake, description: 'Empresas que apoiam a comunidade.' },
};

export function NavigationCard({ id, name }: { id: string; name: string }) {
  const { icon: Icon, description } = details[id] || { icon: BookOpen, description: 'Explore os recursos desta categoria.' };
  return <>
    <span className="navigation-card-icon"><Icon className="size-5" aria-hidden="true" /></span>
    <span className="min-w-0 space-y-1"><span className="block text-sm font-medium">{name}</span><span className="block text-xs leading-relaxed text-muted-foreground">{description}</span></span>
  </>;
}
