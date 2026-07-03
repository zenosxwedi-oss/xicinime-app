import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ActivityIndicator, FlatList, ScrollView,
  StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { useFavorites } from '@/hooks/useFavorites';
import {
  otakudesu, samehadaku, donghua, animasu, kusonime,
  anoboy, oploverz, nimegami, alqanime,
  donghub, winbu, animekuindo,
} from '@/services/api';
import { ContentItem, SOURCE_COLORS, SOURCE_LABELS, ApiSource } from '@/types/api';

type Params = {
  source: string;
  slug: string;
  contentType: string;
  title: string;
  poster: string;
  extraId?: string;
  bookId?: string;
};

async function fetchDetail(source: ApiSource, slug: string): Promise<any> {
  switch (source) {
    case 'otakudesu':    return otakudesu.detail(slug);
    case 'samehadaku':   return samehadaku.anime(slug);
    case 'donghua':      return donghua.detail(slug);
    case 'animasu':      return animasu.detail(slug);
    case 'kusonime':     return kusonime.detail(slug);
    case 'anoboy':       return anoboy.anime(slug);
    case 'oploverz':     return oploverz.detail(slug);
    case 'nimegami':     return nimegami.detail(slug);
    case 'alqanime':     return alqanime.detail(slug);
    case 'donghub':      return donghub.detail(slug);
    case 'winbu':        return winbu.anime(slug);
    case 'animekuindo':  return animekuindo.detail(slug);
    default: return null;
  }
}

interface EpisodeItem { title: string; slug: string; index?: number }

function extractDetail(source: ApiSource, raw: any) {
  if (!raw) return null;
  const d = raw.data ?? raw;

  // ── Genre extraction ─────────────────────────────────────────────────
  // otakudesu / samehadaku: genreList[].title  (confirmed live, NOT .name)
  // donghua: genres[] (array of strings)
  // others: genre[] or genreList[]
  let genresRaw: any[] = [];
  if (Array.isArray(d.genreList) && d.genreList.length) genresRaw = d.genreList;
  else if (Array.isArray(d.genres) && d.genres.length) genresRaw = d.genres;
  else if (Array.isArray(d.genre) && d.genre.length) genresRaw = d.genre;
  const genres = genresRaw
    .map((g: any) => (typeof g === 'string' ? g : g?.title ?? g?.name ?? g?.genreName ?? ''))
    .filter(Boolean);

  // ── Episode extraction ───────────────────────────────────────────────
  let episodes: EpisodeItem[] = [];

  if (source === 'otakudesu') {
    // episodeList: [{episodeId, title, eps, date}]
    const list: any[] = d.episodeList ?? [];
    episodes = list.map((e: any, i: number) => ({
      title: e.title ?? `Episode ${e.eps ?? i + 1}`,
      slug: e.episodeId ?? e.href?.split('/').pop() ?? String(i),
      index: typeof e.eps === 'number' ? e.eps : i + 1,
    }));
  } else if (source === 'samehadaku') {
    // episodeList: [{episodeId, title, href}]
    const list: any[] = d.episodeList ?? [];
    episodes = list.map((e: any, i: number) => ({
      title: typeof e.title === 'number' ? `Episode ${e.title}` : (e.title ?? `Episode ${i + 1}`),
      slug: e.episodeId ?? e.href?.split('/').pop() ?? String(i),
      index: typeof e.title === 'number' ? e.title : i + 1,
    }));
  } else if (source === 'donghua') {
    // episodes_list: [{episode, slug, href}]
    const list: any[] = d.episodes_list ?? d.episodeList ?? [];
    episodes = list.map((e: any, i: number) => ({
      title: e.episode ?? e.title ?? `Episode ${i + 1}`,
      slug: e.slug ?? e.href?.split('/').pop() ?? String(i),
      index: i + 1,
    }));
  } else {
    // Generic fallback
    const list: any[] = d.episodeList ?? d.episode_list ?? d.episodes ?? [];
    episodes = list.map((e: any, i: number) => ({
      title: e.title ?? e.episode ?? e.episodeTitle ?? `Episode ${i + 1}`,
      slug: e.episodeId ?? e.slug ?? e.id ?? e.href?.split('/').pop() ?? String(i),
      index: i + 1,
    }));
  }

  return {
    title: d.title ?? d.name ?? '',
    poster: (d.poster ?? d.image ?? d.thumbnail ?? '').split('\t')[0].trim(),
    synopsis: d.synopsis ?? d.description ?? d.sinopsis ?? '',
    genres,
    status: d.status ?? '',
    score: d.score ?? d.rating ?? '',
    type: d.type ?? '',
    studio: d.studio ?? d.studios ?? d.producer ?? '',
    episodes,
  };
}

