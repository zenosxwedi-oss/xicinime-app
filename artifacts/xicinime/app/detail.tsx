import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFavorites } from '@/hooks/useFavorites';
import {
  otakudesu, samehadaku, donghua, animasu, kusonime,
  anoboy, oploverz, nimegami, alqanime, kuramanime,
  donghub, winbu, drachin, dramabox, stream,
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

async function fetchDetail(source: ApiSource, slug: string, extraId?: string, bookId?: string): Promise<any> {
  switch (source) {
    case 'otakudesu': return otakudesu.detail(slug);
    case 'samehadaku': return samehadaku.anime(slug);
    case 'donghua': return donghua.detail(slug);
    case 'animasu': return animasu.detail(slug);
    case 'kusonime': return kusonime.detail(slug);
    case 'anoboy': return anoboy.anime(slug);
    case 'oploverz': return oploverz.detail(slug);
    case 'nimegami': return nimegami.detail(slug);
    case 'alqanime': return alqanime.detail(slug);
    case 'kuramanime': return kuramanime.anime(extraId ?? '', slug);
    case 'donghub': return donghub.detail(slug);
    case 'winbu': return winbu.anime(slug);
    case 'drachin': return drachin.detail(slug);
    case 'dramabox': return dramabox.detail(bookId ?? slug);
    case 'stream': return stream.episode(slug);
    default: return null;
  }
}

function extractDetail(source: ApiSource, raw: any) {
  if (!raw) return null;
  const d = raw.data ?? raw;
  return {
    title: d.title ?? d.name ?? '',
    poster: d.poster ?? d.image ?? d.thumbnail ?? '',
    synopsis: d.synopsis ?? d.description ?? d.sinopsis ?? '',
    genres: (Array.isArray(d.genres) ? d.genres : Array.isArray(d.genre) ? d.genre : []).map((g: any) => (typeof g === 'string' ? g : g?.name ?? g?.genreName ?? '')),
    status: d.status ?? '',
    score: d.score ?? d.rating ?? '',
    type: d.type ?? '',
    studio: d.studio ?? d.producer ?? '',
    episodes: extractEpisodes(source, d),
  };
}

function extractEpisodes(source: ApiSource, d: any): Array<{ title: string; slug: string; index?: number }> {
  let list: any[] = [];
  if (source === 'otakudesu') list = d.episodeList ?? d.episodes ?? [];
  else if (source === 'samehadaku') list = d.episodes ?? [];
  else if (source === 'donghua') list = d.episodes ?? d.episodeList ?? [];
  else if (source === 'drachin') list = d.episodes ?? [];
  else if (source === 'dramabox') list = d.episodeList ?? d.episodes ?? [];
  else list = d.episodeList ?? d.episodes ?? [];

  if (!Array.isArray(list)) return [];
  return list.map((e: any, i: number) => ({
    title: e.title ?? e.episodeTitle ?? e.episode ?? `Episode ${i + 1}`,
    slug: e.episodeId ?? e.href?.split('/').pop() ?? e.slug ?? e.id ?? String(i),
    index: i + 1,
  }));
}

export default function DetailScreen() {
  const params = useLocalSearchParams<Params>();
  const insets = useSafeAreaInsets();
  const source = params.source as ApiSource;
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();

  const { data: rawDetail, isLoading } = useQuery({
    queryKey: ['detail', source, params.slug],
    queryFn: () => fetchDetail(source, params.slug, params.extraId, params.bookId),
    staleTime: 10 * 60 * 1000,
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

  const handleEpisode = (ep: { title: string; slug: string; index?: number }) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/episode',
      params: {
        source,
        slug: ep.slug,
        title: ep.title,
        animeName: title,
        extraId: params.extraId ?? '',
        animeSlug: params.slug,
        episodeIndex: String(ep.index ?? 1),
      },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Poster with gradient header */}
        <View style={styles.posterWrap}>
          <Image source={{ uri: poster }} style={styles.poster} contentFit="cover" />
          <LinearGradient
            colors={['transparent', 'rgba(10,10,10,0.7)', '#0A0A0A']}
            style={styles.gradient}
          />
          {/* Back button */}
          <TouchableOpacity
            style={[styles.backBtn, { top: insets.top + 8 }]}
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={22} color="#FFF" />
          </TouchableOpacity>
          {/* Favorite button */}
          <TouchableOpacity
            style={[styles.favBtn, { top: insets.top + 8 }]}
            onPress={toggleFav}
          >
            <Feather name={favorited ? 'heart' : 'heart'} size={22} color={favorited ? '#EF4444' : '#FFF'} />
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={[styles.sourceBadge, { backgroundColor: badgeColor }]}>
            {SOURCE_LABELS[source] ?? source}
          </Text>
          <Text style={styles.title}>{title}</Text>

          {isLoading ? (
            <ActivityIndicator color="#8B00FF" style={{ marginTop: 20 }} />
          ) : detail ? (
            <>
              <View style={styles.metaRow}>
                {detail.score ? <Text style={styles.metaChip}>⭐ {detail.score}</Text> : null}
                {detail.status ? <Text style={styles.metaChip}>{detail.status}</Text> : null}
                {detail.type ? <Text style={styles.metaChip}>{detail.type}</Text> : null}
              </View>

              {detail.genres?.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.genreRow}>
                  {detail.genres.filter(Boolean).map((g: string, i: number) => (
                    <Text key={i} style={styles.genreChip}>{g}</Text>
                  ))}
                </ScrollView>
              )}

              {detail.synopsis ? (
                <>
                  <Text style={styles.sectionTitle}>Sinopsis</Text>
                  <Text style={styles.synopsis}>{detail.synopsis}</Text>
                </>
              ) : null}

              {detail.episodes?.length > 0 && (
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
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  backBtn: {
    position: 'absolute',
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  favBtn: {
    position: 'absolute',
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  info: { paddingHorizontal: 16, marginTop: -20 },
  sourceBadge: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginBottom: 8,
    overflow: 'hidden',
  },
  title: { color: '#FFF', fontSize: 22, fontWeight: '800', marginBottom: 10 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  metaChip: {
    color: '#9CA3AF',
    fontSize: 12,
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  genreRow: { marginBottom: 14 },
  genreChip: {
    color: '#8B00FF',
    fontSize: 11,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: '#8B00FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 16,
  },
  synopsis: { color: '#9CA3AF', fontSize: 13, lineHeight: 20 },
  epItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141414',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    gap: 10,
  },
  epIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(139,0,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  epTitle: { flex: 1, color: '#FFF', fontSize: 13, fontWeight: '500' },
});
