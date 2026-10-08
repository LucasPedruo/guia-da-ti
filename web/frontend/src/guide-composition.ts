import { gsap } from 'gsap';
import './guide-composition.css';
import { animationGuideSteps } from './guide-steps';
import runtimeUrl from '../node_modules/@hyperframes/core/dist/hyperframe.runtime.iife.js?url';

const parameters = new URLSearchParams(location.search);
const step = animationGuideSteps.find(item => item.id === parameters.get('secao')) ?? animationGuideSteps[0];
document.documentElement.classList.toggle('dark', parameters.get('tema') === 'escuro');
const root = document.getElementById('guide-scene')!;

const row = (title: string, detail: string, icon: string) => `<div class="result"><span class="result-icon">${icon}</span><div><strong>${title}</strong><small>${detail}</small></div><span class="row-arrow">↗</span></div>`;
const search = (text: string) => `<div class="search"><span>⌕</span><span class="query">${text}</span><span class="search-hint">Pesquisar</span></div>`;
const tabs = (items: string[]) => `<div class="tabs">${items.map((label, index) => `<span class="tab ${index === 1 ? 'target' : ''}">${label}</span>`).join('')}</div>`;
const completion = (text: string) => `<div class="completion"><span>✓</span>${text}</div>`;

const scenes: Record<typeof step.id, string> = {
  explore: `<div class="scene-title"><span>Explore o Guia</span><small>Links para o seu próximo passo</small></div>
    ${tabs(['Estudar', 'Se informar', 'Praticar', 'Carreira'])}${search('Roadmaps')}
    <div class="results">${row('roadmap.sh', 'Trilhas para orientar seus estudos', '↗')}${row('Livros', 'Referências para aprender e consultar', '▤')}</div>${completion('Encontre um link pelo nome ou assunto')}`,
  communities: `<div class="scene-title"><span>Comunidades</span><small>Encontre pessoas perto de você</small></div>
    ${tabs(['Geral', 'WhatsApp', 'Discord', 'LinkedIn'])}<div class="filter-panel"><div><small>LOCALIZAÇÃO</small><div class="regions"><span>Estados</span><span class="target">Brasil inteiro</span><span>Internacional</span></div></div><div class="map-dots"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
    <div class="results">${row('FullDev', 'Comunidade nacional · Várias plataformas', 'F')}</div>${completion('Abra a comunidade e escolha um grupo')}`,
  creators: `<div class="scene-title"><span>Criadores</span><small>Encontre conteúdo para acompanhar</small></div>
    ${tabs(['YouTube', 'Instagram', 'LinkedIn', 'TikTok'])}${search('Carreira')}
    <div class="results"><div class="profile result"><div class="avatar">LP</div><div><strong>devlucaspedro</strong><small>Conteúdo de tecnologia</small><span class="chip">Carreira</span></div><span class="profile-link target">Ver perfil ↗</span></div></div>${completion('Acompanhe o perfil na rede do criador')}`,
  study: `<div class="scene-title"><span>Plataformas de cursos</span><small>Compare antes de escolher</small></div>
    <div class="study-toolbar"><span class="target">Mais hypado⌄</span><span>▦ Cards</span><span>☷ Lista</span></div><div class="study-cards results"><div class="study-card"><div class="cover">freeCodeCamp</div><strong>freeCodeCamp</strong><small>Cursos e prática em programação</small><div class="stars">★★★★★</div></div><div class="study-card"><div class="cover cover-alt">MIT</div><strong>OpenCourseWare</strong><small>Conteúdo de cursos do MIT</small><div class="stars">★★★★★</div></div></div>
    ${completion('Leia os detalhes e use Abrir site')}`,
  inform: `<div class="scene-title"><span>Se informar</span><small>Acompanhe tecnologia na fonte</small></div>${tabs(['Notícias', 'Blogs', 'Newsletters', 'Podcasts'])}${search('Tecnologia')}
    <div class="results">${row('Portais de notícias', 'Leia as publicações no site de origem', '▤')}${row('Artigos e tutoriais', 'Encontre referências para consultar', '↗')}</div>${completion('Escolha uma fonte para ler ou ouvir')}`,
  networking: `<div class="scene-title"><span>Networking</span><small>Conheça pessoas e troque experiências</small></div>${tabs(['Eventos', 'Meetups', 'Conferências', 'Hackathons'])}${search('Encontros de tecnologia')}
    <div class="results">${row('Encontros da comunidade', 'Veja os detalhes e a programação', '◷')}${row('Hackathons', 'Conheça os desafios e as inscrições', '⌘')}</div>${completion('Confirme a inscrição no site do evento')}`,
  practice: `<div class="scene-title"><span>Praticar</span><small>Transforme estudo em experiência</small></div>${tabs(['Ferramentas', 'Open source', 'Desafios', 'Laboratórios'])}${search('Projetos')}
    <div class="results">${row('Projetos de código aberto', 'Encontre projetos para explorar', '⌘')}${row('Desafios e laboratórios', 'Pratique com os recursos disponíveis', '↗')}</div>${completion('Acesse o recurso para começar a praticar')}`,
  career: `<div class="scene-title"><span>Carreira</span><small>Encontre seu próximo passo</small></div>${tabs(['Vagas', 'Estágios', 'Bolsas', 'Mentorias'])}${search('Oportunidades')}
    <div class="results">${row('Vagas e estágios', 'Consulte os requisitos da oportunidade', '▣')}${row('Bolsas e mentorias', 'Confira as condições e os prazos', '↗')}</div>${completion('Participe pela página de origem')}`,
  forum: `<div class="scene-title"><span>Fórum</span><small>Converse sobre tecnologia</small></div>${search('Como começar a programar?')}
    <div class="conversation results"><div class="comment"><div class="small-avatar">?</div><div><strong>Por onde começar?</strong><small>Compartilhe uma dúvida com a comunidade</small></div></div><div class="reply"><div class="small-avatar">↳</div><div><strong>Troque experiências</strong><small>Leia, responda e participe da conversa</small></div></div><div class="comment-input"><span>Escreva seu comentário…</span><span class="target">Comentar</span></div></div>${completion('Entre com GitHub para participar')}`,
  contribute: `<div class="scene-title"><span>Sugerir recurso</span><small>Uma indicação sua pode ajudar alguém</small></div><div class="wizard"><div class="wizard-form"><div class="wizard-progress"><i></i><i></i><i></i></div><small>CONTE SOBRE SUA INDICAÇÃO</small><strong>Qual é o nome?</strong><div class="fake-input">Minha indicação</div><span class="target">Continuar →</span></div><div class="preview results"><div class="preview-cover">↗</div><span class="chip">Prévia</span><strong>Minha indicação</strong><small>Os dados aparecem aqui conforme você preenche</small></div></div>${completion('Confira a prévia e envie para revisão')}`,
  about: `<div class="scene-title"><span>Sobre o Guia da TI</span><small>Feito pela comunidade</small></div>${tabs(['Catálogo', 'Fórum', 'Mantenedores'])}${search('Links de tecnologia')}
    <div class="results">${row('Conteúdo no site de origem', 'Explore o catálogo e encontre uma referência', '↗')}${row('Trocas no fórum', 'Converse com a comunidade aqui no Guia', '↳')}</div>${completion('Explore sem precisar criar uma conta')}`,
  transparency: `<div class="scene-title"><span>Aberto e colaborativo</span><small>Acompanhe o catálogo no GitHub</small></div>${tabs(['Cadastros', 'Histórico', 'Mantenedores'])}
    <div class="results">${row('Comunidade sugere', 'Pessoas indicam recursos e correções', '+')}${row('Mantenedores revisam', 'O cadastro passa por revisão antes de entrar', '✓')}${row('Catálogo público', 'Você pode consultar o histórico das mudanças', '↗')}</div>${completion('Confira também a data de atualização de cada item')}`,
  'github-account': `<div class="scene-title"><span>Criar conta no GitHub</span><small>Não precisa saber programar</small></div><div class="wizard"><div class="wizard-form"><small>CRIE SUA CONTA</small><div class="fake-input">Seu e-mail</div><div class="fake-input">Escolha uma senha</div><span class="target">Continuar →</span></div><div class="preview results"><div class="preview-cover">✉</div><strong>Confirme seu e-mail</strong><small>Siga as instruções do GitHub para confirmar a conta</small></div></div>${completion('Depois, volte ao Guia para entrar')}`,
  'github-login': `<div class="scene-title"><span>Entre para participar</span><small>Use sua conta do GitHub</small></div>${tabs(['Guia da TI', 'Entrar com GitHub'])}
    <div class="results">${row('A janela do GitHub abre', 'Entre com a conta que você criou', '↗')}${row('Revise a autorização', 'Confira as permissões antes de continuar', '✓')}${row('Volte para o Guia', 'Seu perfil aparece depois do login', '↳')}</div>${completion('A senha é informada na página do GitHub')}`,
  'github-participate': `<div class="scene-title"><span>Você entrou no Guia</span><small>Participe com sua conta</small></div>${tabs(['Ler conversas', 'Responder', 'Sugerir recurso'])}${search('Uma dúvida sobre tecnologia')}
    <div class="results">${row('Participe do fórum', 'Abra tópicos e responda às conversas', '↳')}${row('Indique um recurso', 'Envie uma sugestão para revisão', '+')}</div>${completion('Seu nome acompanha suas publicações')}`,
};

