const API_BASE = 'https://www.sankavollerei.web.id';

async function apiFetch<T = any>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// ── Otakudesu ─────────────────────────────────────────────────────────
export const otakudesu = {
  home: () => apiFetch('/anime/home'),
  schedule: () => apiFetch('/anime/schedule'),
  detail: (slug: string) => apiFetch(`/anime/anime/${slug}`),
  ongoing: (page = 1) => apiFetch(`/anime/ongoing-anime?page=${page}`),
  complete: (page = 1) => apiFetch(`/anime/complete-anime?page=${page}`),
  genres: () => apiFetch('/anime/genre'),
  genre: (slug: string, page = 1) => apiFetch(`/anime/genre/${slug}?page=${page}`),
  episode: (slug: string) => apiFetch(`/anime/episode/${slug}`),
  server: (serverId: string) => apiFetch(`/anime/server/${serverId}`),
  search: (keyword: string) => apiFetch(`/anime/search/${encodeURIComponent(keyword)}`),
  unlimited: () => apiFetch('/anime/unlimited'),
  batch: (slug: string) => apiFetch(`/anime/batch/${slug}`),
};

// ── Samehadaku ────────────────────────────────────────────────────────
export const samehadaku = {
  home: () => apiFetch('/anime/samehadaku/home'),
  recent: (page = 1) => apiFetch(`/anime/samehadaku/recent?page=${page}`),
  search: (q: string, page = 1) => apiFetch(`/anime/samehadaku/search?q=${encodeURIComponent(q)}&page=${page}`),
  ongoing: (page = 1) => apiFetch(`/anime/samehadaku/ongoing?page=${page}`),
  completed: (page = 1) => apiFetch(`/anime/samehadaku/completed?page=${page}`),
  popular: (page = 1) => apiFetch(`/anime/samehadaku/popular?page=${page}`),
  movies: (page = 1) => apiFetch(`/anime/samehadaku/movies?page=${page}`),
  list: () => apiFetch('/anime/samehadaku/list'),
  schedule: () => apiFetch('/anime/samehadaku/schedule'),
  genres: () => apiFetch('/anime/samehadaku/genres'),
  genre: (genreId: string, page = 1) => apiFetch(`/anime/samehadaku/genres/${genreId}?page=${page}`),
  anime: (animeId: string) => apiFetch(`/anime/samehadaku/anime/${animeId}`),
  episode: (episodeId: string) => apiFetch(`/anime/samehadaku/episode/${episodeId}`),
  server: (serverId: string) => apiFetch(`/anime/samehadaku/server/${serverId}`),
  batch: (batchId: string) => apiFetch(`/anime/samehadaku/batch/${batchId}`),
};

// ── Donghua ───────────────────────────────────────────────────────────
export const donghua = {
  home: (page = 1) => apiFetch(`/anime/donghua/home/${page}`),
  ongoing: (page = 1) => apiFetch(`/anime/donghua/ongoing/${page}`),
  completed: (page = 1) => apiFetch(`/anime/donghua/completed/${page}`),
  latest: (page = 1) => apiFetch(`/anime/donghua/latest/${page}`),
  schedule: () => apiFetch('/anime/donghua/schedule'),
  azList: (slug: string, page = 1) => apiFetch(`/anime/donghua/az-list/${slug}/${page}`),
  search: (keyword: string, page = 1) => apiFetch(`/anime/donghua/search/${encodeURIComponent(keyword)}/${page}`),
  detail: (slug: string) => apiFetch(`/anime/donghua/detail/${slug}`),
  episode: (slug: string) => apiFetch(`/anime/donghua/episode/${slug}`),
  genres: () => apiFetch('/anime/donghua/genres'),
  genre: (slug: string, page = 1) => apiFetch(`/anime/donghua/genres/${slug}/${page}`),
  seasons: (year?: string) => apiFetch(`/anime/donghua/seasons${year ? `/${year}` : ''}`),
};

// ── Animasu ───────────────────────────────────────────────────────────
export const animasu = {
  home: (page = 1) => apiFetch(`/anime/animasu/home?page=${page}`),
  popular: (page = 1) => apiFetch(`/anime/animasu/popular?page=${page}`),
  movies: (page = 1) => apiFetch(`/anime/animasu/movies?page=${page}`),
  ongoing: (page = 1) => apiFetch(`/anime/animasu/ongoing?page=${page}`),
  completed: (page = 1) => apiFetch(`/anime/animasu/completed?page=${page}`),
  search: (q: string) => apiFetch(`/anime/animasu/search?q=${encodeURIComponent(q)}`),
  detail: (slug: string) => apiFetch(`/anime/animasu/anime/${slug}`),
  episode: (slug: string) => apiFetch(`/anime/animasu/episode/${slug}`),
};

