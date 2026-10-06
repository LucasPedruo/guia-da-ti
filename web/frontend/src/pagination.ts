export const resourcePageSize = 20;

export function readPage(search: string) {
  const value = new URLSearchParams(search).get('pagina');
  if (!value || !/^[1-9]\d*$/.test(value)) return 1;
  const page = Number(value);
  return Number.isSafeInteger(page) ? page : 1;
}

export function paginate<T>(items: T[], requested: number, size = resourcePageSize) {
  const pages = Math.max(1, Math.ceil(items.length / size));
  const page = Math.min(pages, Math.max(1, Number.isSafeInteger(requested) ? requested : 1));
  const offset = (page - 1) * size;
  return { page, pages, start: items.length ? offset + 1 : 0, end: Math.min(offset + size, items.length), items: items.slice(offset, offset + size) };
}

export function pageNumbers(page: number, pages: number): (number | 'gap')[] {
  const visible = Array.from({ length: pages }, (_, index) => index + 1)
    .filter(value => value === 1 || value === pages || Math.abs(value - page) <= 1);
  return visible.flatMap((value, index) => index && value - visible[index - 1] > 1 ? ['gap' as const, value] : [value]);
}