// Only fixed, authored scenes reach innerHTML. Query parameters select an existing scene.
root.innerHTML = `<div class="browser"><div class="browser-bar"><div class="window-dots"><i></i><i></i><i></i></div><span>Guia da TI</span><span class="demo-label">Demonstração</span></div><div class="browser-body">${scenes[step.id]}</div></div><div class="cursor" aria-hidden="true"><svg width="30" height="36" viewBox="0 0 30 36"><path d="M3 2v26l7-7 7 13 5-3-7-12h11Z" fill="var(--text)" stroke="var(--surface)" stroke-width="2" /></svg><span></span></div>`;

const target = root.querySelector<HTMLElement>('.target')!;
const bounds = target.getBoundingClientRect();
const targetX = bounds.left + bounds.width * 0.65;
const targetY = bounds.top + bounds.height * 0.6;
const colors = getComputedStyle(root);
const timeline = gsap.timeline({ paused: true });
timeline.from('.browser', { opacity: 0, y: 18, duration: 0.65, ease: 'power2.out' }, 0);
timeline.from('.scene-title', { opacity: 0, y: 8, duration: 0.4 }, 0.3);
timeline.fromTo('.cursor', { x: 670, y: 340, opacity: 0 }, { x: targetX, y: targetY, opacity: 1, duration: 1.1, ease: 'power2.inOut' }, 0.7);
timeline.to('.cursor', { scale: 0.88, duration: 0.12 }, 1.85);
timeline.to('.cursor', { scale: 1, duration: 0.15 }, 1.97);
timeline.to('.target', { backgroundColor: colors.getPropertyValue('--accent').trim(), color: colors.getPropertyValue('--on-accent').trim(), borderColor: colors.getPropertyValue('--accent').trim(), duration: 0.25 }, 1.9);
timeline.fromTo('.cursor span', { scale: 0.2, opacity: 0.65 }, { scale: 2.4, opacity: 0, duration: 0.55 }, 1.9);
if (root.querySelector('.query')) timeline.from('.query', { width: 0, duration: 0.9, ease: 'none' }, 2.1);
timeline.from('.results', { opacity: 0, y: 12, duration: 0.5, ease: 'power2.out' }, 3);
if (root.querySelector('.result, .study-card, .reply')) timeline.from('.result, .study-card, .reply', { opacity: 0, y: 8, stagger: 0.15, duration: 0.4 }, 3.1);
timeline.to('.cursor', { opacity: 0, duration: 0.3 }, 4.2);
timeline.from('.completion', { opacity: 0, y: 10, duration: 0.5, ease: 'power2.out' }, 4.6);
timeline.set({}, {}, 8);
(window as Window & { __timelines?: Record<string, gsap.core.Timeline> }).__timelines = { guide: timeline };

// Load the bridge ourselves: URL-based players otherwise inject their CDN runtime.
// Awaiting it keeps the iframe load event behind runtime initialization.
await new Promise<void>(resolve => {
  const runtime = document.createElement('script');
  runtime.src = runtimeUrl;
  runtime.onload = () => resolve();
  runtime.onerror = () => resolve(); // The player can still use the registered GSAP timeline.
  document.head.appendChild(runtime);
});
