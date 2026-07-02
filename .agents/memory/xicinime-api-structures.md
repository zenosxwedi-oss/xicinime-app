---
name: Xicinime API real data structures
description: Actual field paths and episode/stream structures for each sankavollerei.web.id API source
---

Base URL: https://www.sankavollerei.web.id

## List endpoints — correct field paths

| Source | Endpoint | List field |
|---|---|---|
| otakudesu | /anime/home | `data.ongoing.animeList[]` + `data.completed.animeList[]` → `{animeId, poster, title}` |
| samehadaku | /anime/samehadaku/ongoing | `data.animeList[]` → `{animeId, poster, title}` |
| donghua | /anime/donghua/latest/1 | `data.latest_donghua[]` → `{slug, poster, title}` |
| animasu | /anime/animasu/home | `data.ongoing[]` or `data.recent[]` → `{slug, poster, title}` |
| kusonime | /anime/kusonime/latest | `data.anime_list[]` → `{slug, poster, title}` |
| anoboy | /anime/anoboy/home | `data.anime_list[]` → `{slug, poster, title}` (EPISODE-LEVEL items) |
| oploverz | /anime/oploverz/home | `data.anime_list[]` → `{slug, poster, title}` (EPISODE-LEVEL items) |
| nimegami | /anime/nimegami/home | `data.anime_list[]` → `{slug, poster, title}` |
| alqanime | /anime/alqanime/home | `data.latest[]` or `data.movies[]` → `{slug, poster, title}` |
| donghub | /anime/donghub/home | `data.latest[]` or `data.popular[]` → `{slug, poster, title}` (EPISODE-LEVEL) |
| winbu | /anime/winbu/home | `data.latest_anime[]` → `{id, image, title}` (uses `id` as slug, `image` as poster — NOT `animeId`/`poster`) |
| animekuindo | /anime/animekuindo/latest | direct array `[]` → `{slug, poster, title}` |

## Broken APIs (return error/empty/HTML)
- drachin: empty array
- dramabox: error message
- kuramanime: error message
- stream: HTML response

## Detail endpoints — correct field names

| Source | Genre field | Episode list field | Episode slug field |
|---|---|---|---|
| otakudesu | `genreList[{genreId, name}]` | `episodeList[{episodeId, title, eps}]` | `episodeId` |
| samehadaku | `genreList[{genreId, name}]` | `episodeList[{episodeId, title}]` | `episodeId` |
| donghua | `genres[]` (strings) | `episodes_list[{slug, episode}]` | `slug` |

## Episode streaming structures

**otakudesu** `/anime/episode/{episodeId}`:
- `data.defaultStreamingUrl` → direct playable URL
- `data.server.qualities[{title, serverList[{title, serverId, href}]}]` → resolve via `/anime/server/{serverId}` → `data.url`

**samehadaku** `/anime/samehadaku/episode/{episodeId}`:
- `data.defaultStreamingUrl` → direct URL
- `data.server.qualities[{title, serverList[]}]` → serverList may be empty

**donghua** `/anime/donghua/episode/{slug}`:
- `data.streaming.servers[{name, url}]` → direct URLs
- `data.streaming.main_url.url` → primary URL

**anoboy** `/anime/anoboy/episode/{slug}`:
- `data.streams[{name, url}]` → direct URLs

**donghub** `/anime/donghub/episode/{slug}`:
- `data.streams[{server, url}]` → direct URLs

**Why:** Wrong field paths caused every API call to resolve to empty arrays,
making all screens blank and streaming impossible.

**How to apply:** Any time normalizing list items from these APIs, use the
source-specific field extractor pattern from anime.tsx `extractList()`.
