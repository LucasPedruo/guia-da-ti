export type GuideStepId = 'explore' | 'communities' | 'creators' | 'study' | 'inform' | 'networking' | 'practice' | 'career' | 'forum' | 'contribute' | 'about' | 'transparency' | 'github-account' | 'github-login' | 'github-participate';
export type GuideStep = {
  id: GuideStepId; label: string; category: string; description: string; tip: string; action: string; href: string;
  reason?: string; selection?: string;
};

export const guideSteps = [
  {
    id: 'explore', label: 'Encontre o que procura', category: 'Explore',
    description: 'Use os menus para estudar, se informar, fazer networking, praticar ou procurar oportunidades. Nas listagens, pesquise pelo nome ou assunto.',
    tip: 'Combine a pesquisa com os filtros para reduzir a lista.',
    action: 'Explorar recursos', href: '/explorar',
  },
  {
    id: 'communities', label: 'Encontre sua comunidade', category: 'Comunidades',
    reason: 'Uma comunidade é um espaço para tirar dúvidas e trocar experiências com pessoas de interesses parecidos. Você pode participar mesmo no começo dos estudos.',
    selection: 'Comece pelo assunto que interessa a você. Veja o público, a localização e a plataforma do grupo. Leia as regras e observe as conversas antes de participar.',
    description: 'Escolha a plataforma e filtre por localização ou público. Clique em uma comunidade para ver os detalhes e os links dos seus grupos.',
    tip: 'No mapa, você pode selecionar vários estados, todo o Brasil ou comunidades internacionais.',
    action: 'Ver comunidades', href: '/comunidades',
  },
  {
    id: 'creators', label: 'Descubra quem acompanhar', category: 'Criadores',
    reason: 'Criadores compartilham tutoriais e experiências que podem ajudar nos seus estudos e na carreira. Acompanhar perspectivas diferentes ajuda a comparar caminhos.',
    selection: 'Escolha o tipo de conteúdo que procura e a rede que você usa. Abra o perfil e veja se a linguagem combina com seu momento.',
    description: 'Troque de rede nas abas e filtre pelo tipo de conteúdo. Use a pesquisa para encontrar um perfil e abra o link na rede do criador.',
    tip: 'Carreira, humor e tutoriais são algumas das categorias disponíveis.',
    action: 'Ver criadores', href: '/criadores',
  },
  {
    id: 'study', label: 'Escolha seu próximo estudo', category: 'Estudar',
    reason: 'Comparar fontes de estudo ajuda a decidir onde investir seu tempo. O Guia reúne links e avaliações para apoiar essa escolha.',
    selection: 'Defina o que você quer aprender e seu nível atual. Compare a grade, o idioma e as condições de acesso na fonte. Leia as experiências de outras pessoas.',
    description: 'Compare plataformas de cursos, faculdades, bootcamps, roadmaps, livros e certificações. Alterne entre cards e lista ou mude a ordenação.',
    tip: 'Abra um item para ler avaliações e comentários. Em Abrir site, você acessa o conteúdo na página de origem.',
    action: 'Ver plataformas de cursos', href: '/plataformas',
  },
  {
    id: 'inform', label: 'Acompanhe o que acontece em tecnologia', category: 'Se informar',
    reason: 'Acompanhar notícias e análises ajuda a entender mudanças na tecnologia. Consultar mais de uma fonte ajuda a colocar uma novidade em contexto.',
    selection: 'Escolha os assuntos que afetam seus estudos ou trabalho. Compare as fontes, confira a data e prefira textos que mostram de onde veio a informação.',
    description: 'Escolha notícias, blogs, newsletters ou podcasts no menu Se informar. Pesquise um assunto e abra o link para ler ou ouvir na fonte.',
    tip: 'Você também encontra artigos, tutoriais, pesquisas e estudos de caso.',
    action: 'Ver portais de notícias', href: '/noticias',
  },
  {
    id: 'networking', label: 'Encontre oportunidades de conhecer pessoas', category: 'Networking',
    reason: 'Encontros aproximam você de pessoas que trabalham ou estudam na mesma área. Uma conversa pode trazer referências, parcerias ou um novo ponto de vista.',
    selection: 'Veja o tema, o público e o formato do encontro. Confirme a localização, os custos e a programação. Escolha algo em que você tenha vontade de conversar.',
    description: 'Explore eventos, meetups, conferências e hackathons. Abra os detalhes e consulte a página do evento para confirmar a programação e a inscrição.',
    tip: 'Para conversar com um grupo no dia a dia, veja também a seção Comunidades.',
    action: 'Ver eventos', href: '/eventos',
  },
  {
    id: 'practice', label: 'Coloque seu conhecimento em prática', category: 'Praticar',
    reason: 'Praticar mostra o que você já consegue fazer e o que ainda precisa estudar. Projetos e desafios ajudam a transformar uma ideia em algo que funciona.',
    selection: 'Escolha um desafio que use o que você está aprendendo. Leia os requisitos e comece por uma tarefa pequena. Nos projetos, confira as orientações para contribuir.',
    description: 'Encontre ferramentas, projetos de código aberto, desafios e laboratórios. Escolha um recurso e acesse o site de origem para começar.',
    tip: 'Confira os requisitos do recurso antes de instalar algo ou iniciar um desafio.',
    action: 'Ver ferramentas', href: '/ferramentas',
  },
  {
    id: 'career', label: 'Procure seu próximo passo na carreira', category: 'Carreira',
    reason: 'Conhecer vagas e caminhos de formação ajuda a planejar seu próximo passo. Os requisitos também mostram quais conhecimentos você pode desenvolver.',
    selection: 'Compare as oportunidades com seu momento e seus objetivos. Confira os requisitos, o local de trabalho e os prazos. Leia as condições antes de se candidatar.',
    description: 'Use o menu Carreira para buscar vagas, estágios, bolsas e mentorias. Os links levam às páginas onde você consulta os requisitos e participa.',
    tip: 'Confirme os prazos e as condições na página de origem.',
    action: 'Ver vagas', href: '/vagas',
  },
  {
    id: 'forum', label: 'Troque ideias no fórum', category: 'Fórum',
    reason: 'Você pode aprender com experiências de outras pessoas e compartilhar o que descobriu. Uma dúvida bem explicada também pode ajudar quem chega depois.',
    selection: 'Pesquise antes de abrir um tópico. Ao perguntar, explique seu objetivo, o que tentou e onde ficou a dúvida. Ao responder, mantenha o foco na conversa.',
    description: 'No Início, pesquise conversas e leia os comentários. Entre com GitHub para abrir um tópico, responder ou avaliar um recurso de estudo.',
    tip: 'Se você ainda não tem uma conta no GitHub, a opção de entrar explica como criar uma.',
    action: 'Abrir fórum', href: '/',
  },
  {
    id: 'contribute', label: 'Indique algo que vale conhecer', category: 'Contribua',
    description: 'Use o botão de sugestão da seção. Preencha as etapas, adicione uma imagem e confira a prévia antes de enviar.',
    tip: 'Os mantenedores revisam os cadastros. Criadores e comunidades vão para revisão do catálogo. As demais sugestões abrem uma conversa no fórum.',
    action: 'Enviar uma sugestão', href: '/?sugerir=',
  },
] as const satisfies readonly GuideStep[];

