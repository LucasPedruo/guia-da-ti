import { useEffect, useState } from 'react';
import { UserRound } from 'lucide-react';
import { LoadingImage } from './LoadingImage';
import { Skeleton } from '@/components/ui/skeleton';

export type CreatorProfile = {
  network: string; url: string; name: string; description: string; avatarUrl: string | null;
  followers: number | null; followersText: string | null; checkedAt: string;
};
const profileCache = new Map<string, CreatorProfile>();
export function useCreatorProfile(url: string, enabled: boolean, delay = 500) {
  const canFetch = enabled && !!url && URL.canParse(url) && new URL(url).hostname !== 'example.org';
  const [state, setState] = useState<{ profile: CreatorProfile | null; loading: boolean; error: string }>({ profile: delay === 0 ? profileCache.get(url) || null : null, loading: canFetch, error: '' });
  useEffect(() => {
    if (!canFetch) { setState({ profile: null, loading: false, error: '' }); return; }
    const cached = delay === 0 ? profileCache.get(url) : undefined;
    if (cached) { setState({profile:cached,loading:false,error:''}); return; }
    setState({ profile: null, loading: true, error: '' });
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setState({ profile: null, loading: true, error: '' });
      fetch('/api/creators/profile?url=' + encodeURIComponent(url), { signal: controller.signal })
        .then(async response => {
          const result = await response.json();
          if (!response.ok) throw Error(result.error || 'Não foi possível buscar este perfil.');
          return result as CreatorProfile;
        }).then(profile => { if (!controller.signal.aborted) { if (profileCache.size >= 200) profileCache.delete(profileCache.keys().next().value!); profileCache.set(url, profile); setState({ profile, loading: false, error: '' }); } })
        .catch(error => { if (!controller.signal.aborted) setState({ profile: null, loading: false, error: error instanceof Error ? error.message : 'Perfil indisponível.' }); });
    }, delay);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [url, canFetch, delay]);
  return state;
}
export function CreatorAvatar({ profile, name, imageUrl, loading = false }: { profile: CreatorProfile | null; name: string; imageUrl?: string; loading?: boolean }) {
  const fallback = <span aria-label="Foto indisponível" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted"><UserRound className="size-5 text-muted-foreground" /></span>;
  return imageUrl || profile?.avatarUrl
    ? <LoadingImage src={imageUrl || profile!.avatarUrl!} alt={'Foto de ' + name} width={40} height={40} referrerPolicy="no-referrer" className="size-10 shrink-0 rounded-full" imageClassName="object-cover" fallback={fallback} />
    : loading ? <Skeleton aria-label={'Carregando foto de ' + name} className="size-10 shrink-0 rounded-full" /> : fallback;
}
export function followersLabel(profile: CreatorProfile | null) {
  return profile?.followers != null ? profile.followers.toLocaleString('pt-BR') + (profile.network === 'youtube' ? ' inscritos' : ' seguidores')
    : profile?.followersText ? profile.followersText + ' seguidores' : 'Seguidores não informados pela rede';
}
