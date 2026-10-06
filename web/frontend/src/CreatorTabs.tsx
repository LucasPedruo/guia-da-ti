import { Instagram, Linkedin, Youtube } from 'lucide-react';
import { Tabs } from 'radix-ui';
import type { ReactNode } from 'react';

function TikTokIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true"><path d="M14 3h3c0 3 2 5 5 5v3a9 9 0 0 1-5-2v8a5 5 0 1 1-5-5v3a2 2 0 1 0 2 2Z" /></svg>;
}
function XIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className} aria-hidden="true"><path d="m4 3 12 18h4L8 3H4Zm0 18L20 3" /></svg>;
}
export const creatorNetworks = [
  { id: 'youtube', name: 'YouTube', Icon: Youtube, domains: ['youtube.com', 'youtu.be'] },
  { id: 'instagram', name: 'Instagram', Icon: Instagram, domains: ['instagram.com'] },
  { id: 'tiktok', name: 'TikTok', Icon: TikTokIcon, domains: ['tiktok.com'] },
  { id: 'linkedin', name: 'LinkedIn', Icon: Linkedin, domains: ['linkedin.com'] },
  { id: 'twitter', name: 'Twitter / X', Icon: XIcon, domains: ['twitter.com', 'x.com'] },
];

export function CreatorTabs() {
  return <Tabs.List aria-label="Redes dos criadores" className="flex flex-wrap gap-1 border-b pb-2">
    {creatorNetworks.map(({ id, name, Icon }) => <Tabs.Trigger key={id} value={id} className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted/50 data-[state=active]:bg-accent data-[state=active]:font-medium data-[state=active]:text-accent-foreground focus-visible:outline-2 focus-visible:outline-ring"><Icon className="size-4 shrink-0" aria-hidden="true" />{name}</Tabs.Trigger>)}
  </Tabs.List>;
}

export function CreatorTabsRoot({ enabled, value, onChange, children }: { enabled: boolean; value: string; onChange: (value: string) => void; children: ReactNode }) {
  return enabled ? <Tabs.Root value={value} onValueChange={onChange} asChild>{children}</Tabs.Root> : <>{children}</>;
}

export function CreatorTabPanel({ enabled, value, children }: { enabled: boolean; value: string; children: ReactNode }) {
  return enabled ? <Tabs.Content value={value} forceMount asChild>{children}</Tabs.Content> : <>{children}</>;
}
