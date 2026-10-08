import {Plus} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {openContribution} from './contribution-actions';
const nouns:Record<string,string>={courses:'curso',platforms:'plataforma',universities:'faculdade',bootcamps:'bootcamp',roadmaps:'roadmap',books:'livro',
  certifications:'certificação',news:'portal de notícias',blogs:'blog',newsletters:'newsletter',podcasts:'podcast',creators:'criador',youtube:'canal',
  articles:'artigo',tutorials:'tutorial',studies:'estudo','case-studies':'estudo de caso',reports:'relatório',communities:'comunidade',events:'evento',
  meetups:'meetup',conferences:'conferência',hackathons:'hackathon',tools:'ferramenta','open-source':'projeto de código aberto',challenges:'desafio',
  labs:'laboratório',jobs:'vaga',internships:'estágio',scholarships:'bolsa',mentoring:'mentoria',volunteering:'oportunidade de voluntariado'};
export function SuggestResource({type}:{type?:string}) {
  const noun=type?nouns[type]:undefined;
  return <Button variant="default" size="default" onClick={() => openContribution(type)}><Plus />{noun?'Sugerir '+noun:'Contribuir com o guia'}</Button>;
}