export default function DetailScreen() {
  const params = useLocalSearchParams<Params>();
  const insets = useSafeAreaInsets();
  const source = params.source as ApiSource;
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();

  const { data: rawDetail, isLoading, error } = useQuery({
    queryKey: ['detail', source, params.slug],
    queryFn: () => fetchDetail(source, params.slug),
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  const detail = extractDetail(source, rawDetail);
  const title = detail?.title || params.title;
  const poster = detail?.poster || params.poster;

  const favItem: ContentItem = {
    id: params.slug,
    title,
    poster,
    source,
    slug: params.slug,
    contentType: (params.contentType as ContentItem['contentType']) ?? 'anime',
    extraId: params.extraId,
    bookId: params.bookId,
  };
  const favorited = isFavorite(params.slug, source);
  const badgeColor = (SOURCE_COLORS as Record<string, string>)[source] ?? '#8B00FF';

  const toggleFav = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (favorited) removeFavorite(params.slug, source);
    else addFavorite(favItem);
  };

  const handleEpisode = (ep: EpisodeItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/episode',
      params: {
        source,
        slug: ep.slug,
        title: ep.title,
        animeName: title,
        animeSlug: params.slug,
        episodeIndex: String(ep.index ?? 1),
      },
    });
  };

  const detailBroken = !isLoading && (error || (!detail && rawDetail));

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Poster */}
        <View style={styles.posterWrap}>
          <Image source={{ uri: poster || params.poster }} style={styles.poster} contentFit="cover" />
          <LinearGradient colors={['transparent', 'rgba(10,10,10,0.7)', '#0A0A0A']} style={styles.gradient} />
          <TouchableOpacity style={[styles.backBtn, { top: insets.top + 8 }]} onPress={() => router.back()}>
            <Feather name="arrow-left" size={22} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.favBtn, { top: insets.top + 8 }]} onPress={toggleFav}>
            <Feather name="heart" size={22} color={favorited ? '#EF4444' : '#FFF'} />
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={[styles.sourceBadge, { backgroundColor: badgeColor }]}>
            {(SOURCE_LABELS as Record<string, string>)[source] ?? source}
          </Text>
          <Text style={styles.titleText}>{title}</Text>

          {isLoading ? (
            <ActivityIndicator color="#8B00FF" style={{ marginTop: 20 }} />
          ) : detailBroken ? (
            <Text style={styles.brokenMsg}>Detail tidak tersedia untuk sumber ini. Coba klik episode jika ada.</Text>
          ) : detail ? (
            <>
              {/* Meta chips */}
              {(detail.score || detail.status || detail.type) ? (
                <View style={styles.metaRow}>
                  {!!detail.score && <Text style={styles.metaChip}>⭐ {detail.score}</Text>}
                  {!!detail.status && <Text style={styles.metaChip}>{detail.status}</Text>}
                  {!!detail.type && <Text style={styles.metaChip}>{detail.type}</Text>}
                </View>
              ) : null}

              {/* Genres */}
              {detail.genres.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.genreRow}>
                  {detail.genres.map((g: string, i: number) => (
                    <Text key={i} style={styles.genreChip}>{g}</Text>
                  ))}
                </ScrollView>
              )}

              {/* Synopsis */}
              {!!detail.synopsis && (
                <>
                  <Text style={styles.sectionTitle}>Sinopsis</Text>
                  <Text style={styles.synopsis}>{detail.synopsis}</Text>
                </>
              )}

              {/* Episodes */}
              {detail.episodes.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Episode ({detail.episodes.length})</Text>
                  <FlatList
                    data={detail.episodes}
                    keyExtractor={(ep, i) => `${ep.slug}-${i}`}
                    scrollEnabled={false}
                    renderItem={({ item: ep }) => (
                      <TouchableOpacity style={styles.epItem} onPress={() => handleEpisode(ep)}>
                        <View style={styles.epIcon}>
                          <Feather name="play" size={14} color="#8B00FF" />
                        </View>
                        <Text style={styles.epTitle} numberOfLines={1}>{ep.title}</Text>
                        <Feather name="chevron-right" size={16} color="#6B7280" />
                      </TouchableOpacity>
                    )}
                  />
                </>
              )}

              {/* No episodes found */}
              {detail.episodes.length === 0 && !detail.synopsis && (
                <Text style={styles.brokenMsg}>Tidak ada data episode. API sumber ini mungkin tidak mendukung halaman detail.</Text>
              )}
            </>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  posterWrap: { height: 420, position: 'relative' },
  poster: { width: '100%', height: '100%' },
  gradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%' },
  backBtn: {
    position: 'absolute', left: 16,
    backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, padding: 8,
  },
  favBtn: {
    position: 'absolute', right: 16,
    backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, padding: 8,
  },
  info: { paddingHorizontal: 16, marginTop: -20 },
  sourceBadge: {
    color: '#FFF', fontSize: 10, fontWeight: '700',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5,
    alignSelf: 'flex-start', marginBottom: 8, overflow: 'hidden',
  },
  titleText: { color: '#FFF', fontSize: 22, fontWeight: '800', marginBottom: 10 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  metaChip: {
    color: '#9CA3AF', fontSize: 12, backgroundColor: '#1A1A1A',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
  },
  genreRow: { marginBottom: 14 },
  genreChip: {
    color: '#8B00FF', fontSize: 11, fontWeight: '600',
    borderWidth: 1, borderColor: '#8B00FF',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginRight: 6,
  },
  sectionTitle: { color: '#FFF', fontSize: 15, fontWeight: '700', marginBottom: 8, marginTop: 16 },
  synopsis: { color: '#9CA3AF', fontSize: 13, lineHeight: 20 },
  brokenMsg: { color: '#6B7280', fontSize: 13, marginTop: 20, lineHeight: 20 },
  epItem: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#141414', borderRadius: 10,
    padding: 12, marginBottom: 8, gap: 10,
  },
  epIcon: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(139,0,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  epTitle: { flex: 1, color: '#FFF', fontSize: 13, fontWeight: '500' },
});