export const githubGuideSteps: readonly GuideStep[] = [
  {
    id: 'github-account', label: 'Crie sua conta no GitHub', category: 'Sua conta',
    description: 'O GitHub identifica você nas conversas e contribuições do Guia. A conta é gratuita. Você não precisa saber programar para participar.',
    tip: 'Abra o cadastro, informe seu e-mail e escolha uma senha. Siga as instruções do GitHub para confirmar a conta.',
    action: 'Criar conta no GitHub', href: 'https://github.com/signup',
  },
  {
    id: 'github-login', label: 'Volte ao Guia e entre', category: 'Seu login',
    description: 'Depois de confirmar sua conta, volte ao Guia e clique em Entrar com GitHub. Na janela do GitHub, revise a autorização antes de continuar.',
    tip: 'Seu nome e suas publicações ficam públicos. Você pode consultar suas autorizações nas configurações da conta do GitHub.',
    action: 'Ver configurações do GitHub', href: 'https://github.com/settings/applications',
  },
  {
    id: 'github-participate', label: 'Participe com sua conta', category: 'Sua participação',
    description: 'Com o login concluído, você pode abrir tópicos e responder no fórum. Também pode avaliar recursos de estudo e enviar sugestões para revisão.',
    tip: 'Explorar as listagens e ler as conversas não exige uma conta. Entre quando quiser publicar algo.',
    action: 'Explorar o fórum', href: '/',
  },
];

export const aboutGuideSteps: readonly GuideStep[] = [
  {
    id: 'about', label: 'Um guia de links feito pela comunidade', category: 'O projeto',
    description: 'O Guia reúne indicações de sites, conteúdos e oportunidades de tecnologia. Você explora por categoria e acessa o conteúdo na página de origem.',
    tip: 'Cursos e atividades ficam nos sites indicados. Aqui, você encontra os links e pode trocar experiências no fórum.',
    action: 'Explorar o catálogo', href: '/explorar',
  },
  guideSteps.find(step => step.id === 'forum')!,
  {
    ...guideSteps.find(step => step.id === 'contribute')!,
    label: 'A comunidade indica, os mantenedores revisam',
    description: 'Qualquer pessoa pode sugerir um recurso ou uma correção. Os mantenedores revisam os cadastros antes de incluí-los no catálogo.',
    tip: 'Confira a data de atualização de cada item. Se encontrar algo desatualizado, você pode propor uma correção pelo link Editar informação.',
  },
  {
    id: 'transparency', label: 'Você pode acompanhar o projeto', category: 'Aberto e colaborativo',
    description: 'O catálogo e seu histórico ficam públicos no GitHub. Em Sobre, você encontra os mantenedores e as empresas que apoiam o Guia.',
    tip: 'Itens marcados como Exemplo fictício servem para demonstrar a navegação. Eles não são indicações de recursos reais.',
    action: 'Ver mantenedores', href: '/sobre#mantenedores',
  },
];

export const animationGuideSteps: readonly GuideStep[] = [...guideSteps, ...githubGuideSteps, ...aboutGuideSteps];

export function guideSectionForGroup(group?: string): GuideStepId {
  const sections: Record<string, GuideStepId> = { communities: 'communities', creators: 'creators', learn: 'study', inform: 'inform', connect: 'networking', create: 'practice', opportunities: 'career' };
  return sections[group ?? ''] ?? 'explore';
}
