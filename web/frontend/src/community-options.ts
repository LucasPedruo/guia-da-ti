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

export const communityAudiences = [
  {id:'general',name:'Geral'}, {id:'male',name:'Masculina'},
  {id:'female',name:'Feminina'}, {id:'lgbt',name:'LGBT+'},
];
export const primaryCommunityPlatforms = ['whatsapp','telegram','discord','facebook','linkedin','reddit','github','website'];
export const communityTabIds = ['all', ...primaryCommunityPlatforms, 'other'];

export type CommunityMembers = {count:number;moreThan?:boolean;checkedAt:string};
export function communityMembersLabel(members:CommunityMembers) {
  return `${members.moreThan?'Mais de ':''}${new Intl.NumberFormat('pt-BR').format(members.count)} ${members.count===1?'membro':'membros'}`;
}