// ── Kusonime ──────────────────────────────────────────────────────────
export const kusonime = {
  latest: (page = 1) => apiFetch(`/anime/kusonime/latest?page=${page}`),
  allAnime: (page = 1) => apiFetch(`/anime/kusonime/all-anime?page=${page}`),
  movie: (page = 1) => apiFetch(`/anime/kusonime/movie?page=${page}`),
  type: (type: string, page = 1) => apiFetch(`/anime/kusonime/type/${type}?page=${page}`),
  genres: () => apiFetch('/anime/kusonime/all-genres'),
  genre: (slug: string, page = 1) => apiFetch(`/anime/kusonime/genre/${slug}?page=${page}`),
  detail: (slug: string) => apiFetch(`/anime/kusonime/anime/${slug}`),
  episode: (slug: string) => apiFetch(`/anime/kusonime/episode/${slug}`),
  search: (q: string) => apiFetch(`/anime/kusonime/search?q=${encodeURIComponent(q)}`),
};

// ── Anoboy ────────────────────────────────────────────────────────────
export const anoboy = {
  home: (page = 1) => apiFetch(`/anime/anoboy/home?page=${page}`),
  search: (keyword: string, page = 1) => apiFetch(`/anime/anoboy/search/${encodeURIComponent(keyword)}?page=${page}`),
  anime: (slug: string) => apiFetch(`/anime/anoboy/anime/${slug}`),
  episode: (slug: string) => apiFetch(`/anime/anoboy/episode/${slug}`),
};

// ── Oploverz ──────────────────────────────────────────────────────────
export const oploverz = {
  home: (page = 1) => apiFetch(`/anime/oploverz/home?page=${page}`),
  schedule: () => apiFetch('/anime/oploverz/schedule'),
  ongoing: (page = 1) => apiFetch(`/anime/oploverz/ongoing?page=${page}`),
  completed: (page = 1) => apiFetch(`/anime/oploverz/completed?page=${page}`),
  list: (page = 1) => apiFetch(`/anime/oploverz/list?page=${page}`),
  detail: (slug: string) => apiFetch(`/anime/oploverz/anime/${slug}`),
  episode: (slug: string) => apiFetch(`/anime/oploverz/episode/${slug}`),
  search: (q: string) => apiFetch(`/anime/oploverz/search?q=${encodeURIComponent(q)}`),
};

// ── Animekuindo ───────────────────────────────────────────────────────
export const animekuindo = {
  home: (page = 1) => apiFetch(`/anime/animekuindo/home?page=${page}`),
  schedule: () => apiFetch('/anime/animekuindo/schedule'),
  ongoing: (page = 1) => apiFetch(`/anime/animekuindo/ongoing?page=${page}`),
  completed: (page = 1) => apiFetch(`/anime/animekuindo/completed?page=${page}`),
  search: (q: string) => apiFetch(`/anime/animekuindo/search?q=${encodeURIComponent(q)}`),
  detail: (slug: string) => apiFetch(`/anime/animekuindo/anime/${slug}`),
  episode: (slug: string) => apiFetch(`/anime/animekuindo/episode/${slug}`),
};

// ── Nimegami ──────────────────────────────────────────────────────────
export const nimegami = {
  home: (page = 1) => apiFetch(`/anime/nimegami/home?page=${page}`),
  search: (query: string, page = 1) => apiFetch(`/anime/nimegami/search/${encodeURIComponent(query)}?page=${page}`),
  detail: (slug: string) => apiFetch(`/anime/nimegami/detail/${slug}`),
  animeList: (page = 1) => apiFetch(`/anime/nimegami/anime-list?page=${page}`),
  genres: () => apiFetch('/anime/nimegami/genre/list'),
  genre: (slug: string, page = 1) => apiFetch(`/anime/nimegami/genre/${slug}?page=${page}`),
};

