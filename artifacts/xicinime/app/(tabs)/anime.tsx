import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Dimensions, FlatList, Platform, ScrollView,
  StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { useState } from 'react';
import {
  otakudesu, samehadaku, animasu, kusonime, anoboy,
  oploverz, nimegami, alqanime, animekuindo,
} from '@/services/api';
import { AnimeCard } from '@/components/AnimeCard';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { ContentItem } from '@/types/api';

const { width: W } = Dimensions.get('window');
const CARD_W = (W - 16 * 2 - 10) / 2;
const CARD_H = CARD_W * 1.4;

type SourceKey =
  | 'otakudesu' | 'samehadaku' | 'animasu' | 'kusonime'
  | 'anoboy' | 'oploverz' | 'nimegami' | 'alqanime' | 'animekuindo';
type Category = 'Terbaru' | 'Ongoing' | 'Completed' | 'Movie' | 'Populer';

const SOURCES: { key: SourceKey; label: string }[] = [
  { key: 'otakudesu', label: 'Otakudesu' },
  { key: 'samehadaku', label: 'Samehadaku' },
  { key: 'animasu', label: 'Animasu' },
  { key: 'kusonime', label: 'Kusonime' },
  { key: 'anoboy', label: 'Anoboy' },
  { key: 'oploverz', label: 'Oploverz' },
  { key: 'nimegami', label: 'Nimegami' },
  { key: 'alqanime', label: 'Alqanime' },
  { key: 'animekuindo', label: 'Animekuindo' },
];

const CATEGORIES: Category[] = ['Terbaru', 'Ongoing', 'Completed', 'Movie', 'Populer'];

function norm(items: any[], source: ContentItem['source'], ct: ContentItem['contentType'], directToEpisode = false): ContentItem[] {
  if (!Array.isArray(items)) return [];
  return items
    .filter((i: any) => i?.title && (i?.poster || i?.image || i?.thumbnail))
    .map((i: any) => ({
      id: i.animeId ?? i.id ?? i.slug ?? i.title,
      title: String(i.title ?? '').trim(),
      poster: (i.poster ?? i.image ?? i.thumbnail ?? '').split('\t')[0].trim(),
      source,
      slug: i.animeId ?? i.id ?? i.slug ?? '',
      contentType: ct,
      episodes: i.episodes ?? i.episode ?? undefined,
      directToEpisode,
    }));
}

/** Extract the list array from any API response using source-specific field names */
function extractList(raw: any, source: SourceKey): any[] {
  if (!raw) return [];
  const d = raw.data ?? raw;
  switch (source) {
    case 'otakudesu':
      return d.animeList ?? d.ongoing?.animeList ?? d.completed?.animeList ?? [];
    case 'samehadaku':
      return d.animeList ?? [];
    case 'animasu':
      return d.animeList ?? d.ongoing ?? d.recent ?? d.results ?? (Array.isArray(d) ? d : []);
    case 'kusonime':
      return d.anime_list ?? d.animeList ?? (Array.isArray(d) ? d : []);
    case 'anoboy':
    case 'oploverz':
    case 'nimegami':
      return d.anime_list ?? d.animeList ?? (Array.isArray(d) ? d : []);
    case 'alqanime':
      return d.latest ?? d.ongoing ?? d.completed ?? d.movies ?? d.hot ?? d.animeList ?? [];
    case 'animekuindo':
      return Array.isArray(d) ? d : d.animeList ?? [];
    default:
      return d.animeList ?? d.anime_list ?? (Array.isArray(d) ? d : []);
  }
}

// Episode-level sources — tapping goes directly to player
// Only include sources that have a working episode fetch endpoint
const EPISODE_SOURCES = new Set<SourceKey>(['anoboy', 'oploverz']);

