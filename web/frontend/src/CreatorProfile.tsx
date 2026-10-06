import { useEffect, useState } from 'react';
import { UserRound } from 'lucide-react';

export type CreatorProfile = {
  network: string; url: string; name: string; description: string; avatarUrl: string | null;
  followers: number | null; followersText: string | null; checkedAt: string;
};
export function useCreatorProfile(url: string, enabled: boolean) {
  const [state, setState] = useState<{ profile: CreatorProfile | null; loading: boolean; error: string }>({ profile: null, loading: false, error: '' });
  useEffect(() => {
    setState({ profile: null, loading: false, error: '' });
    if (!enabled || !url || !URL.canParse(url) || new URL(url).hostname === 'example.org') return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setState({ profile: null, loading: true, error: '' });
      fetch('/api/creators/profile?url=' + encodeURIComponent(url), { signal: controller.signal })
        .then(async response => {
          const result = await response.json();
          if (!response.ok) throw Error(result.error || 'Não foi possível buscar este perfil.');
          return result as CreatorProfile;
        }).then(profile => { if (!controller.signal.aborted) setState({ profile, loading: false, error: '' }); })
        .catch(error => { if (!controller.signal.aborted) setState({ profile: null, loading: false, error: error instanceof Error ? error.message : 'Perfil indisponível.' }); });
    }, 500);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [url, enabled]);
  return state;
}
export function CreatorAvatar({ profile, name }: { profile: CreatorProfile | null; name: string }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [profile?.avatarUrl]);
  return profile?.avatarUrl && !failed
    ? <img src={profile.avatarUrl} alt={'Foto de ' + name} referrerPolicy="no-referrer" onError={() => setFailed(true)} className="size-10 shrink-0 rounded-full object-cover" />
    : <span aria-label="Foto indisponível" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted"><UserRound className="size-5 text-muted-foreground" /></span>;
}
export function followersLabel(profile: CreatorProfile | null) {
  return profile?.followers != null ? profile.followers.toLocaleString('pt-BR') + (profile.network === 'youtube' ? ' inscritos' : ' seguidores')
    : profile?.followersText ? profile.followersText + ' seguidores' : 'Seguidores não informados pela rede';
}