// ── Alqanime ──────────────────────────────────────────────────────────
export const alqanime = {
  home: (page = 1) => apiFetch(`/anime/alqanime/home?page=${page}`),
  schedule: () => apiFetch('/anime/alqanime/schedule'),
  popular: (page = 1) => apiFetch(`/anime/alqanime/popular?page=${page}`),
  list: (show = 'all') => apiFetch(`/anime/alqanime/list?show=${show}`),
  ongoing: (page = 1) => apiFetch(`/anime/alqanime/ongoing?page=${page}`),
  completed: (page = 1) => apiFetch(`/anime/alqanime/completed?page=${page}`),
  movie: (page = 1) => apiFetch(`/anime/alqanime/movie?page=${page}`),
  detail: (slug: string) => apiFetch(`/anime/alqanime/anime/${slug}`),
  episode: (slug: string) => apiFetch(`/anime/alqanime/episode/${slug}`),
  search: (q: string) => apiFetch(`/anime/alqanime/search?q=${encodeURIComponent(q)}`),
};

// ── Donghub ───────────────────────────────────────────────────────────
export const donghub = {
  home: () => apiFetch('/anime/donghub/home'),
  latest: (page = 1) => apiFetch(`/anime/donghub/latest?page=${page}`),
  popular: (page = 1) => apiFetch(`/anime/donghub/popular?page=${page}`),
  search: (q: string) => apiFetch(`/anime/donghub/search?q=${encodeURIComponent(q)}`),
  detail: (slug: string) => apiFetch(`/anime/donghub/detail/${slug}`),
  episode: (slug: string) => apiFetch(`/anime/donghub/episode/${slug}`),
};

// ── Winbu ─────────────────────────────────────────────────────────────
export const winbu = {
  home: () => apiFetch('/anime/winbu/home'),
  search: (q: string, page = 1) => apiFetch(`/anime/winbu/search?q=${encodeURIComponent(q)}&page=${page}`),
  anime: (id: string) => apiFetch(`/anime/winbu/anime/${id}`),
  series: (id: string) => apiFetch(`/anime/winbu/series/${id}`),
  film: (id: string) => apiFetch(`/anime/winbu/film/${id}`),
  episode: (id: string) => apiFetch(`/anime/winbu/episode/${id}`),
};

// ── Drachin ───────────────────────────────────────────────────────────
export const drachin = {
  home: () => apiFetch('/anime/drachin/home'),
  latest: (page = 1) => apiFetch(`/anime/drachin/latest?page=${page}`),
  popular: (page = 1) => apiFetch(`/anime/drachin/popular?page=${page}`),
  search: (query: string) => apiFetch(`/anime/drachin/search/${encodeURIComponent(query)}`),
  detail: (slug: string) => apiFetch(`/anime/drachin/detail/${slug}`),
  episode: (slug: string, index: number) => apiFetch(`/anime/drachin/episode/${slug}?index=${index}`),
};

// ── Dramabox ──────────────────────────────────────────────────────────
export const dramabox = {
  search: (q: string, page = 1) => apiFetch(`/anime/dramabox/search?q=${encodeURIComponent(q)}&page=${page}`),
  latest: (page = 1) => apiFetch(`/anime/dramabox/latest?page=${page}`),
  trending: () => apiFetch('/anime/dramabox/trending'),
  detail: (bookId: string) => apiFetch(`/anime/dramabox/detail?bookId=${bookId}`),
  episode: (bookId: string, episodeId: string) =>
    apiFetch(`/anime/dramabox/episode?bookId=${bookId}&episodeId=${episodeId}`),
};

// ── Kuramanime ────────────────────────────────────────────────────────
export const kuramanime = {
  home: () => apiFetch('/anime/kura/home'),
  search: (keyword: string) => apiFetch(`/anime/kura/search/${encodeURIComponent(keyword)}`),
  anime: (id: string, slug: string) => apiFetch(`/anime/kura/anime/${id}/${slug}`),
  watch: (id: string, slug: string, episode: number) => apiFetch(`/anime/kura/watch/${id}/${slug}/${episode}`),
  batch: (id: string, slug: string, batchId: string) => apiFetch(`/anime/kura/batch/${id}/${slug}/${batchId}`),
  animeList: (page = 1) => apiFetch(`/anime/kura/anime-list?page=${page}`),
};

// ── Stream ────────────────────────────────────────────────────────────
export const stream = {
  episode: (slug: string) => apiFetch(`/anime/stream/episode/${slug}`),
  movies: (page = 1) => apiFetch(`/anime/stream/movie/${page}`),
};

// ── Nekopoi ───────────────────────────────────────────────────────────
export const neko = {
  latest: () => apiFetch('/anime/neko/latest'),
  release: (page = 1) => apiFetch(`/anime/neko/release/${page}`),
  search: (query: string) => apiFetch(`/anime/neko/search/${encodeURIComponent(query)}`),
  get: (url: string) => apiFetch(`/anime/neko/get?url=${encodeURIComponent(url)}`),
  random: () => apiFetch('/anime/neko/random'),
};
