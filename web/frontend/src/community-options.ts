export const communityCategoryOrder = ['geral', 'networking', 'eventos', 'vagas'];
export const communityModalities = [
  {id:'online',name:'Online'}, {id:'in-person',name:'Presencial'}, {id:'hybrid',name:'Híbrida'},
];
export const communityPlatforms = [
  {id:'whatsapp',name:'WhatsApp'}, {id:'telegram',name:'Telegram'}, {id:'discord',name:'Discord'},
  {id:'slack',name:'Slack'}, {id:'facebook',name:'Facebook'}, {id:'linkedin',name:'LinkedIn'},
  {id:'meetup',name:'Meetup'}, {id:'reddit',name:'Reddit'}, {id:'github',name:'GitHub Discussions'},
  {id:'discourse',name:'Discourse'}, {id:'circle',name:'Circle'}, {id:'mighty-networks',name:'Mighty Networks'},
  {id:'website',name:'Site próprio'}, {id:'other',name:'Outra plataforma'},
];

export const primaryCommunityPlatforms = ['whatsapp','telegram','discord','facebook','linkedin','reddit','github'];
export const communityTabIds = ['all', ...primaryCommunityPlatforms, 'other'];
