import { useContext, useEffect, useId, useState } from "react";
import {
  BookOpen,
  Flame,
  LayoutGrid,
  List,
  MessageSquareText,
  MousePointer2,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { resourcePath, type Resource } from "./catalog";
import { SessionContext } from "./Participation";
import { DiscussionThread } from "./Discussions";
import { ResourceSearch } from "./ResourceSearch";
import { ResourcePagination } from "./ResourcePagination";
import imageSources from "./assets/study/sources.json";
import { universityTypes } from "./university-options";
import { paginate, readPage } from "./pagination";
import {
  interactions,
  rankStudy,
  studyKey,
  studySorts,
  type StudyActivity,
  type StudySort,
} from "./study-ranking";

function useStudyActivity() {
  const auth = useContext(SessionContext);
  const [activity, setActivity] = useState<Record<string, StudyActivity>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    fetch("/api/study/activity", {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) throw Error();
        return response.json() as Promise<StudyActivity[]>;
      })
      .then((items) => {
        if (!controller.signal.aborted)
          setActivity(Object.fromEntries(items.map((a) => [a.key, a])));
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setActivity({});
          setError("A atividade dos itens não carregou. Tente novamente.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [auth?.session?.login, revision]);
  return { activity, error, loading, refresh: () => setRevision((v) => v + 1) };
}

export function StudyBadges({ activity }: { activity?: StudyActivity }) {
  const format = (n: number | null | undefined) =>
    n == null ? "—" : n.toLocaleString("pt-BR");
  return (
    <div className="flex flex-wrap gap-1.5 text-[10px] text-muted-foreground">
      <span className="inline-flex items-center gap-1 rounded border px-1.5 py-1">
        <MessageSquareText className="size-3" />
        {format(activity?.comments)} comentários
      </span>
      <span
        title="Comentários, avaliações e hypes"
        className="inline-flex items-center gap-1 rounded border px-1.5 py-1"
      >
        <MousePointer2 className="size-3" />
        {format(activity ? interactions(activity) : null)} interações
      </span>
      <span className="inline-flex items-center gap-1 rounded bg-primary/10 px-1.5 py-1 text-primary">
        <Flame className="size-3" />
        {format(activity?.hypes)} hypes
      </span>
      <span className="inline-flex items-center gap-1 rounded border px-1.5 py-1">
        <Star className="size-3" />
        {activity?.average != null
          ? activity.average.toLocaleString("pt-BR", {
              maximumFractionDigits: 1,
            })
          : activity
            ? "Sem nota"
            : "—"}
        {activity && ` (${activity.ratings})`}
      </span>
    </div>
  );
}

// Covers are optional, versioned assets; no third-party thumbnail tracking or fake images.
const covers = import.meta.glob("./assets/study/*/*.{webp,png,jpg,svg}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;
function StudyCover({
  resource,
  small = false,
}: {
  resource: Resource;
  small?: boolean;
}) {
  const cover = Object.entries(covers).find(([path]) =>
    path.replace(/\.[^.]+$/, "").endsWith(`/${studyKey(resource)}`),
  )?.[1];
  const imageSource = imageSources.find(
    (image) => image.key === studyKey(resource),
  );
  return (
    <div
      aria-hidden="true"
      style={
        cover
          ? {
              backgroundColor: imageSource?.background,
            }
          : undefined
      }
      className={
        small
          ? "flex size-14 shrink-0 items-center justify-center overflow-hidden rounded bg-muted/50"
          : "flex h-28 items-center justify-center overflow-hidden rounded-t-lg border-b bg-muted/40"
      }
    >
      {cover ? (
        <img
          src={cover}
          alt=""
          loading="lazy"
          className={`h-full min-h-0 w-full min-w-0 ${resource.type !== "books" && imageSource?.kind === "social" ? "object-cover" : resource.type === "books" ? "object-contain p-3" : "object-contain p-2"}`}
        />
      ) : (
        <BookOpen
          className={
            small ? "size-5 text-primary/70" : "size-9 text-primary/60"
          }
        />
      )}
    </div>
  );
}

export function StudyListing({
  category,
  items,
  title,
  query,
  onSearch,
}: {
  category: string;
  items: Resource[];
  title: string;
  query: string;
  onSearch: (value: string) => void;
}) {
  const { activity, error, loading, refresh } = useStudyActivity();
  const [sort, setSort] = useState<StudySort>("hypes");
  const [view, setView] = useState("cards");
  const [page, setPage] = useState(1);
  const [institution, setInstitution] = useState("all");
  useEffect(() => {
    const read = () => {
      const params = new URLSearchParams(window.location.search);
      const sort = params.get("ordem");
      const institution = params.get("instituicao");
      setInstitution(
        category === "universities" &&
          universityTypes.some((t) => t.id === institution)
          ? institution!
          : "all",
      );
      setSort(
        sort && Object.hasOwn(studySorts, sort) ? (sort as StudySort) : "hypes",
      );
      setView(params.get("visualizacao") === "lista" ? "list" : "cards");
      setPage(readPage(window.location.search));
    };
    read();
    window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  }, [category]);
  useEffect(() => {
    setPage(readPage(window.location.search));
  }, [query]);
  function update(key: string, value: string, reset = true) {
    const url = new URL(window.location.href);
    url.searchParams.set(key, value);
    if (key === "instituicao" && value === "all") url.searchParams.delete(key);
    if (reset) {
      url.searchParams.delete("pagina");
      setPage(1);
    }
    window.history.replaceState(null, "", url);
  }
  const filteredItems =
    category === "universities" && institution !== "all"
      ? items.filter((r) => r.universityType === institution)
      : items;
  const listing = paginate(rankStudy(filteredItems, activity, sort), page);
  const changePage = (next: number) => {
    setPage(next);
    update("pagina", String(next), false);
  };
  const detail = (r: Resource) => (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <a
          className="text-sm font-semibold after:absolute after:inset-0 after:rounded-lg hover:text-primary focus-visible:outline-none"
          href={resourcePath(r)}
        >
          {r.name}
        </a>
        {r.demo && <Badge variant="outline">Exemplo</Badge>}
        {r.universityType && (
          <Badge variant="outline">
            {universityTypes.find((t) => t.id === r.universityType)?.name}
          </Badge>
        )}
      </div>
      <p className="my-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
        {r.summary}
      </p>
      <StudyBadges activity={activity[studyKey(r)]} />
    </>
  );
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-3">
        <span aria-live="polite" className="text-xs text-muted-foreground">
          {listing.pages > 1
            ? `${listing.start}–${listing.end} de ${filteredItems.length} itens`
            : `${filteredItems.length} ${filteredItems.length === 1 ? "item na lista" : "itens na lista"}`}
        </span>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <Select
            value={sort}
            onValueChange={(value) => {
              setSort(value as StudySort);
              update("ordem", value);
            }}
          >
            <SelectTrigger
              aria-label="Ordenar por"
              size="sm"
              className="h-8 w-40 text-xs"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(studySorts).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {category === "universities" && (
            <Select
              value={institution}
              onValueChange={(value) => {
                setInstitution(value);
                update("instituicao", value);
              }}
            >
              <SelectTrigger
                aria-label="Tipo de instituição"
                size="sm"
                className="h-8 w-40 text-xs"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as instituições</SelectItem>
                {universityTypes.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <ResourceSearch value={query} onChange={onSearch} />
          <div
            role="group"
            aria-label="Visualização da listagem"
            className="flex gap-1"
          >
            <Button
              size="icon-sm"
              variant={view === "cards" ? "default" : "outline"}
              aria-label="Exibir cards"
              aria-pressed={view === "cards"}
              onClick={() => {
                setView("cards");
                update("visualizacao", "cards", false);
              }}
            >
              <LayoutGrid />
            </Button>
            <Button
              size="icon-sm"
              variant={view === "list" ? "default" : "outline"}
              aria-label="Exibir lista"
              aria-pressed={view === "list"}
              onClick={() => {
                setView("list");
                update("visualizacao", "lista", false);
              }}
            >
              <List />
            </Button>
          </div>
        </div>
      </div>
      {loading && (
        <p role="status" className="text-xs text-muted-foreground">
          Carregando avaliações e atividade…
        </p>
      )}
      {error && (
        <div role="alert" className="flex items-center gap-2 text-xs">
          <p>{error}</p>
          <Button size="xs" variant="outline" onClick={refresh}>
            Tentar novamente
          </Button>
        </div>
      )}
      {filteredItems.length === 0 ? (
        <p className="rounded-lg border p-6 text-sm text-muted-foreground">
          {query || institution !== "all"
            ? "Nenhum resultado para esta pesquisa."
            : "Ainda não há itens nesta categoria. Sugira o primeiro."}
        </p>
      ) : view === "cards" ? (
        <div
          aria-label={`Cards: ${title}`}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {listing.items.map((r) => (
            <article
              data-motion
              key={studyKey(r)}
              className="relative flex min-w-0 cursor-pointer flex-col rounded-lg border bg-card transition-colors hover:bg-muted/30 focus-within:bg-muted/30 focus-within:outline-2 focus-within:outline-ring"
            >
              <a href={resourcePath(r)} tabIndex={-1} aria-hidden="true">
                <StudyCover resource={r} />
              </a>
              <div className="flex flex-1 flex-col p-3">
                <div className="flex-1">{detail(r)}</div>
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="mt-3 w-full"
                >
                  <a href={resourcePath(r)}>Ver detalhes</a>
                </Button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div
          aria-label={`Lista: ${title}`}
          className="divide-y rounded-lg border bg-card"
        >
          {listing.items.map((r) => (
            <article
              data-motion
              key={studyKey(r)}
              className="relative flex cursor-pointer items-center gap-3 p-3 transition-colors hover:bg-muted/30 focus-within:bg-muted/30 focus-within:outline-2 focus-within:outline-ring"
            >
              <StudyCover small resource={r} />
              <div className="min-w-0 flex-1">{detail(r)}</div>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="hidden sm:inline-flex"
              >
                <a href={resourcePath(r)}>Ver detalhes</a>
              </Button>
            </article>
          ))}
        </div>
      )}
      <ResourcePagination
        page={listing.page}
        pages={listing.pages}
        onChange={changePage}
      />
    </div>
  );
}

export function StudyDetail({ resource }: { resource: Resource }) {
  const auth = useContext(SessionContext);
  const { activity, error, loading, refresh } = useStudyActivity();
  const a = activity[studyKey(resource)];
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [body, setBody] = useState("");
  const id = useId();
  async function publish(kind: "vote" | "comments", data: unknown) {
    if (busy) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`/api/study/${studyKey(resource)}/${kind}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": auth?.session?.csrfToken || "",
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok)
        throw Error(
          result.error || "Entre novamente com o GitHub para participar.",
        );
      setMessage(
        kind === "vote" ? "Avaliação salva." : "Comentário publicado no fórum.",
      );
      if (kind === "comments") setBody("");
      refresh();
    } catch (e) {
      setMessage(
        e instanceof Error
          ? e.message
          : "Não conseguimos salvar. Tente novamente.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section
      aria-label="Avaliações e discussão"
      className="space-y-5 border-t pt-6"
    >
      <h2 className="text-xl font-semibold">Avaliações e discussão</h2>
      <StudyBadges activity={a} />
      <p className="text-xs text-muted-foreground">
        Uma avaliação e um hype por conta. As interações somam comentários,
        avaliações e hypes.
      </p>
      {loading && (
        <p role="status" className="text-sm text-muted-foreground">
          Carregando atividade…
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {resource.demo ? (
        <p className="text-sm text-muted-foreground">
          Este item é fictício e não recebe avaliações ou comentários.
        </p>
      ) : !auth?.session?.login ? (
        <Button
          disabled={auth?.loading || auth?.pending || !auth?.session?.enabled}
          onClick={auth?.startLogin}
        >
          Entrar com GitHub para avaliar e comentar
        </Button>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-4">
            <fieldset
              disabled={busy || loading || !!error}
              className="space-y-2"
            >
              <legend className="text-sm font-medium">Sua avaliação</legend>
              <div
                role="radiogroup"
                aria-label="Nota de 1 a 5 estrelas"
                className="flex gap-1"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <Button
                    key={n}
                    role="radio"
                    aria-checked={a?.myRating === n}
                    tabIndex={n === (a?.myRating || 1) ? 0 : -1}
                    onKeyDown={(event) => {
                      const direction = ["ArrowRight", "ArrowUp"].includes(
                        event.key,
                      )
                        ? 1
                        : ["ArrowLeft", "ArrowDown"].includes(event.key)
                          ? -1
                          : 0;
                      if (direction) {
                        event.preventDefault();
                        const next = Math.max(1, Math.min(5, n + direction));
                        event.currentTarget.parentElement
                          ?.querySelectorAll<HTMLButtonElement>("button")
                          [next - 1]?.focus();
                        void publish("vote", { rating: next });
                      }
                    }}
                    aria-label={`${n} ${n === 1 ? "estrela" : "estrelas"}`}
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => void publish("vote", { rating: n })}
                  >
                    <Star
                      className={
                        n <= (a?.myRating || 0)
                          ? "fill-primary text-primary"
                          : "text-muted-foreground"
                      }
                    />
                  </Button>
                ))}
              </div>
            </fieldset>
            <Button
              disabled={busy || loading || !!error}
              variant={a?.myHype ? "default" : "outline"}
              aria-pressed={a?.myHype || false}
              onClick={() => void publish("vote", { hype: !a?.myHype })}
            >
              <Flame />
              {a?.myHype ? "Remover hype" : "Dar hype"}
            </Button>
          </div>
          {!a?.discussion && (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void publish("comments", { body });
              }}
              className="space-y-3"
            >
              <label htmlFor={id} className="text-sm font-medium">
                Comente sua experiência
              </label>
              <textarea
                id={id}
                required
                maxLength={9000}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                disabled={busy || loading || !!error}
                className="w-full rounded-lg border bg-transparent p-3 text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Seu comentário será público no Guia e no GitHub, em nome de{" "}
                {auth.session.login}. A primeira mensagem abre o tópico deste
                item no fórum.
              </p>
              <Button
                type="submit"
                disabled={busy || loading || !!error || !body.trim()}
              >
                {busy ? "Publicando…" : "Publicar comentário"}
              </Button>
            </form>
          )}
        </>
      )}
      {message && (
        <p role="status" className="text-sm">
          {message}
        </p>
      )}
      {a?.discussion ? (
        <DiscussionThread
          key={a.discussion}
          number={a.discussion}
          embedded
          onPublished={refresh}
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          Ainda não há uma conversa para este item.
        </p>
      )}
    </section>
  );
}
