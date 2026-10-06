import { communityPlatforms } from './community-options.ts';
export type CommunityLocation = { scope: 'regional' | 'national' | 'international'; states?: string[] };
export type LocationSelection = { scope: CommunityLocation['scope'] | null; states: string[] };
export const brazilRegions = [
  { id: 'norte', name: 'Norte', states: ['AC', 'AP', 'AM', 'PA', 'RO', 'RR', 'TO'] },
  { id: 'nordeste', name: 'Nordeste', states: ['AL', 'BA', 'CE', 'MA', 'PB', 'PE', 'PI', 'RN', 'SE'] },
  { id: 'centro-oeste', name: 'Centro-Oeste', states: ['DF', 'GO', 'MT', 'MS'] },
  { id: 'sudeste', name: 'Sudeste', states: ['ES', 'MG', 'RJ', 'SP'] },
  { id: 'sul', name: 'Sul', states: ['PR', 'RS', 'SC'] },
];
export const stateCodes = brazilRegions.flatMap(region => region.states);
export function matchesCommunityLocation(location: CommunityLocation | undefined, selection: LocationSelection) {
  if (!selection.scope) return true;
  if (!location || location.scope !== selection.scope) return false;
  return location.scope !== 'regional' || !!location.states?.some(uf => selection.states.includes(uf));
}
export type CommunityFilters = LocationSelection & { categories: string[]; platforms: string[] };
export const emptyCommunityFilters = (): CommunityFilters => ({scope:null,states:[],categories:[],platforms:[]});
export function readCommunityFilters(search: string, allowedCategories: string[]): CommunityFilters {
  const params=new URLSearchParams(search);
  const values=(key:string,allowed:string[])=>[...new Set((params.get(key)||'').split(',').filter(id=>allowed.includes(id)))];
  return {...readLocationSelection(search),categories:values('categorias',allowedCategories),platforms:values('ninhos',communityPlatforms.map(platform=>platform.id))};
}
export function matchesCommunityFilters(resource: {communityLocation?:CommunityLocation;areas:string[];communityPlatforms?:string[];communityModality?:string}, filters:CommunityFilters) {
  return matchesCommunityLocation(resource.communityLocation,filters)
    && (!filters.categories.length||resource.areas.some(area=>filters.categories.includes(area)))
    && (!filters.platforms.length||!!resource.communityPlatforms?.some(platform=>filters.platforms.includes(platform)));
}
export function toggleStates(selection: LocationSelection, states: string[]): LocationSelection {
  const selected = selection.scope === 'regional' ? selection.states : [];
  const all = states.every(uf => selected.includes(uf));
  const next = all ? selected.filter(uf => !states.includes(uf)) : [...new Set([...selected, ...states])];
  return { scope: next.length ? 'regional' : null, states: next.sort() };
}
export function readLocationSelection(search: string): LocationSelection {
  const params = new URLSearchParams(search);
  const scope = params.get('alcance');
  if (scope === 'national' || scope === 'international') return { scope, states: [] };
  const states = [...new Set((params.get('estados') || '').split(',').filter(uf => stateCodes.includes(uf)))].sort();
  return { scope: states.length ? 'regional' : null, states };
}