function useAnimeData(source: SourceKey, category: Category) {
  return useQuery({
    queryKey: ['anime-browse', source, category],
    queryFn: async (): Promise<ContentItem[]> => {
      let raw: any;
      const isDirect = EPISODE_SOURCES.has(source);
      const ct: ContentItem['contentType'] = category === 'Movie' ? 'movie' : 'anime';

      if (source === 'otakudesu') {
        if (category === 'Ongoing') raw = await otakudesu.ongoing();
        else if (category === 'Completed') raw = await otakudesu.complete();
        else raw = await otakudesu.ongoing();
      } else if (source === 'samehadaku') {
        if (category === 'Ongoing') raw = await samehadaku.ongoing();
        else if (category === 'Completed') raw = await samehadaku.completed();
        else if (category === 'Movie') raw = await samehadaku.movies();
        else if (category === 'Populer') raw = await samehadaku.popular();
        else raw = await samehadaku.ongoing();
      } else if (source === 'animasu') {
        if (category === 'Ongoing') raw = await animasu.ongoing();
        else if (category === 'Completed') raw = await animasu.completed();
        else if (category === 'Movie') raw = await animasu.movies();
        else if (category === 'Populer') raw = await animasu.popular();
        else raw = await animasu.home();
      } else if (source === 'kusonime') {
        if (category === 'Movie') raw = await kusonime.movie();
        else raw = await kusonime.latest();
      } else if (source === 'anoboy') {
        raw = await anoboy.home();
      } else if (source === 'oploverz') {
        if (category === 'Ongoing') raw = await oploverz.ongoing();
        else if (category === 'Completed') raw = await oploverz.completed();
        else raw = await oploverz.home();
      } else if (source === 'nimegami') {
        raw = await nimegami.home();
      } else if (source === 'alqanime') {
        if (category === 'Ongoing') raw = await alqanime.ongoing();
        else if (category === 'Completed') raw = await alqanime.completed();
        else if (category === 'Movie') raw = await alqanime.movie();
        else if (category === 'Populer') raw = await alqanime.popular();
        else raw = await alqanime.home();
      } else if (source === 'animekuindo') {
        raw = await animekuindo.home();
      }

      return norm(extractList(raw, source), source, ct, isDirect);
    },
    staleTime: 5 * 60 * 1000,
  });
}

export default function AnimeScreen() {
  const insets = useSafeAreaInsets();
  const [activeSource, setActiveSource] = useState<SourceKey>('otakudesu');
  const [activeCategory, setActiveCategory] = useState<Category>('Terbaru');
  const { data, isLoading } = useAnimeData(activeSource, activeCategory);
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <Text style={styles.screenTitle}>🎌 Anime</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsRow} contentContainerStyle={styles.tabsContent}>
        {SOURCES.map((s) => (
          <TouchableOpacity
            key={s.key}
            style={[styles.tab, activeSource === s.key && styles.tabActive]}
            onPress={() => { Haptics.selectionAsync(); setActiveSource(s.key); }}
          >
            <Text style={[styles.tabText, activeSource === s.key && styles.tabTextActive]}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catRow} contentContainerStyle={styles.tabsContent}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.catTab, activeCategory === cat && styles.catTabActive]}
            onPress={() => { Haptics.selectionAsync(); setActiveCategory(cat); }}
          >
            <Text style={[styles.catText, activeCategory === cat && styles.catTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {isLoading ? (
        <View style={styles.skeletonWrap}><SkeletonLoader count={6} width={CARD_W} height={CARD_H} /></View>
      ) : !data || data.length === 0 ? (
        <View style={styles.empty}>
          <Feather name="film" size={40} color="#1F1F1F" />
          <Text style={styles.emptyText}>Tidak ada konten</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item, i) => `${item.source}-${item.id}-${i}`}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <AnimeCard item={item} width={CARD_W} height={CARD_H} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  screenTitle: { color: '#FFF', fontSize: 20, fontWeight: '700', paddingHorizontal: 16, paddingVertical: 8 },
  tabsRow: { marginBottom: 4 },
  catRow: { marginBottom: 12 },
  tabsContent: { paddingHorizontal: 16, gap: 8 },
  tab: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#1A1A1A' },
  tabActive: { backgroundColor: '#8B00FF' },
  tabText: { color: '#9CA3AF', fontSize: 12, fontWeight: '600' },
  tabTextActive: { color: '#FFF' },
  catTab: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8, backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#1F1F1F' },
  catTabActive: { borderColor: '#FFB800', backgroundColor: 'rgba(255,184,0,0.1)' },
  catText: { color: '#9CA3AF', fontSize: 12, fontWeight: '600' },
  catTextActive: { color: '#FFB800' },
  skeletonWrap: { paddingLeft: 16, paddingTop: 8 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyText: { color: '#6B7280', fontSize: 14 },
  grid: { paddingHorizontal: 16, paddingBottom: 100 },
  row: { gap: 10, marginBottom: 10 },
});
