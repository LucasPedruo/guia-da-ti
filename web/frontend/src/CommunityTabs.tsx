import {Facebook,Github,Linkedin,Users,Ellipsis,Send,Globe2} from 'lucide-react';
import {Tabs} from 'radix-ui';
import type {ReactNode} from 'react';

function BrandIcon({className,children}:{className?:string;children:ReactNode}) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">{children}</svg>;
}
function WhatsAppIcon({className}:{className?:string}) {
  return <BrandIcon className={className}><path d="M21 11.5a9 9 0 0 1-13.5 7.8L3 21l1.6-4.4A9 9 0 1 1 21 11.5Z"/><path d="m8 7 2 3-1 1c1 2 2 3 4 4l1-1 3 2c-1 2-2 2-4 1-3-1-6-4-7-7-1-2 0-3 2-3Z"/></BrandIcon>;
}
function DiscordIcon({className}:{className?:string}) {
  return <BrandIcon className={className}><path d="m8 5-3 1c-2 3-3 7-3 11l5 3 1-2m8-13 3 1c2 3 3 7 3 11l-5 3-1-2M8 5l1 2m7-2-1 2M6 16c4 2 8 2 12 0"/><ellipse cx="8.5" cy="12" rx="1" ry="1.5"/><ellipse cx="15.5" cy="12" rx="1" ry="1.5"/></BrandIcon>;
}
function RedditIcon({className}:{className?:string}) {
  return <BrandIcon className={className}><ellipse cx="12" cy="15" rx="9" ry="6"/><path d="m12 9 1-6 5 1M8 17c2 2 6 2 8 0"/><circle cx="20" cy="4" r="2"/><path d="M4 11c-3-3-5 2-1 3m17-3c3-3 5 2 1 3"/><circle cx="8.5" cy="14" r=".7" fill="currentColor"/><circle cx="15.5" cy="14" r=".7" fill="currentColor"/></BrandIcon>;
}
const platforms=[
  {id:'all',name:'Geral',Icon:Users}, {id:'whatsapp',name:'WhatsApp',Icon:WhatsAppIcon},
  {id:'telegram',name:'Telegram',Icon:Send}, {id:'discord',name:'Discord',Icon:DiscordIcon},
  {id:'facebook',name:'Facebook',Icon:Facebook}, {id:'linkedin',name:'LinkedIn',Icon:Linkedin},
  {id:'reddit',name:'Reddit',Icon:RedditIcon}, {id:'github',name:'GitHub',Icon:Github}, {id:'website',name:'Site próprio',Icon:Globe2}, {id:'other',name:'Outra',Icon:Ellipsis},
];
export function CommunityTabs() {
  return <Tabs.List aria-label="Plataformas das comunidades" className="flex flex-wrap gap-1 border-b pb-2">
    {platforms.map(({id,name,Icon})=><Tabs.Trigger key={id} value={id} className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted/50 data-[state=active]:bg-accent data-[state=active]:font-medium data-[state=active]:text-accent-foreground focus-visible:outline-2 focus-visible:outline-ring"><Icon className="size-4 shrink-0" aria-hidden="true"/>{name}</Tabs.Trigger>)}
  </Tabs.List>;
}
